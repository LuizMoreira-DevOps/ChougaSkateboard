import { readSanityProducts } from "./readSanityProducts.mjs";

// Conferir este identificador diretamente no painel
// do Supabase Development, nunca no de produção.
const DEV_PROJECT_REF = "yyxjuaopcvaurzcrcojk";

const args = process.argv.slice(2);
const slugArgs = args.filter((arg) => arg.startsWith("--slug="));
const all = args.includes("--all");
const apply = args.includes("--apply");
const confirmed = args.includes("--confirm-dev-write");

const allowed = new Set(["--all", "--apply", "--confirm-dev-write"]);

if (
    args.some((arg) => !allowed.has(arg) && !arg.startsWith("--slug=")) ||
    slugArgs.length > 1 ||
    Number(all) + slugArgs.length !== 1 ||
    (apply && (!confirmed || all)) ||
    (confirmed && !apply)
) {
    throw new Error(
        "Uso: --all OU --slug=produto [--apply --confirm-dev-write]",
    );
}

const targetSlug = slugArgs[0]?.slice("--slug=".length) ?? null;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validSlug(value) {
    if (typeof value !== "string" || !SLUG_PATTERN.test(value)) {
        throw new Error(`Slug inválido: ${value}`);
    }

    return value;
}

function slugify(value) {
    return String(value)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

function config() {
    const rawUrl = process.env.SUPABASE_URL;
    const publicKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    const configuredRef = process.env.SUPABASE_DEV_PROJECT_REF;

    if (
        !rawUrl ||
        !publicKey ||
        !configuredRef ||
        DEV_PROJECT_REF.startsWith("COLE_AQUI") ||
        configuredRef !== DEV_PROJECT_REF
    ) {
        throw new Error("Configuração Development incompleta");
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
        throw new Error("Destino Supabase não autorizado");
    }

    if (
        !publicKey.startsWith("sb_publishable_") &&
        !publicKey.startsWith("eyJ")
    ) {
        throw new Error("Chave pública inválida");
    }

    const secret = apply ? process.env.SUPABASE_SECRET_KEY : null;

    if (apply && !secret?.startsWith("sb_secret_")) {
        throw new Error("Chave secreta Development ausente");
    }

    return { url, publicKey, secret };
}

async function readRows(ctx, table, filters = {}) {
    const url = new URL(`/rest/v1/${table}`, ctx.url);

    url.searchParams.set("select", "*");

    for (const [field, value] of Object.entries(filters)) {
        url.searchParams.set(field, `eq.${value}`);
    }

    const response = await fetch(url, {
        method: "GET",
        headers: {
            apikey: ctx.secret ?? ctx.publicKey,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Leitura ${table}: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
        throw new Error(`Resposta inválida: ${table}`);
    }

    return data;
}

async function readOne(ctx, table, filters) {
    const records = await readRows(ctx, table, filters);

    if (records.length > 1) {
        throw new Error(`Resultado ambíguo: ${table}`);
    }

    return records[0] ?? null;
}

async function resolveReference(ctx, table, slug) {
    const record = await readOne(ctx, table, {
        slug: validSlug(slug),
    });

    if (!record || record.ativo !== true) {
        throw new Error(`Registro inexistente ou inativo: ${table}/${slug}`);
    }

    return record.id;
}

function buildFields(product, categoryId, brandId) {
    return {
        nome: product.name,
        slug: product.slug,
        descricao: product.description,
        preco: product.price,
        preco_promocional: product.promotionalPrice,
        categoria_id: categoryId,
        marca_id: brandId,
        destaque: product.featured,
        ativo: product.active,
        descricao_detalhada: product.detailedDescription,
        inspiracao: product.inspiration,
        caracteristicas: product.characteristics,
        composicao: product.composition,
        cuidados: product.care,
        tipo_modelagem: product.fitType,
        tamanho_modelo: product.modelSize,
        altura_modelo_cm: product.modelHeightCm,
        medidas_modelo: product.modelMeasurements,
        observacoes_adicionais: product.additionalNotes,
        tipo_guia_medidas: product.sizeGuideType,
    };
}

async function prepare(ctx, product) {
    validSlug(product.slug);

    const [current, categoryId, brandId] = await Promise.all([
        readOne(ctx, "produtos", { slug: product.slug }),
        resolveReference(ctx, "categorias", product.categorySlug),
        resolveReference(ctx, "marcas", product.brandSlug),
    ]);

    const images = [];

    for (const image of product.images) {
        const imageUrl = new URL(image.url);

        if (
            imageUrl.protocol !== "https:" ||
            imageUrl.hostname !== "cdn.sanity.io" ||
            !imageUrl.pathname.startsWith("/images/esjkriae/development/")
        ) {
            throw new Error("Imagem fora do Sanity Development");
        }

        const colorSlug =
            image.colorSlug || (image.color ? slugify(image.color) : null);

        const colorId = colorSlug
            ? await resolveReference(ctx, "cores", colorSlug)
            : null;

        images.push({
            url: image.url,
            alt_text: image.alt,
            ordem: image.order,
            principal: image.isPrimary,
            cor_id: colorId,
        });
    }

    const variants = [];
    const seenSkus = new Set();
    const seenCombinations = new Set();

    for (const variant of product.variants) {
        if (seenSkus.has(variant.sku)) {
            throw new Error(`SKU repetido: ${variant.sku}`);
        }

        seenSkus.add(variant.sku);

        const colorSlug = validSlug(
            variant.colorSlug || slugify(variant.color),
        );

        const sizeSlug = validSlug(variant.sizeSlug || slugify(variant.size));

        const [colorId, sizeId] = await Promise.all([
            resolveReference(ctx, "cores", colorSlug),
            resolveReference(ctx, "tamanhos", sizeSlug),
        ]);

        const combination = `${colorId}:${sizeId}`;

        if (seenCombinations.has(combination)) {
            throw new Error(
                `Combinação de cor/tamanho duplicada: ${variant.sku}`,
            );
        }

        seenCombinations.add(combination);

        variants.push({
            sku: variant.sku,
            cor_id: colorId,
            tamanho_id: sizeId,
            ativo: variant.active,
            // Estoque não vem do Sanity.
        });
    }

    const tags = product.tags.map((tag) => ({
        nome: tag.name,
        slug: validSlug(tag.slug),
    }));

    return {
        current,
        payload: {
            fields: buildFields(product, categoryId, brandId),
            images,
            variants,
            tags,
        },
    };
}

async function applyTransaction(ctx, prepared) {
    const url = new URL("/rest/v1/rpc/sync_catalog_product_dev", ctx.url);

    const current = prepared.current;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            apikey: ctx.secret,
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            p_payload: prepared.payload,
            p_expected_id: current?.id ?? null,
            p_expected_price:
                current?.preco == null ? null : Number(current.preco),
            p_expected_updated_at: current?.atualizado_em ?? null,
        }),
    });

    if (!response.ok) {
        const detail = await response.text();

        throw new Error(
            `Sincronização transacional: HTTP ${response.status}\n${detail}`,
        );
    }

    return response.json();
}

async function synchronize(ctx, product) {
    if (!apply && !product.active) {
        console.log(
            `\n${product.slug}: produto inativo; ` +
                "planejamento público não consegue verificar " +
                "com segurança registros ocultos por RLS.",
        );
        return;
    }

    const prepared = await prepare(ctx, product);
    const current = prepared.current;

    console.log(`\nPRODUTO: ${product.name}`);
    console.log("Slug:", product.slug);
    console.log("Situação:", current ? "Existente" : "Novo");
    console.log("Preço atual:", current?.preco ?? "Não cadastrado");
    console.log("Preço Sanity:", product.price);
    console.log("Imagens informadas:", prepared.payload.images.length);
    console.log("Variações informadas:", prepared.payload.variants.length);
    console.log("Tags informadas:", prepared.payload.tags.length);

    if (!apply) {
        console.log(
            "DRY-RUN: dados preparados. " +
                "Conflitos finais serão verificados pela transação.",
        );
        console.log("Nenhuma escrita realizada.");
        return;
    }

    const beforeVariants = current
        ? await readRows(ctx, "variacoes_produto", {
              produto_id: current.id,
          })
        : [];

    const result = await applyTransaction(ctx, prepared);

    // Conferência posterior. Uma falha nesta etapa não
    // desfaz uma transação já confirmada pela RPC.
    const verified = await readOne(ctx, "produtos", {
        id: result.product_id,
    });

    if (
        !verified ||
        verified.slug !== product.slug ||
        Number(verified.preco) !== product.price
    ) {
        throw new Error(
            "Verificação posterior falhou. " +
                "Consulte o banco antes de repetir.",
        );
    }

    const afterVariants = await readRows(ctx, "variacoes_produto", {
        produto_id: result.product_id,
    });

    for (const previous of beforeVariants) {
        const currentVariant = afterVariants.find(
            (variant) => variant.id === previous.id,
        );

        if (
            !currentVariant ||
            currentVariant.sku !== previous.sku ||
            currentVariant.estoque !== previous.estoque ||
            currentVariant.cor_id !== previous.cor_id ||
            currentVariant.tamanho_id !== previous.tamanho_id
        ) {
            throw new Error(
                "ALERTA: variação existente modificada. " +
                    "Consulte o banco antes de repetir.",
            );
        }
    }

    console.log("TRANSAÇÃO CONFIRMADA");
    console.log(result);
    console.log("Estoque e SKUs anteriores preservados.");
}

async function main() {
    const ctx = config();

    console.log("CHOUGA | CATÁLOGO TRANSACIONAL");
    console.log(`Modo: ${apply ? "APLICAÇÃO" : "DRY-RUN"}`);
    console.log("Destino: Supabase Development");

    const products = (await readSanityProducts()).filter(
        (product) => targetSlug === null || product.slug === targetSlug,
    );

    if (!products.length) {
        throw new Error("Nenhum produto encontrado no Sanity");
    }

    const slugs = new Set();

    for (const product of products) {
        if (slugs.has(product.slug)) {
            throw new Error(`Slug duplicado: ${product.slug}`);
        }

        slugs.add(product.slug);
    }

    for (const product of products) {
        await synchronize(ctx, product);
    }

    console.log("\nPROCESSAMENTO CONCLUÍDO");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
