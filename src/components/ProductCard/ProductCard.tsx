import Link from "next/link";
import Image, { type StaticImageData } from "next/image";

import styles from "./ProductCard.module.css";

export type ProductCardProps = {
    slug: string;
    name: string;
    price: number | null;
    category: string;
    index: string;
    image: StaticImageData | string | null;
    imageAlt?: string;
    imageSizes?: string;
};

const priceFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function ProductCard({
    slug,
    name,
    price,
    category,
    index,
    image,
    imageAlt,
    imageSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
}: ProductCardProps) {
    return (
        <article className={styles.productCard}>
            <Link
                href={`/produto/?slug=${encodeURIComponent(slug)}`}
                className={styles.productLink}
                aria-label={`Ver detalhes de ${name}`}
            >
                <div className={styles.productImage}>
                    {image ? (
                        <Image
                            src={image}
                            alt={imageAlt || name}
                            fill
                            unoptimized={typeof image === "string"}
                            sizes={imageSizes}
                            className={styles.productPhoto}
                        />
                    ) : (
                        <div className={styles.productPlaceholder}>
                            <p>Imagem em breve</p>
                        </div>
                    )}

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
            </Link>
        </article>
    );
}
