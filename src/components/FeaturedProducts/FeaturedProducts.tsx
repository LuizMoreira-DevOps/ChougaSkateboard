import type { StaticImageData } from "next/image";

import { ProductCard } from "../ProductCard/ProductCard";
import styles from "./FeaturedProducts.module.css";

import basicBranca from "../../assets/products/camiseta-chouga-basic-branca.webp";
import chougaWeed from "../../assets/products/camiseta-chouga-weed.webp";
import chougaAzul from "../../assets/products/camiseta-chouga-azul.webp";
import blusaBomb from "../../assets/products/blusa-chouga-bomb.webp";

type FeaturedProduct = {
    name: string;
    price: number | null;
    category: string;
    index: string;
    image: StaticImageData;
};

// Vitrine demonstrativa com fotografias do legado.
// Valores não confirmados permanecem nulos.

const featuredProducts: FeaturedProduct[] = [
    {
        name: "Chouga Basic Branca",
        price: 90,
        category: "Camisa Basic",
        index: "01",
        image: basicBranca,
    },
    {
        name: "Chouga Weed",
        price: 100,
        category: "Novo Drop",
        index: "02",
        image: chougaWeed,
    },
    {
        name: "Chouga Basic Azul",
        price: 90,
        category: "Camisa Basic",
        index: "03",
        image: chougaAzul,
    },
    {
        name: "Manga Comprida Chouga Bomber",
        price: 150,
        category: "Manga Comprida",
        index: "04",
        image: blusaBomb,
    },
];

export function FeaturedProducts() {
    return (
        <section className={styles.featuredProducts} id="loja">
            <div className={styles.sectionHeader}>
                <div>
                    <p className={styles.sectionEyebrow}>Loja / Destaques</p>

                    <h2 className={styles.sectionTitle}>Drop em destaque</h2>
                </div>

                <span className={styles.sectionIndex} aria-hidden="true">
                    02
                </span>
            </div>

            <div className={styles.productGrid}>
                {featuredProducts.map((product) => (
                    <ProductCard key={product.index} {...product} />
                ))}
            </div>
        </section>
    );
}
