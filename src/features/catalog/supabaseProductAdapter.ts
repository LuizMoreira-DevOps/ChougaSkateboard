import type { Product, ProductImage, ProductVariant } from "./product";

type CatalogRow = Record<string, unknown>;

function text(value: unknown): string {
    return typeof value === "string" ? value.trim() : "";
}

function numeric(value: unknown): number | null {
    if (value === null || value === undefined || value === "") {
        return null;
    }

    const result = Number(value);
    return Number.isFinite(result) ? result : null;
}

function objects(value: unknown): CatalogRow[] {
    if (!Array.isArray(value)) return [];

    return value.filter(
        (item): item is CatalogRow =>
            item !== null && typeof item === "object" && !Array.isArray(item),
    );
}

function categoryName(slug: string): string {
    return slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}

function adaptImages(value: unknown): ProductImage[] {
    return objects(value)
        .map((image, index) => {
            const url = text(image.url);

            if (!url) return null;

            return {
                id: text(image.id) || null,
                url,
                alt:
                    text(image.alt_text) ||
                    text(image.alt) ||
                    "Fotografia do produto",
                colorSlug: text(image.cor_slug) || null,
                isPrimary: image.principal === true,
                order: numeric(image.ordem) ?? index + 1,
            };
        })
        .filter((image): image is ProductImage => image !== null)
        .sort((a, b) => a.order - b.order);
}

function adaptVariants(value: unknown): ProductVariant[] {
    return objects(value)
        .filter((variant) => text(variant.sku))
        .map((variant) => ({
            sku: text(variant.sku),
            color: text(variant.cor),
            size: text(variant.tamanho),
            stock: numeric(variant.estoque),
            active: variant.ativo !== false,
        }));
}

export function adaptSupabaseProduct(row: CatalogRow): Product {
    const slug = text(row.slug);
    const name = text(row.nome);
    const price = numeric(row.preco);
    const categorySlug = text(row.categoria_slug);

    if (!slug || !name || price === null || price <= 0) {
        throw new Error("Produto inválido na view produtos_catalogo.");
    }

    return {
        id: text(row.id) || slug,
        slug,
        name,
        description: text(row.descricao) || null,
        price,
        promotionalPrice: numeric(row.preco_promocional),
        category: {
            slug: categorySlug,
            name: text(row.categoria_nome) || categoryName(categorySlug),
        },
        images: adaptImages(row.imagens),
        variants: adaptVariants(row.variacoes),
        tags: Array.isArray(row.tags) ? row.tags.map(text).filter(Boolean) : [],
        featured: row.destaque === true,
        active: row.ativo !== false,
    };
}
