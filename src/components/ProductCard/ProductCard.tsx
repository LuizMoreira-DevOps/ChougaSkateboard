import styles from "./ProductCard.module.css";

export type ProductCardProps = {
    name: string;
    price: number;
    category: string;
    index: string;
};

export function ProductCard({
    name,
    price,
    category,
    index,
}: ProductCardProps) {
    const formattedPrice = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    }).format(price);

    return (
        <article className={styles.productCard}>
            <div className={styles.productImage} aria-hidden="true">
                <span>{index}</span>
            </div>

            <div className={styles.productContent}>
                <div className={styles.productMeta}>
                    <span>{category}</span>
                    <span>{index}</span>
                </div>

                <h3 className={styles.productName}>{name}</h3>

                <p className={styles.productPrice}>{formattedPrice}</p>
            </div>
        </article>
    );
}
