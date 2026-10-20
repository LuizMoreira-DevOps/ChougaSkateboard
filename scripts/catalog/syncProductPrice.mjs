import { readSanityProducts } from "./readSanityProducts.mjs";

const DEV_PROJECT_REF = "yyxjuaopcvaurzcrcojk";

const PRODUCT_ID = "7ae210ca-ef57-4ecd-8e9e-a4e6f6589d7a";
const PRODUCT_SLUG = "camiseta-chouga-basic-branca";

const EXPECTED_OLD_PRICE = 100;
const EXPECTED_NEW_PRICE = 90;

const args = process.argv.slice(2);

if (args.some((arg) => arg !== "--apply")) {
    throw new Error("Argumento desconhecido.");
}

const apply = args.includes("--apply");

function getConfig() {
    const url = new URL(process.env.SUPABASE_URL ?? "");
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;

    if (
        DEV_PROJECT_REF.startsWith("COLE_AQUI") ||
        url.protocol !== "https:" ||
        url.hostname !== `${DEV_PROJECT_REF}.supabase.co` ||
        url.pathname !== "/" ||
        url.search ||
        url.hash
    ) {
        throw new Error(
            "Projeto Supabase diferente do Development autorizado.",
        );
    }

    if (!key || !(key.startsWith("sb_publishable_") || key.startsWith("eyJ"))) {
        throw new Error("Chave pública inválida ou ausente.");
    }

    return { url, key };
}

async function requestProduct(baseUrl, key) {
    const url = new URL("/rest/v1/produtos_catalogo", baseUrl);

    url.searchParams.set("select", "id,slug,preco,variacoes");
    url.searchParams.set("id", `eq.${PRODUCT_ID}`);
    url.searchParams.set("slug", `eq.${PRODUCT_SLUG}`);

    const response = await fetch(url, {
        headers: { apikey: key },
    });

    if (!response.ok) {
        throw new Error(`Leitura Supabase: HTTP ${response.status}`);
    }

    const records = await response.json();

    if (!Array.isArray(records) || records.length !== 1) {
        throw new Error("Produto esperado não encontrado.");
    }

    return records[0];
}

async function updatePrice(baseUrl, secretKey) {
    const url = new URL("/rest/v1/produtos", baseUrl);

    // Atualização condicionada ao UUID, slug e preço anterior.
    url.searchParams.set("id", `eq.${PRODUCT_ID}`);
    url.searchParams.set("slug", `eq.${PRODUCT_SLUG}`);
    url.searchParams.set("preco", `eq.${EXPECTED_OLD_PRICE}`);
    url.searchParams.set("select", "id,slug,preco");

    const response = await fetch(url, {
        method: "PATCH",
        headers: {
            apikey: secretKey,
            "Content-Type": "application/json",
            Prefer: "return=representation",
        },
        body: JSON.stringify({
            preco: EXPECTED_NEW_PRICE,
        }),
    });

    if (!response.ok) {
        throw new Error(`Atualização Supabase: HTTP ${response.status}`);
    }

    const records = await response.json();

    if (!Array.isArray(records) || records.length !== 1) {
        throw new Error(
            "Nenhum produto atualizado. Verifique se os dados mudaram.",
        );
    }

    return records[0];
}

async function main() {
    const { url, key } = getConfig();

    console.log("CHOUGA | SINCRONIZAÇÃO DE PREÇO");
    console.log(`Modo: ${apply ? "APLICAÇÃO" : "DRY-RUN"}`);

    const sanityProducts = await readSanityProducts();

    const sanity = sanityProducts.find(
        (product) => product.slug === PRODUCT_SLUG,
    );

    if (!sanity || !sanity.active) {
        throw new Error("Produto ativo não encontrado no Sanity.");
    }

    const current = await requestProduct(url, key);
    const currentPrice = Number(current.preco);

    console.log("Produto:", PRODUCT_SLUG);
    console.log("UUID:", current.id);
    console.log("Preço atual:", currentPrice);
    console.log("Preço no Sanity:", sanity.price);
    console.log("Variações atuais:", current.variacoes);

    if (sanity.price !== EXPECTED_NEW_PRICE) {
        throw new Error(
            "O preço publicado no Sanity não corresponde ao teste autorizado.",
        );
    }

    if (currentPrice === sanity.price) {
        console.log("\nPRODUTO JÁ SINCRONIZADO");
        console.log("Preço:", currentPrice);
        console.log("Nenhuma escrita necessária.");
        return;
    }

    if (currentPrice !== EXPECTED_OLD_PRICE) {
        throw new Error("Preço atual inesperado. Atualização bloqueada.");
    }

    if (!apply) {
        console.log("\nDRY-RUN CONCLUÍDO.");
        console.log("Alteração proposta: R$ 100 → R$ 90.");
        console.log("Nenhuma escrita realizada.");
        return;
    }

    const secretKey = process.env.SUPABASE_SECRET_KEY;

    if (!secretKey?.startsWith("sb_secret_")) {
        throw new Error("SUPABASE_SECRET_KEY de desenvolvimento ausente.");
    }

    const expectedVariants = (current.variacoes ?? [])
        .map(({ sku, estoque, cor, tamanho, ativo }) => ({
            sku,
            estoque,
            cor,
            tamanho,
            ativo,
        }))
        .sort((a, b) => a.sku.localeCompare(b.sku));

    const updated = await updatePrice(url, secretKey);

    const verified = await requestProduct(url, key);

    const actualVariants = (verified.variacoes ?? [])
        .map(({ sku, estoque, cor, tamanho, ativo }) => ({
            sku,
            estoque,
            cor,
            tamanho,
            ativo,
        }))
        .sort((a, b) => a.sku.localeCompare(b.sku));

    if (Number(verified.preco) !== sanity.price) {
        throw new Error("Verificação falhou: preço inesperado.");
    }

    if (JSON.stringify(expectedVariants) !== JSON.stringify(actualVariants)) {
        throw new Error(
            "ALERTA: as variações foram modificadas. Investigar imediatamente.",
        );
    }

    console.log("\nSINCRONIZAÇÃO CONFIRMADA");
    console.log("Preço atualizado:", updated.preco);
    console.log("Estoque e variações preservados.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
