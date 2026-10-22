"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { Product } from "../../features/catalog/product";
import { getCatalogProductBySlug } from "../../features/catalog/getCatalogProducts";
import { addToCart, CART_OPEN_EVENT } from "../../features/cart/cartStorage";

import styles from "./ProductDetails.module.css";

type ViewStatus = "loading" | "ready" | "missing" | "error";

const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

export function ProductDetails() {
    const params = useSearchParams();
    const slug = params.get("slug") ?? "";

    const [product, setProduct] = useState<Product | null>(null);
    const [status, setStatus] = useState<ViewStatus>("loading");

    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [photoIndex, setPhotoIndex] = useState(0);
    const [feedback, setFeedback] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        getCatalogProductBySlug(slug, controller.signal)
            .then((result) => {
                if (controller.signal.aborted) return;

                setProduct(result);
                setStatus(result ? "ready" : "missing");

                const firstVariant = result?.variants.find(
                    (variant) => variant.active,
                );

                setSelectedColor(firstVariant?.color ?? "");
                setSelectedSize("");
                setPhotoIndex(0);
                setQuantity(1);
                setFeedback("");
            })
            .catch(() => {
                if (controller.signal.aborted) return;

                setProduct(null);
                setStatus("error");
            });

        return () => controller.abort();
    }, [slug]);

    if (status === "loading") {
        return (
            <div className={styles.message} role="status">
                Carregando o próximo drop...
            </div>
        );
    }

    if (status !== "ready" || !product) {
        return (
            <div className={styles.message}>
                <p>
                    {status === "error"
                        ? "Não conseguimos carregar este produto."
                        : "Produto não encontrado ou indisponível."}
                </p>
                <Link href="/#loja">Voltar para a loja ↗</Link>
            </div>
        );
    }

    const activeVariants = product.variants.filter((variant) => variant.active);

    const colors = [...new Set(activeVariants.map((variant) => variant.color))];

    const sizes = [
        ...new Set(
            activeVariants
                .filter((variant) => variant.color === selectedColor)
                .map((variant) => variant.size),
        ),
    ];

    const selectedVariant = activeVariants.find(
        (variant) =>
            variant.color === selectedColor && variant.size === selectedSize,
    );

    const stock = selectedVariant?.stock ?? 0;

    const available =
        selectedVariant !== undefined &&
        selectedVariant.stock !== null &&
        Number.isInteger(stock) &&
        stock > 0;

    const soldOut = activeVariants.every(
        (variant) => variant.stock === null || variant.stock <= 0,
    );

    const promotional = product.promotionalPrice;

    const hasPromotion =
        promotional !== null && promotional >= 0 && promotional < product.price;

    const displayPrice = hasPromotion ? promotional : product.price;

    const mainPhoto = product.images[photoIndex];

    function addSelectedItem() {
        if (!product || !selectedVariant || !available) return;

        try {
            const total = addToCart(product, selectedVariant, quantity);
            window.dispatchEvent(new Event(CART_OPEN_EVENT));

            setFeedback(
                `Adicionado à sacola. Agora são ${total} ${
                    total === 1 ? "unidade" : "unidades"
                } deste produto.`,
            );
        } catch (error) {
            setFeedback(
                error instanceof Error
                    ? error.message
                    : "Não foi possível adicionar o produto.",
            );
        }
    }

    return (
        <div className={styles.page}>
            <div className={styles.shell}>
                <nav
                    className={styles.breadcrumbs}
                    aria-label="Navegação estrutural"
                >
                    <Link href="/">Home</Link>
                    <span aria-hidden="true">/</span>
                    <Link href="/loja">Loja</Link>
                    <span aria-hidden="true">/</span>
                    <span aria-current="page">{product.name}</span>
                </nav>

                <div className={styles.grid}>
                    <div className={styles.gallery}>
                        <div className={styles.mainPhoto}>
                            {mainPhoto ? (
                                <Image
                                    src={mainPhoto.url}
                                    alt={mainPhoto.alt}
                                    fill
                                    unoptimized
                                    priority
                                    sizes="(max-width: 850px) 100vw, 55vw"
                                    className={styles.photo}
                                />
                            ) : (
                                <div className={styles.noPhoto}>
                                    <span>CHOUGA / DROP</span>
                                    <strong>Imagem em breve.</strong>
                                </div>
                            )}

                            <span className={styles.photoIndex}>
                                {String(photoIndex + 1).padStart(2, "0")}
                                {" / "}
                                {String(product.images.length || 1).padStart(
                                    2,
                                    "0",
                                )}
                            </span>
                        </div>

                        {product.images.length > 1 && (
                            <div
                                className={styles.thumbnails}
                                aria-label="Fotografias do produto"
                            >
                                {product.images.map((image, index) => (
                                    <button
                                        type="button"
                                        key={image.id ?? image.url}
                                        className={`${styles.thumbnail} ${
                                            photoIndex === index
                                                ? styles.thumbnailActive
                                                : ""
                                        }`}
                                        onClick={() => setPhotoIndex(index)}
                                        aria-label={`Ver fotografia ${index + 1}`}
                                        aria-pressed={photoIndex === index}
                                    >
                                        <Image
                                            src={image.url}
                                            alt=""
                                            fill
                                            unoptimized
                                            sizes="80px"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className={styles.information}>
                        <div className={styles.eyebrow}>
                            <span>{product.category.name}</span>
                            <span>CHOUGA / PRODUCT</span>
                        </div>

                        <h1 className={styles.title}>{product.name}</h1>

                        <div className={styles.priceRow}>
                            <strong className={styles.price}>
                                {money.format(displayPrice)}
                            </strong>

                            {hasPromotion && (
                                <del className={styles.oldPrice}>
                                    {money.format(product.price)}
                                </del>
                            )}
                        </div>

                        {product.description && (
                            <p className={styles.description}>
                                {product.description}
                            </p>
                        )}

                        <div className={styles.divider} />

                        <div className={styles.optionHeader}>
                            <h2>01 / Cor</h2>
                            <span>{selectedColor || "Selecione"}</span>
                        </div>

                        <div
                            className={styles.options}
                            aria-label="Selecione a cor"
                        >
                            {colors.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    aria-pressed={selectedColor === color}
                                    className={`${styles.option} ${
                                        selectedColor === color
                                            ? styles.optionActive
                                            : ""
                                    }`}
                                    onClick={() => {
                                        setSelectedColor(color);
                                        setSelectedSize("");
                                        setQuantity(1);
                                        setFeedback("");
                                    }}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>

                        <div className={styles.optionHeader}>
                            <h2>02 / Tamanho</h2>
                            <span>{selectedSize || "Selecione"}</span>
                        </div>

                        <div
                            className={styles.options}
                            aria-label="Selecione o tamanho"
                        >
                            {sizes.map((size) => {
                                const variant = activeVariants.find(
                                    (item) =>
                                        item.color === selectedColor &&
                                        item.size === size,
                                );

                                const disabled =
                                    !variant ||
                                    variant.stock === null ||
                                    variant.stock <= 0;

                                return (
                                    <button
                                        key={size}
                                        type="button"
                                        disabled={disabled}
                                        aria-pressed={selectedSize === size}
                                        title={
                                            disabled ? "Esgotado" : undefined
                                        }
                                        className={`${styles.option} ${
                                            selectedSize === size
                                                ? styles.optionActive
                                                : ""
                                        }`}
                                        onClick={() => {
                                            setSelectedSize(size);
                                            setQuantity(1);
                                            setFeedback("");
                                        }}
                                    >
                                        {size}
                                    </button>
                                );
                            })}
                        </div>

                        <p className={styles.availability}>
                            {soldOut
                                ? "Produto esgotado"
                                : !selectedSize
                                  ? "Escolha um tamanho para consultar a disponibilidade"
                                  : available
                                    ? `${stock} ${stock === 1 ? "unidade disponível" : "unidades disponíveis"}`
                                    : "Variação indisponível"}
                        </p>

                        <div className={styles.divider} />

                        <div className={styles.optionHeader}>
                            <h2>03 / Quantidade</h2>
                            <span>
                                {selectedVariant?.sku ?? "SKU não selecionado"}
                            </span>
                        </div>

                        <div className={styles.purchaseRow}>
                            <div
                                className={styles.quantityControl}
                                aria-label="Quantidade"
                            >
                                <button
                                    type="button"
                                    disabled={!available || quantity <= 1}
                                    onClick={() => {
                                        setQuantity((current) =>
                                            Math.max(1, current - 1),
                                        );
                                        setFeedback("");
                                    }}
                                    aria-label="Diminuir quantidade"
                                >
                                    −
                                </button>

                                <output aria-live="polite">{quantity}</output>

                                <button
                                    type="button"
                                    disabled={!available || quantity >= stock}
                                    onClick={() => {
                                        setQuantity((current) =>
                                            Math.min(stock, current + 1),
                                        );
                                        setFeedback("");
                                    }}
                                    aria-label="Aumentar quantidade"
                                >
                                    +
                                </button>
                            </div>

                            <button
                                type="button"
                                className={styles.buyButton}
                                disabled={!available || quantity > stock}
                                onClick={addSelectedItem}
                            >
                                {soldOut ? "ESGOTADO" : "ADICIONAR À SACOLA ↗"}
                            </button>
                        </div>

                        {feedback && (
                            <p className={styles.feedback} role="status">
                                {feedback}
                            </p>
                        )}

                        <p className={styles.disclaimer}>
                            A sacola não reserva estoque. Disponibilidade e
                            preço serão confirmados no checkout futuro.
                        </p>

                        <div className={styles.bottom}>
                            <span>SKATE / STREET / CULTURA</span>
                            <span>CHOUGA SKATEBOARD®</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
