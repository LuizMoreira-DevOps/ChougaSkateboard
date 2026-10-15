import { ProductCard } from "../ProductCard/ProductCard";
import styles from "./FeaturedProducts.module.css";

type FeaturedProduct = {
    name: string;
    price: number;
    category: string;
    index: string;
};

const featuredProducts: FeaturedProduct[] = [
    {
        name: "Shape Chouga 8.0",
        price: 349.9,
        category: "Shape",
        index: "01",
    },
    {
        name: "Camiseta Chouga Logo",
        price: 149.9,
        category: "Streetwear",
        index: "02",
    },
    {
        name: "Boné Chouga Classic",
        price: 129.9,
        category: "Acessórios",
        index: "03",
    },
    {
        name: "Moletom Chouga Heavy",
        price: 299.9,
        category: "Streetwear",
        index: "04",
    },
];

export function FeaturedProducts() {
    return (
        <section className={styles.featuredProducts} id="loja">
            <div className={styles.sectionHeader}>
                <div>
                    <p className={styles.sectionEyebrow}>Loja / Destaques</p>
                    <h2 className={styles.sectionTitle}>
                        Produtos em destaque
                    </h2>
                </div>

                <span className={styles.sectionIndex} aria-hidden="true">
                    02
                </span>
            </div>

            <div className={styles.productGrid}>
                {featuredProducts.map((product) => (
                    <ProductCard
                        key={product.index}
                        name={product.name}
                        price={product.price}
                        category={product.category}
                        index={product.index}
                    />
                ))}
            </div>
        </section>
    );
}
