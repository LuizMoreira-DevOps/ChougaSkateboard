"use client";

import {
    useEffect,
    useMemo,
    useRef,
    useState,
    useSyncExternalStore,
    type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";

import type { Product } from "../../features/catalog/product";
import { getCatalogProductBySlug } from "../../features/catalog/getCatalogProducts";
import {
    CART_OPEN_EVENT,
    getCartSnapshot,
    getServerCartSnapshot,
    readCart,
    removeCartItem,
    subscribeCart,
    updateCartQuantity,
} from "../../features/cart/cartStorage";

import styles from "./CartDrawer.module.css";

const money = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
});

type Audit = {
    key: string;
    status: "ready" | "error";
    products: Record<string, Product | null>;
};

export function CartDrawer() {
    const serialized = useSyncExternalStore(
        subscribeCart,
        getCartSnapshot,
        getServerCartSnapshot,
    );

    const items = useMemo(() => readCart(serialized), [serialized]);

    const totalCount = items.reduce((total, item) => total + item.quantity, 0);

    const signature = [...new Set(items.map((item) => item.slug))]
        .sort()
        .join("|");

    const [open, setOpen] = useState(false);
    const [revision, setRevision] = useState(0);
    const [audit, setAudit] = useState<Audit | null>(null);
    const [actionError, setActionError] = useState("");

    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeRef = useRef<HTMLButtonElement>(null);
    const dialogRef = useRef<HTMLElement>(null);

    const auditKey = `${signature}:${revision}`;
    const verified = audit?.key === auditKey && audit.status === "ready";

    const verificationFailed =
        audit?.key === auditKey && audit.status === "error";

    function openDrawer() {
        setRevision((current) => current + 1);
        setActionError("");
        setOpen(true);
    }

    function closeDrawer() {
        setOpen(false);
    }

    // Permite abrir a sacola logo depois de adicionar
    // um produto na PDP.
    useEffect(() => {
        const onOpen = () => {
            setRevision((current) => current + 1);
            setActionError("");
            setOpen(true);
        };

        window.addEventListener(CART_OPEN_EVENT, onOpen);

        return () => {
            window.removeEventListener(CART_OPEN_EVENT, onOpen);
        };
    }, []);

    // Foco inicial, Escape, restauração do foco
    // e bloqueio da rolagem da página de fundo.

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;

        // Captura o elemento original antes do cleanup.
        const trigger = triggerRef.current;

        document.body.style.overflow = "hidden";

        closeRef.current?.focus();

        const onEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpen(false);
            }
        };

        document.addEventListener("keydown", onEscape);

        return () => {
            document.body.style.overflow = previousOverflow;

            document.removeEventListener("keydown", onEscape);

            // Restaura o foco ao elemento original.
            trigger?.focus();
        };
    }, [open]);

    // Consulta o estado comercial atual de cada produto.
    // Revalida ao abrir e pelo botão de atualização.
    useEffect(() => {
        if (!open || !signature) return;

        const controller = new AbortController();
        const slugs = signature.split("|");
        const requestKey = auditKey;

        async function verifyCart() {
            try {
                const pairs = await Promise.all(
                    slugs.map(async (slug) => {
                        const product = await getCatalogProductBySlug(
                            slug,
                            controller.signal,
                        );

                        return [slug, product] as const;
                    }),
                );

                if (controller.signal.aborted) return;

                setAudit({
                    key: requestKey,
                    status: "ready",
                    products: Object.fromEntries(pairs),
                });
            } catch {
                if (controller.signal.aborted) return;

                setAudit({
                    key: requestKey,
                    status: "error",
                    products: {},
                });
            }
        }

        void verifyCart();

        return () => controller.abort();
    }, [open, signature, auditKey]);

    function trapFocus(event: ReactKeyboardEvent<HTMLElement>) {
        if (event.key !== "Tab") return;

        const focusable = Array.from(
            dialogRef.current?.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), [tabindex="0"]',
            ) ?? [],
        ).filter((element) => element.getClientRects().length > 0);

        if (focusable.length === 0) {
            event.preventDefault();
            dialogRef.current?.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function handleRemove(productId: string, sku: string) {
        try {
            removeCartItem(productId, sku);
            setActionError("");
        } catch {
            setActionError("Não foi possível remover o item.");
        }
    }

    function handleQuantity(
        productId: string,
        sku: string,
        quantity: number,
        stock: number,
    ) {
        try {
            updateCartQuantity(productId, sku, quantity, stock);

            setActionError("");
        } catch (error) {
            setActionError(
                error instanceof Error ? error.message : "Quantidade inválida.",
            );
        }
    }

    const lines = items.map((item) => {
        const product = verified ? (audit?.products[item.slug] ?? null) : null;

        const variant =
            product?.id === item.productId
                ? product.variants.find(
                      (candidate) => candidate.sku === item.sku,
                  )
                : undefined;

        const stock =
            variant?.stock !== null && Number.isInteger(variant?.stock)
                ? (variant?.stock ?? 0)
                : 0;

        const available = Boolean(
            verified &&
            product?.active &&
            variant?.active &&
            stock >= item.quantity &&
            stock > 0,
        );

        const promotion = product?.promotionalPrice;
        const price =
            product &&
            promotion !== null &&
            promotion !== undefined &&
            promotion >= 0 &&
            promotion < product.price
                ? promotion
                : (product?.price ?? item.unitPrice);

        const image =
            product?.images.find((candidate) => candidate.isPrimary) ??
            product?.images[0];

        return {
            item,
            product,
            variant,
            stock,
            available,
            price,
            imageUrl: image?.url ?? null,
        };
    });

    const validLines = lines.filter((line) => line.available);

    const subtotal = validLines.reduce(
        (total, line) => total + line.price * line.item.quantity,
        0,
    );

    const unavailableCount = verified ? lines.length - validLines.length : 0;

    return (
        <div className={styles.mount}>
            <button
                ref={triggerRef}
                type="button"
                className={styles.trigger}
                onClick={openDrawer}
                aria-label={`Abrir sacola, ${totalCount} unidade(s)`}
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-controls="chouga-cart-panel"
            >
                <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <path d="M5 8h14l1 12H4L5 8Z" />
                    <path d="M9 9V6a3 3 0 0 1 6 0v3" />
                </svg>

                <span className={styles.triggerLabel}>Sacola</span>
                <span className={styles.count}>{totalCount}</span>
            </button>

            {open &&
                typeof document !== "undefined" &&
                createPortal(
                    <div className={styles.layer}>
                        <button
                            type="button"
                            className={styles.scrim}
                            tabIndex={-1}
                            aria-label="Fechar sacola"
                            onClick={closeDrawer}
                        />

                        <aside
                            ref={dialogRef}
                            id="chouga-cart-panel"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="chouga-cart-title"
                            tabIndex={-1}
                            className={styles.drawer}
                            onKeyDown={trapFocus}
                        >
                            <header className={styles.heading}>
                                <div className={styles.headingTop}>
                                    <span>CHOUGA / CHECKOUT PREVIEW</span>
                                    <span>041 / STREETWEAR</span>
                                </div>

                                <div className={styles.headingMain}>
                                    <div>
                                        <p className={styles.eyebrow}>
                                            SEU DROP
                                        </p>
                                        <h2 id="chouga-cart-title">
                                            SACOLA<span>.</span>
                                        </h2>
                                    </div>

                                    <button
                                        ref={closeRef}
                                        type="button"
                                        className={styles.close}
                                        onClick={closeDrawer}
                                        aria-label="Fechar sacola"
                                    >
                                        ×
                                    </button>
                                </div>

                                <p className={styles.headingCount}>
                                    {totalCount} UNIDADE(S) SELECIONADA(S)
                                </p>
                            </header>

                            <div className={styles.content}>
                                {items.length === 0 ? (
                                    <div className={styles.empty}>
                                        <span className={styles.emptyNumber}>
                                            00
                                        </span>
                                        <strong>
                                            AINDA NÃO TEM DROP POR AQUI.
                                        </strong>
                                        <p>
                                            A rua continua lá fora. Escolha o
                                            que combina com você.
                                        </p>
                                        <Link
                                            href="/#loja"
                                            onClick={closeDrawer}
                                        >
                                            EXPLORAR COLEÇÃO ↗
                                        </Link>
                                    </div>
                                ) : (
                                    <>
                                        <div className={styles.listToolbar}>
                                            <span>
                                                PRODUTOS / {items.length}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setRevision(
                                                        (current) =>
                                                            current + 1,
                                                    )
                                                }
                                            >
                                                ↻ ATUALIZAR ESTOQUE
                                            </button>
                                        </div>

                                        {verificationFailed && (
                                            <p
                                                className={styles.notice}
                                                role="alert"
                                            >
                                                Não conseguimos conferir os
                                                produtos agora. Quantidades
                                                bloqueadas até atualizar.
                                            </p>
                                        )}

                                        {!verified && !verificationFailed && (
                                            <p
                                                className={styles.notice}
                                                role="status"
                                            >
                                                Conferindo preço e estoque no
                                                catálogo...
                                            </p>
                                        )}

                                        <div className={styles.items}>
                                            {lines.map((line) => {
                                                const {
                                                    item,
                                                    product,
                                                    variant,
                                                    stock,
                                                    available,
                                                    price,
                                                    imageUrl,
                                                } = line;

                                                const productAvailable =
                                                    Boolean(
                                                        verified &&
                                                        product?.active &&
                                                        variant?.active &&
                                                        stock > 0,
                                                    );

                                                const overStock =
                                                    productAvailable &&
                                                    item.quantity > stock;

                                                return (
                                                    <article
                                                        className={styles.item}
                                                        key={`${item.productId}:${item.sku}`}
                                                    >
                                                        <div
                                                            className={
                                                                styles.itemMedia
                                                            }
                                                        >
                                                            {imageUrl ? (
                                                                <Image
                                                                    src={
                                                                        imageUrl
                                                                    }
                                                                    alt=""
                                                                    fill
                                                                    unoptimized
                                                                    sizes="110px"
                                                                    className={
                                                                        styles.itemImage
                                                                    }
                                                                />
                                                            ) : (
                                                                <span>
                                                                    CHOUGA
                                                                    <small>
                                                                        PRODUCT
                                                                    </small>
                                                                </span>
                                                            )}
                                                        </div>

                                                        <div
                                                            className={
                                                                styles.itemInfo
                                                            }
                                                        >
                                                            <Link
                                                                href={`/produto/?slug=${encodeURIComponent(item.slug)}`}
                                                                className={
                                                                    styles.itemName
                                                                }
                                                                onClick={
                                                                    closeDrawer
                                                                }
                                                            >
                                                                {product?.name ??
                                                                    item.name}
                                                            </Link>

                                                            <p
                                                                className={
                                                                    styles.variant
                                                                }
                                                            >
                                                                {variant?.color ??
                                                                    item.color ??
                                                                    "Cor"}
                                                                {" / "}
                                                                {variant?.size ??
                                                                    item.size ??
                                                                    "Tamanho"}
                                                            </p>

                                                            <p
                                                                className={
                                                                    styles.sku
                                                                }
                                                            >
                                                                SKU / {item.sku}
                                                            </p>

                                                            <strong
                                                                className={
                                                                    styles.itemPrice
                                                                }
                                                            >
                                                                {money.format(
                                                                    price,
                                                                )}
                                                            </strong>

                                                            <div
                                                                className={
                                                                    styles.itemControls
                                                                }
                                                            >
                                                                <div
                                                                    className={
                                                                        styles.quantity
                                                                    }
                                                                >
                                                                    <button
                                                                        type="button"
                                                                        aria-label={`Reduzir quantidade de ${item.name}`}
                                                                        disabled={
                                                                            !productAvailable ||
                                                                            item.quantity <=
                                                                                1
                                                                        }
                                                                        onClick={() =>
                                                                            handleQuantity(
                                                                                item.productId,
                                                                                item.sku,
                                                                                Math.min(
                                                                                    item.quantity -
                                                                                        1,
                                                                                    stock,
                                                                                ),
                                                                                stock,
                                                                            )
                                                                        }
                                                                    >
                                                                        −
                                                                    </button>

                                                                    <output>
                                                                        {
                                                                            item.quantity
                                                                        }
                                                                    </output>

                                                                    <button
                                                                        type="button"
                                                                        aria-label={`Aumentar quantidade de ${item.name}`}
                                                                        disabled={
                                                                            !available ||
                                                                            item.quantity >=
                                                                                stock
                                                                        }
                                                                        onClick={() =>
                                                                            handleQuantity(
                                                                                item.productId,
                                                                                item.sku,
                                                                                item.quantity +
                                                                                    1,
                                                                                stock,
                                                                            )
                                                                        }
                                                                    >
                                                                        +
                                                                    </button>
                                                                </div>

                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        styles.remove
                                                                    }
                                                                    onClick={() =>
                                                                        handleRemove(
                                                                            item.productId,
                                                                            item.sku,
                                                                        )
                                                                    }
                                                                >
                                                                    REMOVER
                                                                </button>
                                                            </div>

                                                            {verified &&
                                                                !available && (
                                                                    <p
                                                                        className={
                                                                            styles.stockAlert
                                                                        }
                                                                    >
                                                                        {overStock
                                                                            ? `Estoque mudou: apenas ${stock} disponível(is).`
                                                                            : "Produto ou variação indisponível."}
                                                                    </p>
                                                                )}

                                                            {overStock && (
                                                                <button
                                                                    type="button"
                                                                    className={
                                                                        styles.adjust
                                                                    }
                                                                    onClick={() =>
                                                                        handleQuantity(
                                                                            item.productId,
                                                                            item.sku,
                                                                            stock,
                                                                            stock,
                                                                        )
                                                                    }
                                                                >
                                                                    AJUSTAR PARA{" "}
                                                                    {stock}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </article>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}

                                {actionError && (
                                    <p className={styles.notice} role="alert">
                                        {actionError}
                                    </p>
                                )}
                            </div>

                            <footer className={styles.footer}>
                                <div className={styles.subtotal}>
                                    <span>SUBTOTAL ESTIMADO</span>
                                    <strong>
                                        {items.length === 0
                                            ? money.format(0)
                                            : verified
                                              ? money.format(subtotal)
                                              : "A CONFERIR"}
                                    </strong>
                                </div>

                                {unavailableCount > 0 && (
                                    <p className={styles.footerAlert}>
                                        {unavailableCount} item(ns)
                                        indisponível(is) não incluído(s) no
                                        subtotal.
                                    </p>
                                )}

                                <p className={styles.footerNote}>
                                    Os itens não reservam estoque. Preços e
                                    disponibilidade dependem de confirmação no
                                    checkout.
                                </p>

                                <button
                                    type="button"
                                    disabled
                                    className={styles.checkout}
                                    title="Integração comercial em desenvolvimento"
                                >
                                    CHECKOUT EM DESENVOLVIMENTO ↗
                                </button>

                                <button
                                    type="button"
                                    className={styles.continue}
                                    onClick={closeDrawer}
                                >
                                    CONTINUAR EXPLORANDO
                                </button>
                            </footer>
                        </aside>
                    </div>,
                    document.body,
                )}
        </div>
    );
}
