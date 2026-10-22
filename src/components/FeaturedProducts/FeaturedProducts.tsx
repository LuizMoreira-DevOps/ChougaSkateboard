"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import type { Product } from "../../features/catalog/product";
import { getCatalogProducts } from "../../features/catalog/getCatalogProducts";

import { ProductCard } from "../ProductCard/ProductCard";
import styles from "./FeaturedProducts.module.css";

type CatalogState = {
    loading: boolean;
    error: boolean;
    products: Product[];
};

export function FeaturedProducts() {
    const [catalog, setCatalog] = useState<CatalogState>({
        loading: true,
        error: false,
        products: [],
    });

    useEffect(() => {
        const controller = new AbortController();

        async function loadProducts() {
            try {
                const products = await getCatalogProducts(controller.signal);

                if (!controller.signal.aborted) {
                    setCatalog({
                        loading: false,
                        error: false,
                        products,
                    });
                }
            } catch (error) {
                if (controller.signal.aborted) return;

                console.error("Erro ao carregar catálogo:", error);

                setCatalog({
                    loading: false,
                    error: true,
                    products: [],
                });
            }
        }

        void loadProducts();

        return () => controller.abort();
    }, []);

    const featured = catalog.products.filter((product) => product.featured);

    const visibleProducts = (
        featured.length > 0 ? featured : catalog.products
    ).slice(0, 3);

    return (
        <section
            className={styles.featuredProducts}
            id="loja"
            aria-labelledby="featured-title"
        >
            <div className={styles.sectionHeader}>
                <div>
                    <p className={styles.sectionEyebrow}>Loja / Destaques</p>

                    <h2 className={styles.sectionTitle} id="featured-title">
                        Drop em destaque
                    </h2>
                </div>

                <span className={styles.sectionIndex} aria-hidden="true">
                    02
                </span>
            </div>

            {catalog.loading && (
                <p className={styles.catalogMessage} role="status">
                    Carregando produtos...
                </p>
            )}

            {catalog.error && (
                <p className={styles.catalogMessage} role="alert">
                    Não foi possível carregar os produtos. Tente novamente mais
                    tarde.
                </p>
            )}

            {!catalog.loading &&
                !catalog.error &&
                visibleProducts.length === 0 && (
                    <p className={styles.catalogMessage}>
                        Nenhum produto disponível no momento.
                    </p>
                )}

            {!catalog.loading &&
                !catalog.error &&
                visibleProducts.length > 0 && (
                    <div
                        className={styles.productGrid}
                        data-count={visibleProducts.length}
                    >
                        {visibleProducts.map((product, index) => {
                            const image =
                                product.images.find((item) => item.isPrimary) ??
                                product.images[0];

                            return (
                                <ProductCard
                                    key={product.id}
                                    name={product.name}
                                    slug={product.slug}
                                    price={
                                        product.promotionalPrice ??
                                        product.price
                                    }
                                    category={product.category.name}
                                    index={String(index + 1).padStart(2, "0")}
                                    image={image?.url ?? null}
                                    imageAlt={image?.alt}
                                />
                            );
                        })}

                        <Link
                            href="/loja"
                            className={styles.shopCard}
                            aria-label="Explorar o catálogo Chouga"
                        >
                            <span className={styles.shopEyebrow}>
                                CHOUGA / CATÁLOGO COMPLETO
                            </span>

                            <div className={styles.shopCenter}>
                                <h3 className={styles.shopTitle}>
                                    VER TODA
                                    <br />A <span>LOJA.</span>
                                </h3>

                                <p className={styles.shopDescription}>
                                    Descubra os produtos, coleções e próximos
                                    drops da Chouga.
                                </p>
                            </div>

                            <div className={styles.shopFooter}>
                                <span>EXPLORAR CATÁLOGO</span>
                                <span aria-hidden="true">↗</span>
                            </div>
                        </Link>
                    </div>
                )}
        </section>
    );
}
