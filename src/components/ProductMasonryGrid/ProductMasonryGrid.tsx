"use client";

import { useLayoutEffect, useRef } from "react";

import { ProductCard } from "../ProductCard/ProductCard";
import type { Product } from "../../features/catalog/product";
import { placeProducts } from "./placeProducts";
import styles from "./ProductMasonryGrid.module.css";

type Props = {
    products: Product[];
    filtersOpen: boolean;
    priceOf: (product: Product) => number | null;
};

export function ProductMasonryGrid({ products, filtersOpen, priceOf }: Props) {
    const gridRef = useRef<HTMLUListElement>(null);

    useLayoutEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;

        const items = Array.from(grid.children) as HTMLLIElement[];
        if (!items.length) {
            grid.removeAttribute("data-measured");
            return;
        }

        const contents = items.map((item) => item.firstElementChild as HTMLElement);
        let frame = 0;
        let previousSignature = "";

        const measure = () => {
            const css = getComputedStyle(grid);
            const columns = Number(css.getPropertyValue("--columns").trim());
            const gap = Number.parseFloat(css.getPropertyValue("--masonry-gap"));
            const heights = contents.map((content) =>
                Math.ceil(content.getBoundingClientRect().height),
            );

            // Ignora eventos de ResizeObserver provocados somente pela
            // alteração da altura total do próprio grid.
            const signature = [grid.clientWidth, columns, gap, ...heights].join("|");
            if (signature === previousSignature) return;
            previousSignature = signature;

            const positions = placeProducts(heights, columns, gap);
            items.forEach((item, index) => {
                const { column, start, span } = positions[index];
                item.style.gridColumn = String(column);
                item.style.gridRow = `${start} / span ${span}`;
            });
            grid.dataset.measured = "true";
        };

        const schedule = () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(measure);
        };

        measure();

        const observer = new ResizeObserver(schedule);
        observer.observe(grid);
        contents.forEach((content) => observer.observe(content));

        return () => {
            observer.disconnect();
            cancelAnimationFrame(frame);
            items.forEach((item) => {
                item.style.removeProperty("grid-column");
                item.style.removeProperty("grid-row");
            });
            grid.removeAttribute("data-measured");
        };
    }, [products, filtersOpen]);

    return (
        <ul
            ref={gridRef}
            className={styles.grid}
            data-filters-open={filtersOpen}
            aria-label="Produtos da loja"
        >
            {products.map((product, index) => {
                const image =
                    product.images.find((item) => item.isPrimary) ??
                    product.images[0];

                return (
                    <li key={product.id} className={styles.item}>
                        <div className={styles.content}>
                            <ProductCard
                                slug={product.slug}
                                name={product.name}
                                price={priceOf(product)}
                                category={product.category.name}
                                index={String(index + 1).padStart(2, "0")}
                                image={image?.url ?? null}
                                imageAlt={image?.alt}
                                imageSizes="(max-width: 900px) 50vw, 25vw"
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}
