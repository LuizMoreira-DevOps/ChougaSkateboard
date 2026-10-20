import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ID = "esjkriae";
const DATASET = "development";
const API_VERSION = "2026-10-19";

const QUERY = `
  *[_type == "product"] {
    _id,
    nome,
    "slug": slug.current,
    descricao,
    preco,
    precoPromocional,
    categoriaSlug,
    marcaSlug,
    ativo,
    destaque,
    descricaoDetalhada,
    inspiracao,
    caracteristicas,
    composicao,
    cuidados,
    tipoModelagem,
    tamanhoModelo,
    alturaModeloCm,
    medidasModelo,
    observacoesAdicionais,
    tipoGuiaMedidas,
    "tags": tags[]{nome, slug},
    "imagens": imagens[]{
      _key,
      "url": asset->url,
      alt,
      cor,
      corSlug,
      principal
    },
    "variacoes": variacoes[]{
      _key,
      sku,
      cor,
      corSlug,
      tamanho,
      tamanhoSlug,
      ativo
    }
  }
`;

function requiredText(value, field, id) {
    if (typeof value !== "string" || !value.trim()) {
        throw new Error(`Produto ${id}: ${field} inválido`);
    }
    return value.trim();
}

function optionalText(value) {
    return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeProduct(raw) {
    const id = requiredText(raw._id, "_id", "desconhecido");

    if (
        typeof raw.preco !== "number" ||
        !Number.isFinite(raw.preco) ||
        raw.preco <= 0
    ) {
        throw new Error(`Produto ${id}: preço inválido`);
    }

    const promotionalPrice = raw.precoPromocional ?? null;

    if (
        promotionalPrice !== null &&
        (typeof promotionalPrice !== "number" ||
            !Number.isFinite(promotionalPrice) ||
            promotionalPrice < 0 ||
            promotionalPrice >= raw.preco)
    ) {
        throw new Error(`Produto ${id}: preço promocional inválido`);
    }

    const images = (raw.imagens ?? []).map((image, index) => ({
        id: image._key ?? null,
        url: requiredText(image.url, "imagem.url", id),
        alt: requiredText(image.alt, "imagem.alt", id),
        color: optionalText(image.cor),
        colorSlug: optionalText(image.corSlug),
        isPrimary: image.principal === true,
        order: index + 1,
    }));

    if (images.length && !images.some((image) => image.isPrimary)) {
        images[0].isPrimary = true;
    }

    return {
        sanityId: id,
        slug: requiredText(raw.slug, "slug", id),
        name: requiredText(raw.nome, "nome", id),
        description: optionalText(raw.descricao),
        price: raw.preco,
        promotionalPrice,
        categorySlug: requiredText(raw.categoriaSlug, "categoriaSlug", id),
        brandSlug: optionalText(raw.marcaSlug),
        active: raw.ativo === true,
        featured: raw.destaque === true,

        detailedDescription: optionalText(raw.descricaoDetalhada),
        inspiration: optionalText(raw.inspiracao),
        characteristics: Array.isArray(raw.caracteristicas)
            ? raw.caracteristicas.filter(
                  (item) => typeof item === "string" && item.trim(),
              )
            : [],
        composition: optionalText(raw.composicao),
        care: optionalText(raw.cuidados),
        fitType: optionalText(raw.tipoModelagem),
        modelSize: optionalText(raw.tamanhoModelo),
        modelHeightCm: raw.alturaModeloCm ?? null,
        modelMeasurements: optionalText(raw.medidasModelo),
        additionalNotes: optionalText(raw.observacoesAdicionais),
        sizeGuideType: optionalText(raw.tipoGuiaMedidas),

        tags: (raw.tags ?? []).map((tag) => ({
            name: requiredText(tag.nome, "tag.nome", id),
            slug: requiredText(tag.slug, "tag.slug", id),
        })),

        images,

        variants: (raw.variacoes ?? []).map((variant) => ({
            sku: requiredText(variant.sku, "variacao.sku", id),
            color: requiredText(variant.cor, "variacao.cor", id),
            colorSlug: optionalText(variant.corSlug),
            size: requiredText(variant.tamanho, "variacao.tamanho", id),
            sizeSlug: optionalText(variant.tamanhoSlug),
            active: variant.ativo !== false,
        })),
    };
}

export async function readSanityProducts() {
    const url = new URL(
        `https://${PROJECT_ID}.api.sanity.io/v${API_VERSION}/data/query/${DATASET}`,
    );

    url.searchParams.set("query", QUERY);
    url.searchParams.set("perspective", "published");

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Sanity: HTTP ${response.status}`);
    }

    const payload = await response.json();

    if (!Array.isArray(payload.result)) {
        throw new Error("Resposta inesperada do Sanity");
    }

    return payload.result.map(normalizeProduct);
}

const directExecution =
    process.argv[1] &&
    fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (directExecution) {
    try {
        const products = await readSanityProducts();
        console.log(`Produtos consultados: ${products.length}`);
        console.table(
            products.map((product) => ({
                nome: product.name,
                slug: product.slug,
                preco: product.price,
                marca: product.brandSlug,
                imagens: product.images.length,
                variacoes: product.variants.length,
            })),
        );
    } catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
}
