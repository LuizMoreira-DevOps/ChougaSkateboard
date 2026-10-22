import type { Product, ProductVariant } from "../catalog/product";

const STORAGE_KEY = "chouga.cart.v1";
const MAX_CART_LINES = 50;

export const CART_UPDATED_EVENT = "chouga:cart-updated";
export const CART_OPEN_EVENT = "chouga:cart-open";

export type CartItem = {
    productId: string;
    slug: string;
    sku: string;
    name: string;
    color: string;
    size: string;
    unitPrice: number;
    quantity: number;
    imageUrl: string | null;
};

export function getCartSnapshot(): string {
    if (typeof window === "undefined") return "";

    try {
        return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {
        return "";
    }
}

export function getServerCartSnapshot(): string {
    return "";
}

export function subscribeCart(listener: () => void): () => void {
    if (typeof window === "undefined") return () => {};

    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY || event.key === null) {
            listener();
        }
    };

    window.addEventListener(CART_UPDATED_EVENT, listener);
    window.addEventListener("storage", onStorage);

    return () => {
        window.removeEventListener(CART_UPDATED_EVENT, listener);
        window.removeEventListener("storage", onStorage);
    };
}

function parseItem(value: unknown): CartItem | null {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const item = value as Record<string, unknown>;

    if (
        typeof item.productId !== "string" ||
        !item.productId ||
        typeof item.slug !== "string" ||
        !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug) ||
        typeof item.sku !== "string" ||
        !item.sku ||
        typeof item.name !== "string" ||
        !item.name ||
        typeof item.unitPrice !== "number" ||
        !Number.isFinite(item.unitPrice) ||
        item.unitPrice < 0 ||
        typeof item.quantity !== "number" ||
        !Number.isInteger(item.quantity) ||
        item.quantity < 1
    ) {
        return null;
    }

    return {
        productId: item.productId,
        slug: item.slug,
        sku: item.sku,
        name: item.name,
        color: typeof item.color === "string" ? item.color : "",
        size: typeof item.size === "string" ? item.size : "",
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        imageUrl: typeof item.imageUrl === "string" ? item.imageUrl : null,
    };
}

export function readCart(serialized: string = getCartSnapshot()): CartItem[] {
    if (!serialized) return [];

    try {
        const parsed: unknown = JSON.parse(serialized);

        if (!Array.isArray(parsed)) return [];

        const seen = new Set<string>();
        const items: CartItem[] = [];

        for (const raw of parsed.slice(0, MAX_CART_LINES)) {
            const item = parseItem(raw);
            if (!item) continue;

            const identity = `${item.productId}:${item.sku}`;

            if (seen.has(identity)) continue;

            seen.add(identity);
            items.push(item);
        }

        return items;
    } catch {
        return [];
    }
}

function saveCart(items: CartItem[]): void {
    if (typeof window === "undefined") {
        throw new Error("Sacola indisponível fora do navegador.");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(
    product: Product,
    variant: ProductVariant,
    quantity: number,
): number {
    const realVariant = product.variants.find(
        (item) =>
            item.sku === variant.sku &&
            item.color === variant.color &&
            item.size === variant.size,
    );

    if (!product.active || !realVariant?.active) {
        throw new Error("Variação indisponível.");
    }

    const stock = realVariant.stock;

    if (stock === null || !Number.isInteger(stock) || stock < 1) {
        throw new Error("Produto sem estoque disponível.");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new Error("Quantidade inválida.");
    }

    const items = readCart();

    const existing = items.find(
        (item) => item.productId === product.id && item.sku === realVariant.sku,
    );

    const nextQuantity = (existing?.quantity ?? 0) + quantity;

    if (nextQuantity > stock) {
        throw new Error(`Disponíveis apenas ${stock} unidade(s) deste SKU.`);
    }

    if (!existing && items.length >= MAX_CART_LINES) {
        throw new Error("Limite de produtos na sacola atingido.");
    }

    const promotional = product.promotionalPrice;

    const price =
        promotional !== null && promotional >= 0 && promotional < product.price
            ? promotional
            : product.price;

    const image =
        product.images.find((item) => item.isPrimary) ?? product.images[0];

    if (existing) {
        existing.quantity = nextQuantity;
        existing.unitPrice = price;
        existing.color = realVariant.color;
        existing.size = realVariant.size;
        existing.name = product.name;
        existing.imageUrl = image?.url ?? null;
    } else {
        items.push({
            productId: product.id,
            slug: product.slug,
            sku: realVariant.sku,
            name: product.name,
            color: realVariant.color,
            size: realVariant.size,
            unitPrice: price,
            quantity,
            imageUrl: image?.url ?? null,
        });
    }

    saveCart(items);
    return nextQuantity;
}

export function updateCartQuantity(
    productId: string,
    sku: string,
    quantity: number,
    confirmedStock: number,
): void {
    if (
        !Number.isInteger(quantity) ||
        !Number.isInteger(confirmedStock) ||
        quantity < 1 ||
        quantity > confirmedStock
    ) {
        throw new Error("Quantidade acima do estoque disponível.");
    }

    const items = readCart();
    const item = items.find(
        (entry) => entry.productId === productId && entry.sku === sku,
    );

    if (!item) {
        throw new Error("Item não encontrado na sacola.");
    }

    item.quantity = quantity;
    saveCart(items);
}

export function removeCartItem(productId: string, sku: string): void {
    const items = readCart().filter(
        (item) => item.productId !== productId || item.sku !== sku,
    );

    saveCart(items);
}
