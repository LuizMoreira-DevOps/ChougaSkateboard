import type { Product } from "./product";

export type PriceRange = "" | "up-to-100" | "100-to-200" | "over-200";

export type StoreFilters = {
    category: string;
    sizes: string[];
    colors: string[];
    price: PriceRange;
};

export type FilterOption = { key: string; label: string };
export type CategoryOption = { slug: string; name: string };

export type CatalogFilterOptions = {
    categories: CategoryOption[];
    sizes: FilterOption[];
    colors: FilterOption[];
};

export const EMPTY_STORE_FILTERS: StoreFilters = {
    category: "",
    sizes: [],
    colors: [],
    price: "",
};

export const PRICE_OPTIONS: { id: Exclude<PriceRange, "">; label: string }[] = [
    { id: "up-to-100", label: "Até R$ 100" },
    { id: "100-to-200", label: "Acima de R$ 100 até R$ 200" },
    { id: "over-200", label: "Acima de R$ 200" },
];

/** Keys comparáveis sem depender de maiúsculas ou acentuação do cadastro. */
export function facetKey(value: string): string {
    return value.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

/** Mesmo preço efetivo utilizado pela página de detalhes e pela sacola. */
export function productDisplayPrice(product: Product): number {
    const promotional = product.promotionalPrice;
    return promotional !== null && promotional >= 0 && promotional < product.price
        ? promotional
        : product.price;
}

/** Não anunciamos tamanho/cor que esteja sem estoque disponível. */
export function isPurchasableVariant(variant: Product["variants"][number]): boolean {
    return variant.active && variant.stock !== null && Number.isInteger(variant.stock) && variant.stock > 0;
}

const SIZE_ORDER = ["pp", "p", "m", "g", "gg", "xg", "xgg", "xxg", "unico", "unico tamanho"];

/** As opções vêm dos produtos carregados, nunca de escolhas inventadas no front-end. */
export function buildCatalogFilterOptions(products: Product[]): CatalogFilterOptions {
    const categories = new Map<string, string>();
    const sizes = new Map<string, string>();
    const colors = new Map<string, string>();

    for (const product of products) {
        if (product.category.slug) categories.set(product.category.slug, product.category.name);

        for (const variant of product.variants) {
            if (!isPurchasableVariant(variant)) continue;
            const size = facetKey(variant.size);
            const color = facetKey(variant.color);
            if (size && !sizes.has(size)) sizes.set(size, variant.size.trim());
            if (color && !colors.has(color)) colors.set(color, variant.color.trim());
        }
    }

    return {
        categories: Array.from(categories, ([slug, name]) => ({ slug, name }))
            .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
        sizes: Array.from(sizes, ([key, label]) => ({ key, label }))
            .sort((a, b) => {
                const posA = SIZE_ORDER.indexOf(a.key);
                const posB = SIZE_ORDER.indexOf(b.key);
                if (posA !== posB) return (posA < 0 ? 999 : posA) - (posB < 0 ? 999 : posB);
                return a.label.localeCompare(b.label, "pt-BR");
            }),
        colors: Array.from(colors, ([key, label]) => ({ key, label }))
            .sort((a, b) => a.label.localeCompare(b.label, "pt-BR")),
    };
}

export function countActiveFilters(filters: StoreFilters): number {
    return Number(Boolean(filters.category)) + filters.sizes.length + filters.colors.length + Number(Boolean(filters.price));
}

export function matchesProductFilters(product: Product, filters: StoreFilters): boolean {
    if (filters.category && product.category.slug !== filters.category) return false;

    const price = productDisplayPrice(product);
    if (filters.price === "up-to-100" && price > 100) return false;
    if (filters.price === "100-to-200" && (price <= 100 || price > 200)) return false;
    if (filters.price === "over-200" && price <= 200) return false;

    if (filters.sizes.length === 0 && filters.colors.length === 0) return true;

    // Crucial: tamanho E cor precisam existir na MESMA variação comprável.
    // Dentro de cada grupo, múltiplas opções são combinadas com OR.
    return product.variants.some((variant) =>
        isPurchasableVariant(variant) &&
        (filters.sizes.length === 0 || filters.sizes.includes(facetKey(variant.size))) &&
        (filters.colors.length === 0 || filters.colors.includes(facetKey(variant.color))),
    );
}

export function filterCatalogProducts(products: Product[], filters: StoreFilters): Product[] {
    return products.filter((product) => matchesProductFilters(product, filters));
}
