"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { ProductMasonryGrid } from "../../components/ProductMasonryGrid/ProductMasonryGrid";
import { CatalogFilters } from "../../components/CatalogFilters/CatalogFilters";

import { getCatalogProducts } from "../../features/catalog/getCatalogProducts";
import type { Product } from "../../features/catalog/product";
import {
    EMPTY_STORE_FILTERS,
    PRICE_OPTIONS,
    buildCatalogFilterOptions,
    countActiveFilters,
    filterCatalogProducts,
    productDisplayPrice,
    type StoreFilters,
} from "../../features/catalog/filterCatalogProducts";

import styles from "./page.module.css";

type SortOrder = "name" | "price-asc" | "price-desc";

export default function StorePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [filters, setFilters] = useState<StoreFilters>(EMPTY_STORE_FILTERS);
    const [sortOrder, setSortOrder] = useState<SortOrder>("name");
    const [filtersOpen, setFiltersOpen] = useState(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadCatalog() {
            try {
                const result = await getCatalogProducts(controller.signal);
                if (!controller.signal.aborted) setProducts(result);
            } catch (failure) {
                if (!controller.signal.aborted) {
                    console.error("Erro ao carregar a loja:", failure);
                    setError(true);
                }
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }

        void loadCatalog();
        return () => controller.abort();
    }, []);

    const options = useMemo(
        () => buildCatalogFilterOptions(products),
        [products],
    );

    const visibleProducts = useMemo(() => {
        const filtered = filterCatalogProducts(products, filters);
        return filtered.sort((a, b) => {
            const byName = a.name.localeCompare(b.name, "pt-BR");
            if (sortOrder === "price-asc") {
                return (
                    productDisplayPrice(a) - productDisplayPrice(b) || byName
                );
            }
            if (sortOrder === "price-desc") {
                return (
                    productDisplayPrice(b) - productDisplayPrice(a) || byName
                );
            }
            return byName;
        });
    }, [products, filters, sortOrder]);

    const categoryName = options.categories.find(
        (option) => option.slug === filters.category,
    )?.name;
    const activeCount = countActiveFilters(filters);

    const activeChips = [
        ...(filters.category
            ? [
                  {
                      key: "category",
                      label: `Categoria: ${categoryName ?? filters.category}`,
                      remove: () =>
                          setFilters((current) => ({
                              ...current,
                              category: "",
                          })),
                  },
              ]
            : []),
        ...filters.sizes.map((key) => ({
            key: `size:${key}`,
            label: `Tamanho: ${options.sizes.find((option) => option.key === key)?.label ?? key}`,
            remove: () =>
                setFilters((current) => ({
                    ...current,
                    sizes: current.sizes.filter((size) => size !== key),
                })),
        })),
        ...filters.colors.map((key) => ({
            key: `color:${key}`,
            label: `Cor: ${options.colors.find((option) => option.key === key)?.label ?? key}`,
            remove: () =>
                setFilters((current) => ({
                    ...current,
                    colors: current.colors.filter((color) => color !== key),
                })),
        })),
        ...(filters.price
            ? [
                  {
                      key: "price",
                      label: `Preço: ${PRICE_OPTIONS.find((option) => option.id === filters.price)?.label ?? filters.price}`,
                      remove: () =>
                          setFilters((current) => ({ ...current, price: "" })),
                  },
              ]
            : []),
    ];

    return (
        <div className={styles.page}>
            <Header />
            <main className={styles.main}>
                <div className={styles.container}>
                    <nav
                        className={styles.breadcrumb}
                        aria-label="Caminho de navegação"
                    >
                        <Link href="/">Início</Link>
                        <span aria-hidden="true">/</span>
                        <span aria-current="page">Loja</span>
                    </nav>

                    <section
                        className={styles.intro}
                        aria-labelledby="store-title"
                    >
                        <h1 className={styles.title} id="store-title">
                            OS DROPS<span>.</span>
                        </h1>

                        <p className={styles.description}>
                            Peças para o próximo rolê.
                        </p>
                    </section>

                    <section
                        className={styles.catalog}
                        aria-labelledby="catalog-title"
                    >
                        {!loading && !error && products.length > 0 && (
                            <>
                                <div className={styles.toolbar}>
                                    <button
                                        type="button"
                                        className={styles.filterToggle}
                                        aria-expanded={filtersOpen}
                                        aria-controls="store-sidebar store-drawer"
                                        onClick={() =>
                                            setFiltersOpen(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        <span aria-hidden="true">☷</span>
                                        {filtersOpen
                                            ? "Ocultar filtros"
                                            : "Mostrar filtros"}
                                        {activeCount > 0
                                            ? ` (${activeCount})`
                                            : ""}
                                    </button>
                                    <div className={styles.sort}>
                                        <label htmlFor="store-sort">
                                            Ordenar por
                                        </label>
                                        <select
                                            id="store-sort"
                                            value={sortOrder}
                                            onChange={(event) =>
                                                setSortOrder(
                                                    event.target
                                                        .value as SortOrder,
                                                )
                                            }
                                        >
                                            <option value="name">
                                                Nome: A–Z
                                            </option>
                                            <option value="price-asc">
                                                Menor preço
                                            </option>
                                            <option value="price-desc">
                                                Maior preço
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                {activeChips.length > 0 && (
                                    <div
                                        className={styles.activeFilter}
                                        aria-label="Filtros aplicados"
                                    >
                                        {activeChips.map((chip) => (
                                            <button
                                                type="button"
                                                key={chip.key}
                                                onClick={chip.remove}
                                                aria-label={`Remover filtro ${chip.label}`}
                                            >
                                                {chip.label}{" "}
                                                <span aria-hidden="true">
                                                    ×
                                                </span>
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            className={styles.clearAll}
                                            onClick={() =>
                                                setFilters(EMPTY_STORE_FILTERS)
                                            }
                                        >
                                            Limpar tudo
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {loading && (
                            <p className={styles.message} role="status">
                                Carregando as peças da Chouga…
                            </p>
                        )}

                        {error && (
                            <div className={styles.message} role="alert">
                                <h3>Não foi possível carregar o catálogo.</h3>
                                <p>Atualize a página para tentar novamente.</p>
                            </div>
                        )}

                        {!loading && !error && products.length === 0 && (
                            <div className={styles.message}>
                                <h3>Nenhum produto disponível no momento.</h3>
                                <p>Volte em breve para conferir as peças.</p>
                            </div>
                        )}

                        {!loading && !error && products.length > 0 && (
                            <div
                                className={styles.catalogLayout}
                                data-filters-open={filtersOpen}
                            >
                                <CatalogFilters
                                    open={filtersOpen}
                                    options={options}
                                    value={filters}
                                    onChange={setFilters}
                                    resultCount={visibleProducts.length}
                                    onClose={() => setFiltersOpen(false)}
                                />
                                <div className={styles.masonryArea}>
                                    {visibleProducts.length ? (
                                        <ProductMasonryGrid
                                            products={visibleProducts}
                                            filtersOpen={filtersOpen}
                                            priceOf={productDisplayPrice}
                                        />
                                    ) : (
                                        <div
                                            className={styles.emptyState}
                                            role="status"
                                        >
                                            <h3>Nenhum produto encontrado.</h3>
                                            <p>
                                                Experimente outra combinação de
                                                filtros.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setFilters(
                                                        EMPTY_STORE_FILTERS,
                                                    )
                                                }
                                            >
                                                Limpar filtros ↗
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!loading && !error && products.length >= 50 && (
                            <p className={styles.catalogNote}>
                                Esta seleção considera os 50 produtos carregados
                                do catálogo.
                            </p>
                        )}
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
}
