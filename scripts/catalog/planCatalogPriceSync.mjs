import { readSanityProducts } from "./readSanityProducts.mjs";

const args = process.argv.slice(2);

if (args.length > 1 || (args.length === 1 && !args[0].startsWith("--slug="))) {
    throw new Error("Uso: node planCatalogPriceSync.mjs [--slug=produto]");
}

const targetSlug = args[0]?.slice("--slug=".length) ?? null;

function validateSlug(slug) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new Error(`Slug inválido: ${slug}`);
    }
}

if (targetSlug !== null) {
    validateSlug(targetSlug);
}

function getDevelopmentConfig() {
    const rawUrl = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    const projectRef = process.env.SUPABASE_DEV_PROJECT_REF;

    if (!rawUrl || !key || !projectRef) {
        throw new Error("Configuração do Supabase Development incompleta.");
    }

    const url = new URL(rawUrl);

    if (
        url.protocol !== "https:" ||
        url.hostname !== `${projectRef}.supabase.co` ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
    ) {
        throw new Error(
            "URL incompatível com o projeto Development configurado.",
        );
    }

    if (!key.startsWith("sb_publishable_") && !key.startsWith("eyJ")) {
        throw new Error("Utilize uma chave pública do Supabase.");
    }

    return { url, key };
}

async function findSupabaseProduct(baseUrl, key, slug) {
    validateSlug(slug);

    const url = new URL("/rest/v1/produtos_catalogo", baseUrl);

    url.searchParams.set(
        "select",
        "id,nome,slug,preco,categoria_slug,imagens,variacoes",
    );

    url.searchParams.set("slug", `eq.${slug}`);
    url.searchParams.set("limit", "2");

    const response = await fetch(url, {
        method: "GET",
        headers: {
            apikey: key,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Falha ao consultar ${slug}: HTTP ${response.status}`);
    }

    const records = await response.json();

    if (!Array.isArray(records)) {
        throw new Error("Resposta inesperada do Supabase.");
    }

    if (records.length > 1) {
        throw new Error(`Slug duplicado no Supabase: ${slug}`);
    }

    return records[0] ?? null;
}

function compareProduct(sanity, supabase) {
    if (!supabase) {
        return {
            slug: sanity.slug,
            status: "AUSENTE_NO_SUPABASE",
            precoAtual: null,
            precoSanity: sanity.price,
            avisos: "Requer conciliação antes de cadastrar",
        };
    }

    const currentPrice = Number(supabase.preco);

    if (!Number.isFinite(currentPrice)) {
        throw new Error(`Preço inválido: ${sanity.slug}`);
    }

    const sanitySkus = new Set(sanity.variants.map((variant) => variant.sku));

    const supabaseSkus = new Set(
        (supabase.variacoes ?? []).map((variant) => variant.sku),
    );

    const sameSkus =
        sanitySkus.size === supabaseSkus.size &&
        [...sanitySkus].every((sku) => supabaseSkus.has(sku));

    const warnings = [];

    if (sanity.categorySlug !== supabase.categoria_slug) {
        warnings.push("Categoria divergente");
    }

    if (!sameSkus) {
        warnings.push("SKUs divergentes");
    }

    if (sanity.images.length !== (supabase.imagens ?? []).length) {
        warnings.push("Quantidade de imagens divergente");
    }

    return {
        slug: sanity.slug,
        status:
            currentPrice === sanity.price
                ? "PRECO_ATUALIZADO"
                : "ATUALIZACAO_PROPOSTA",
        precoAtual: currentPrice,
        precoSanity: sanity.price,
        avisos: warnings.join("; ") || "Nenhum",
    };
}

async function main() {
    const { url, key } = getDevelopmentConfig();

    console.log("CHOUGA | PLANEJAMENTO DO CATÁLOGO");
    console.log("Sanity: development");
    console.log("Supabase: development");
    console.log("Modo: SOMENTE LEITURA\n");

    const allProducts = await readSanityProducts();

    const products = allProducts.filter(
        (product) =>
            product.active &&
            (targetSlug === null || product.slug === targetSlug),
    );

    if (products.length === 0) {
        throw new Error("Nenhum produto ativo encontrado.");
    }

    const seenSlugs = new Set();
    const reports = [];

    for (const product of products) {
        validateSlug(product.slug);

        if (seenSlugs.has(product.slug)) {
            throw new Error(`Slug duplicado no Sanity: ${product.slug}`);
        }

        seenSlugs.add(product.slug);

        const existing = await findSupabaseProduct(url, key, product.slug);

        reports.push(compareProduct(product, existing));
    }

    console.table(reports);

    console.log("\nRESUMO");

    console.log("Produtos analisados:", reports.length);

    console.log(
        "Preços já atualizados:",
        reports.filter((item) => item.status === "PRECO_ATUALIZADO").length,
    );

    console.log(
        "Atualizações propostas:",
        reports.filter((item) => item.status === "ATUALIZACAO_PROPOSTA").length,
    );

    console.log(
        "Produtos ausentes:",
        reports.filter((item) => item.status === "AUSENTE_NO_SUPABASE").length,
    );

    console.log("\nNenhuma escrita realizada.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
