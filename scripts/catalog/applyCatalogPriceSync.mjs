import { readSanityProducts } from "./readSanityProducts.mjs";

// Copie o identificador do projeto Development,
// conferido diretamente no painel do Supabase.
const DEV_PROJECT_REF = "yyxjuaopcvaurzcrcojk";

const args = process.argv.slice(2);
const slugArgs = args.filter((arg) => arg.startsWith("--slug="));
const apply = args.includes("--apply");
const confirmed = args.includes("--confirm-dev-write");

if (
    slugArgs.length !== 1 ||
    args.some(
        (arg) =>
            !arg.startsWith("--slug=") &&
            arg !== "--apply" &&
            arg !== "--confirm-dev-write",
    ) ||
    (confirmed && !apply) ||
    (apply && !confirmed)
) {
    throw new Error("Uso: --slug=produto [--apply --confirm-dev-write]");
}

const slug = slugArgs[0].slice("--slug=".length);

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Slug inválido.");
}

function getConfig() {
    const rawUrl = process.env.SUPABASE_URL;
    const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    const configuredRef = process.env.SUPABASE_DEV_PROJECT_REF;

    if (!rawUrl || !publicKey || !configuredRef) {
        throw new Error("Configuração Development incompleta.");
    }

    if (
        DEV_PROJECT_REF.startsWith("COLE_AQUI") ||
        configuredRef !== DEV_PROJECT_REF
    ) {
        throw new Error("Identificador Development não confirmado.");
    }

    const url = new URL(rawUrl);

    if (
        url.protocol !== "https:" ||
        url.hostname !== `${DEV_PROJECT_REF}.supabase.co` ||
        url.pathname !== "/" ||
        url.search ||
        url.hash ||
        url.port ||
        url.username ||
        url.password
    ) {
        throw new Error("Destino Supabase não autorizado.");
    }

    if (
        !publicKey.startsWith("sb_publishable_") &&
        !publicKey.startsWith("eyJ")
    ) {
        throw new Error("Chave pública inválida.");
    }

    return { url, publicKey };
}

async function readSupabaseProduct(baseUrl, key) {
    const url = new URL("/rest/v1/produtos_catalogo", baseUrl);

    url.searchParams.set("select", "id,slug,preco,ativo,variacoes");
    url.searchParams.set("slug", `eq.${slug}`);
    url.searchParams.set("limit", "2");

    const response = await fetch(url, {
        method: "GET",
        headers: { apikey: key },
    });

    if (!response.ok) {
        throw new Error(`Leitura falhou: HTTP ${response.status}`);
    }

    const records = await response.json();

    if (!Array.isArray(records) || records.length !== 1) {
        throw new Error("Produto não encontrado ou resultado ambíguo.");
    }

    return records[0];
}

function variantSnapshot(product) {
    return (product.variacoes ?? [])
        .map(({ sku, estoque, cor, tamanho, ativo }) => ({
            sku,
            estoque,
            cor,
            tamanho,
            ativo,
        }))
        .sort((a, b) => a.sku.localeCompare(b.sku));
}

async function updatePrice(baseUrl, secretKey, product, oldPrice, newPrice) {
    const url = new URL("/rest/v1/produtos", baseUrl);

    // Condições para evitar atualização de um registro
    // diferente ou cujo preço mudou desde a leitura.
    url.searchParams.set("id", `eq.${product.id}`);
    url.searchParams.set("slug", `eq.${slug}`);
    url.searchParams.set("preco", `eq.${oldPrice}`);
    url.searchParams.set("select", "id,slug,preco");

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            apikey: secretKey,
            "Content-Type": "application/json",
            Prefer: "return=representation",
        },
        body: JSON.stringify({ preco: newPrice }),
    });

    if (!response.ok) {
        throw new Error(`Atualização falhou: HTTP ${response.status}`);
    }

    const records = await response.json();

    if (!Array.isArray(records) || records.length !== 1) {
        throw new Error(
            "Atualização não confirmada. Verifique o banco antes de repetir.",
        );
    }
}

async function main() {
    const { url, publicKey } = getConfig();

    console.log("CHOUGA | SINCRONIZAÇÃO GENÉRICA");
    console.log(`Modo: ${apply ? "APLICAÇÃO" : "DRY-RUN"}`);
    console.log("Projeto: Development\n");

    const sanityMatches = (await readSanityProducts()).filter(
        (product) => product.slug === slug,
    );

    if (sanityMatches.length !== 1 || !sanityMatches[0].active) {
        throw new Error("Produto ativo não encontrado unicamente no Sanity.");
    }

    const sanity = sanityMatches[0];
    const current = await readSupabaseProduct(url, publicKey);
    const oldPrice = Number(current.preco);

    if (!Number.isFinite(oldPrice) || oldPrice <= 0) {
        throw new Error("Preço atual inválido.");
    }

    if (!Number.isFinite(sanity.price) || sanity.price <= 0) {
        throw new Error("Preço do Sanity inválido.");
    }

    console.log("Produto:", sanity.name);
    console.log("UUID Development:", current.id);
    console.log("Preço Supabase:", oldPrice);
    console.log("Preço Sanity:", sanity.price);
    console.log("Variações:", variantSnapshot(current));

    if (oldPrice === sanity.price) {
        console.log("\nPreço já sincronizado. Nenhuma escrita.");
        return;
    }

    if (!apply) {
        console.log("\nDRY-RUN CONCLUÍDO");
        console.log(`Preço proposto: ${oldPrice} → ${sanity.price}`);
        console.log("Nenhuma escrita realizada.");
        return;
    }

    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!secretKey?.startsWith("sb_secret_")) {
        throw new Error("Chave secreta Development ausente.");
    }

    const before = variantSnapshot(current);

    await updatePrice(url, secretKey, current, oldPrice, sanity.price);

    const afterProduct = await readSupabaseProduct(url, publicKey);
    const after = variantSnapshot(afterProduct);

    if (
        afterProduct.id !== current.id ||
        Number(afterProduct.preco) !== sanity.price ||
        JSON.stringify(before) !== JSON.stringify(after)
    ) {
        throw new Error(
            "ALERTA: verificação posterior falhou. " +
                "Confira o banco antes de qualquer nova tentativa.",
        );
    }

    console.log("\nSINCRONIZAÇÃO CONFIRMADA");
    console.log("Novo preço:", afterProduct.preco);
    console.log("SKUs e estoque preservados.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
