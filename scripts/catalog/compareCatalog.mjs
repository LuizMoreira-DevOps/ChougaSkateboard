import { readSanityProducts } from "./readSanityProducts.mjs";

const TARGET_SLUG = "camiseta-chouga-basic-branca";

function getDevelopmentConfig() {
    const rawUrl = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    const expectedRef = process.env.SUPABASE_DEV_PROJECT_REF;

    if (!rawUrl || !key || !expectedRef) {
        throw new Error(
            "Configure SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY " +
                "e SUPABASE_DEV_PROJECT_REF no .env.local.",
        );
    }

    if (!key.startsWith("sb_publishable_") && !key.startsWith("eyJ")) {
        throw new Error("Use somente uma chave pública do Supabase.");
    }

    const url = new URL(rawUrl);

    if (
        url.protocol !== "https:" ||
        url.hostname !== `${expectedRef}.supabase.co` ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
    ) {
        throw new Error(
            "A URL não corresponde ao projeto Development configurado.",
        );
    }

    return { url, key };
}

async function readSupabaseProduct(slug) {
    const { url: baseUrl, key } = getDevelopmentConfig();

    const url = new URL("/rest/v1/produtos_catalogo", baseUrl);

    url.searchParams.set(
        "select",
        "id,nome,slug,preco,categoria_slug,ativo,imagens,variacoes",
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
        throw new Error(
            `Erro na leitura do Supabase Development: HTTP ${response.status}`,
        );
    }

    const records = await response.json();

    if (!Array.isArray(records)) {
        throw new Error("Resposta inesperada do Supabase.");
    }

    if (records.length > 1) {
        throw new Error(`Slug duplicado: ${slug}`);
    }

    return records[0] ?? null;
}

function compareProducts(sanity, supabase) {
    const currentPrice = Number(supabase.preco);

    if (!Number.isFinite(currentPrice)) {
        throw new Error("Preço inválido no Supabase.");
    }

    const differences = [];

    if (sanity.price !== currentPrice) {
        differences.push({
            campo: "Preço",
            atual: currentPrice,
            proposto: sanity.price,
            acao: "Revisar antes de atualizar",
        });
    }

    if (sanity.categorySlug !== supabase.categoria_slug) {
        differences.push({
            campo: "Categoria",
            atual: supabase.categoria_slug,
            proposto: sanity.categorySlug,
            acao: "Preservar até definir mapeamento",
        });
    }

    const existingVariants = supabase.variacoes ?? [];
    const existingSkus = new Set(
        existingVariants.map((variant) => variant.sku),
    );

    const sanitySkus = new Set(sanity.variants.map((variant) => variant.sku));

    return {
        productId: supabase.id,
        differences,

        newSkus: [...sanitySkus].filter((sku) => !existingSkus.has(sku)),

        existingSkusNotInSanity: [...existingSkus].filter(
            (sku) => !sanitySkus.has(sku),
        ),

        currentVariants: existingVariants.map((variant) => ({
            sku: variant.sku,
            stock: variant.estoque,
        })),

        images: {
            sanity: sanity.images.length,
            supabase: (supabase.imagens ?? []).length,
        },
    };
}

async function main() {
    // Verificar a configuração ANTES das consultas.
    getDevelopmentConfig();

    console.log("CHOUGA | CONCILIAÇÃO DEVELOPMENT");
    console.log("Sanity: development");
    console.log("Supabase: development");
    console.log("Modo: SOMENTE LEITURA\n");

    const sanityProducts = await readSanityProducts();

    const sanityProduct = sanityProducts.find(
        (product) => product.slug === TARGET_SLUG,
    );

    if (!sanityProduct) {
        throw new Error("Produto não encontrado no Sanity.");
    }

    const supabaseProduct = await readSupabaseProduct(TARGET_SLUG);

    if (!supabaseProduct) {
        throw new Error("Produto não encontrado no Supabase Development.");
    }

    const report = compareProducts(sanityProduct, supabaseProduct);

    console.log("Produto:", sanityProduct.name);
    console.log("UUID Development:", report.productId);

    console.log("\nDIFERENÇAS:");
    console.table(report.differences);

    console.log("\nSKUs NOVOS NO SANITY:");
    console.log(report.newSkus);

    console.log("\nSKUs EXISTENTES APENAS NO SUPABASE:");
    console.log(report.existingSkusNotInSanity);

    console.log("\nESTOQUE ATUAL NO DEVELOPMENT:");
    console.table(report.currentVariants);

    console.log("\nIMAGENS:");
    console.log(report.images);

    console.log("\nNenhuma operação de escrita executada.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
