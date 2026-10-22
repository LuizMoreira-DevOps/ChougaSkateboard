import test from "node:test";
import assert from "node:assert/strict";
import {
    buildCatalogFilterOptions,
    countActiveFilters,
    facetKey,
    filterCatalogProducts,
    productDisplayPrice,
} from "../src/features/catalog/filterCatalogProducts.ts";

function product(id, price, promotion, variants, category = "camisetas") {
    return {
        id,
        slug: id,
        name: id,
        price,
        promotionalPrice: promotion,
        category: { slug: category, name: category },
        variants,
        images: [], tags: [], featured: false, active: true,
        description: null,
    };
}
function variant(size, color, stock, active = true) {
    return { sku: `${size}-${color}`, size, color, stock, active };
}
const basic = product("basic", 95, null, [variant("M", "Branco", 4), variant("G", "Preto", 1)]);
const soldOut = product("soldout", 110, null, [variant("M", "Branco", 0)]);
const promotion = product("promotion", 130, 99, [variant("M", "Azul", 2)]);
const catalog = [basic, soldOut, promotion];
const blank = { category: "", sizes: [], colors: [], price: "" };

test("facets derive only from in-stock variants; normalize case/accent", () => {
    const facets = buildCatalogFilterOptions(catalog);
    assert.deepEqual(facets.sizes.map((item) => item.key), ["m", "g"]);
    assert.deepEqual(facets.colors.map((item) => item.key), ["azul", "branco", "preto"]);
    assert.equal(facetKey("  AZÚL  "), "azul");
});
test("no filters preserve real list and category narrows it", () => {
    assert.equal(filterCatalogProducts(catalog, blank).length, 3);
    assert.equal(filterCatalogProducts(catalog, { ...blank, category: "mochilas" }).length, 0);
});
test("AND across groups matches the same stocked variant", () => {
    assert.equal(filterCatalogProducts(catalog, { ...blank, sizes: ["m"], colors: ["preto"] }).length, 0);
    assert.deepEqual(filterCatalogProducts(catalog, { ...blank, sizes: ["g"], colors: ["preto"] }).map((p) => p.id), ["basic"]);
    assert.equal(filterCatalogProducts(catalog, { ...blank, sizes: ["m"], colors: ["branco"] }).length, 1);
});
test("OR within a facet permits multiple sizes", () => {
    assert.equal(filterCatalogProducts(catalog, { ...blank, sizes: ["m", "g"] }).length, 2);
});
test("price ranges use valid promotional price and don't overlap", () => {
    assert.equal(productDisplayPrice(promotion), 99);
    assert.equal(productDisplayPrice(product("invalid", 110, 150, [])), 110);
    assert.deepEqual(filterCatalogProducts(catalog, { ...blank, price: "up-to-100" }).map((p) => p.id), ["basic", "promotion"]);
    assert.deepEqual(filterCatalogProducts(catalog, { ...blank, price: "100-to-200" }).map((p) => p.id), ["soldout"]);
    assert.equal(filterCatalogProducts(catalog, { ...blank, price: "over-200" }).length, 0);
});
test("filter badge count reflects actual selections", () => {
    assert.equal(countActiveFilters({ category: "camisetas", sizes: ["m", "g"], colors: ["branco"], price: "up-to-100" }), 5);
});
