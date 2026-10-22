import test, { beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
    CART_UPDATED_EVENT,
    addToCart,
    getCartSnapshot,
    readCart,
    removeCartItem,
    subscribeCart,
    updateCartQuantity,
} from "../src/features/cart/cartStorage.ts";

const product = {
    id: "e2e-basic", slug: "camiseta-chouga-teste-branca",
    name: "Camiseta Chouga Teste Branca", active: true, price: 95,
    promotionalPrice: null, category: { slug: "camisetas-basicas", name: "Camisetas Básicas" },
    images: [], tags: [], featured: true, description: null,
    variants: [{ sku: "CHOUGA-E2E-BRANCA-M", color: "Branco", size: "M", stock: 7, active: true }],
};
const variant = product.variants[0];

class MemoryStorage {
    #entries = new Map();
    getItem(key) { return this.#entries.has(key) ? this.#entries.get(key) : null; }
    setItem(key, value) { this.#entries.set(String(key), String(value)); }
    removeItem(key) { this.#entries.delete(String(key)); }
    clear() { this.#entries.clear(); }
}

const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
const originalStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");

beforeEach(() => {
    Object.defineProperty(globalThis, "window", {
        configurable: true, writable: true, value: new EventTarget(),
    });
    Object.defineProperty(globalThis, "localStorage", {
        configurable: true, writable: true, value: new MemoryStorage(),
    });
});
afterEach(() => {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else delete globalThis.window;
    if (originalStorage) Object.defineProperty(globalThis, "localStorage", originalStorage);
    else delete globalThis.localStorage;
});

test("adiciona item e persiste quantidade e identidade do SKU", () => {
    assert.equal(addToCart(product, variant, 2), 2);
    const items = readCart(getCartSnapshot());
    assert.equal(items.length, 1);
    assert.deepEqual(
        { sku: items[0].sku, quantity: items[0].quantity, price: items[0].unitPrice },
        { sku: variant.sku, quantity: 2, price: 95 },
    );
});

test("o mesmo SKU acumula; excesso falha sem alterar a sacola", () => {
    addToCart(product, variant, 5);
    assert.equal(addToCart(product, variant, 2), 7);
    const before = getCartSnapshot();
    assert.throws(() => addToCart(product, variant, 1), /7|sacola|estoque/i);
    assert.equal(getCartSnapshot(), before);
});

test("atualização de quantidade respeita estoque confirmado", () => {
    addToCart(product, variant, 1);
    updateCartQuantity(product.id, variant.sku, 3, 7);
    assert.equal(readCart()[0].quantity, 3);
    assert.throws(() => updateCartQuantity(product.id, variant.sku, 8, 7), /estoque/i);
    assert.equal(readCart()[0].quantity, 3);
});

test("remoção esvazia armazenamento e notifica assinantes", () => {
    let updates = 0;
    const unsubscribe = subscribeCart(() => updates++);
    addToCart(product, variant, 1);
    removeCartItem(product.id, variant.sku);
    assert.equal(readCart().length, 0);
    assert.equal(updates, 2);
    unsubscribe();
    globalThis.window.dispatchEvent(new Event(CART_UPDATED_EVENT));
    assert.equal(updates, 2);
});

test("recupera com segurança dados inválidos no localStorage", () => {
    globalThis.localStorage.setItem("chouga.cart.v1", "{não é JSON}");
    assert.deepEqual(readCart(), []);
    globalThis.localStorage.setItem("chouga.cart.v1", JSON.stringify([
        { productId: "e2e", slug: "../../segredo", sku: "X", name: "Inválido", unitPrice: 5, quantity: 1 },
        { productId: "e2e", slug: "produto-valido", sku: "OK", name: "Válido", unitPrice: 5, quantity: 1 },
    ]));
    assert.equal(readCart().length, 1);
    assert.equal(readCart()[0].sku, "OK");
});

test("preço promocional válido é gravado no item", () => {
    const promo = { ...product, promotionalPrice: 80 };
    addToCart(promo, variant, 1);
    assert.equal(readCart()[0].unitPrice, 80);
});
