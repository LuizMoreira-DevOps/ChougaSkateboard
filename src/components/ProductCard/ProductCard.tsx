import Image, { type StaticImageData } from "next/image";
import styles from "./ProductCard.module.css";

export type ProductCardProps = {
    name: string;
    price: number | null;
    category: string;
    index: string;
    image: StaticImageData;
};

const priceFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function ProductCard({
    name,
    price,
    category,
    index,
    image,
}: ProductCardProps) {
    return (
        <article className={styles.productCard}>
            <div className={styles.productImage}>
                <Image
                    src={image}
                    alt={name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className={styles.productPhoto}
                />

                <span aria-hidden="true">{index}</span>
            </div>

            <div className={styles.productContent}>
                <div className={styles.productMeta}>
                    <span>{category}</span>
                    <span>{index}</span>
                </div>

                <h3 className={styles.productName}>{name}</h3>

                <p className={styles.productPrice}>
                    {price !== null
                        ? priceFormatter.format(price)
                        : "Preço a confirmar"}
                </p>
            </div>
        </article>
    );
}
