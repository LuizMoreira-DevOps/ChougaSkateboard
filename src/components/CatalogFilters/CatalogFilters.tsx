"use client";

import { useEffect, useRef, useState } from "react";

import {
    EMPTY_STORE_FILTERS,
    PRICE_OPTIONS,
    countActiveFilters,
    type CatalogFilterOptions,
    type PriceRange,
    type StoreFilters,
} from "../../features/catalog/filterCatalogProducts";
import styles from "./CatalogFilters.module.css";

type Props = {
    open: boolean;
    options: CatalogFilterOptions;
    value: StoreFilters;
    onChange: (
        next: StoreFilters | ((previous: StoreFilters) => StoreFilters),
    ) => void;
    onClose: () => void;
    resultCount: number;
};

type PanelProps = {
    options: CatalogFilterOptions;
    value: StoreFilters;
    titleId: string;
    onCategoryChange: (slug: string) => void;
    onSizeToggle: (size: string) => void;
    onColorToggle: (color: string) => void;
    onPriceChange: (range: PriceRange) => void;
    onClear: () => void;
};

type SectionKey = "category" | "size" | "color" | "price";

function FilterPanel({
    options,
    value,
    titleId,
    onCategoryChange,
    onSizeToggle,
    onColorToggle,
    onPriceChange,
    onClear,
}: PanelProps) {
    const [expanded, setExpanded] = useState<Record<SectionKey, boolean>>({
        category: true,
        size: false,
        color: false,
        price: false,
    });
    const activeCount = countActiveFilters(value);

    const toggle = (section: SectionKey) =>
        setExpanded((previous) => ({
            ...previous,
            [section]: !previous[section],
        }));

    function sectionHeader(section: SectionKey, label: string, count: number) {
        const isOpen = expanded[section];
        return (
            <button
                type="button"
                className={styles.summary}
                aria-expanded={isOpen}
                aria-controls={`${titleId}-${section}`}
                onClick={() => toggle(section)}
            >
                <span>{label}</span>
                {count > 0 && (
                    <span
                        className={styles.activeMark}
                        aria-label={`${count} opções selecionadas`}
                    >
                        {String(count).padStart(2, "0")}
                    </span>
                )}
                <span
                    className={styles.expandIcon}
                    data-expanded={isOpen}
                    aria-hidden="true"
                />
            </button>
        );
    }

    return (
        <div className={styles.panel}>
            <div className={styles.brandLine}>
                <span>CHOUGA / CATÁLOGO</span>
                <span className={styles.brandStamp}>041</span>
            </div>
            <div className={styles.intro}>
                <h2 id={titleId} className={styles.title}>
                    REFINAR<span>.</span>
                </h2>
                <p>Encontre sua próxima peça.</p>
            </div>

            <div className={styles.sectionList}>
                <section className={styles.section}>
                    {sectionHeader(
                        "category",
                        "CATEGORIA",
                        Number(Boolean(value.category)),
                    )}
                    <div
                        className={styles.options}
                        id={`${titleId}-category`}
                        role="group"
                        aria-label="Filtrar por categoria"
                        hidden={!expanded.category}
                    >
                        {[
                            { slug: "", name: "Todas as peças" },
                            ...options.categories,
                        ].map((item) => (
                            <button
                                key={item.slug || "all"}
                                type="button"
                                className={styles.choice}
                                aria-pressed={value.category === item.slug}
                                onClick={() => onCategoryChange(item.slug)}
                            >
                                <span>{item.name}</span>
                                <span
                                    className={styles.choiceIndicator}
                                    aria-hidden="true"
                                >
                                    {value.category === item.slug ? "✓" : ""}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>

                <section className={styles.section}>
                    {sectionHeader("size", "TAMANHO", value.sizes.length)}
                    <div
                        className={styles.sectionContent}
                        id={`${titleId}-size`}
                        hidden={!expanded.size}
                    >
                        {options.sizes.length ? (
                            <div
                                className={styles.sizeGrid}
                                role="group"
                                aria-label="Filtrar por tamanho"
                            >
                                {options.sizes.map((size) => (
                                    <button
                                        key={size.key}
                                        type="button"
                                        className={styles.sizeButton}
                                        aria-pressed={value.sizes.includes(
                                            size.key,
                                        )}
                                        onClick={() => onSizeToggle(size.key)}
                                    >
                                        {size.label}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.noOptions}>
                                Sem tamanhos disponíveis no estoque.
                            </p>
                        )}
                    </div>
                </section>

                <section className={styles.section}>
                    {sectionHeader("color", "COR", value.colors.length)}
                    <div
                        className={styles.sectionContent}
                        id={`${titleId}-color`}
                        hidden={!expanded.color}
                    >
                        {options.colors.length ? (
                            <div
                                className={styles.colorOptions}
                                role="group"
                                aria-label="Filtrar por cor"
                            >
                                {options.colors.map((color) => (
                                    <button
                                        key={color.key}
                                        type="button"
                                        className={styles.colorButton}
                                        aria-pressed={value.colors.includes(
                                            color.key,
                                        )}
                                        onClick={() => onColorToggle(color.key)}
                                    >
                                        <span
                                            className={styles.colorDot}
                                            data-tone={color.key}
                                            aria-hidden="true"
                                        />
                                        <span>{color.label}</span>
                                        <span
                                            className={styles.choiceIndicator}
                                            aria-hidden="true"
                                        >
                                            {value.colors.includes(color.key)
                                                ? "✓"
                                                : ""}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className={styles.noOptions}>
                                Sem cores disponíveis no estoque.
                            </p>
                        )}
                    </div>
                </section>

                <section className={styles.section}>
                    {sectionHeader(
                        "price",
                        "PREÇO",
                        Number(Boolean(value.price)),
                    )}
                    <div
                        className={styles.sectionContent}
                        id={`${titleId}-price`}
                        hidden={!expanded.price}
                    >
                        <div
                            className={styles.priceOptions}
                            role="group"
                            aria-label="Filtrar por preço"
                        >
                            {PRICE_OPTIONS.map((price) => (
                                <button
                                    key={price.id}
                                    type="button"
                                    className={styles.priceButton}
                                    aria-pressed={value.price === price.id}
                                    onClick={() => onPriceChange(price.id)}
                                >
                                    <span
                                        className={styles.radioMark}
                                        aria-hidden="true"
                                    />
                                    <span>{price.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>

            <div className={styles.panelFooter}>
                <div className={styles.selectionCount}>
                    <span>
                        FILTROS ATIVOS: {String(activeCount).padStart(2, "0")}
                    </span>
                </div>
                <button
                    type="button"
                    className={styles.clearButton}
                    onClick={onClear}
                    disabled={activeCount === 0}
                >
                    LIMPAR SELEÇÕES <span aria-hidden="true">×</span>
                </button>
                <p className={styles.previewNote}>
                    Tamanho e cor consideram variantes ativas com estoque
                    disponível. Combine opções para encontrar seu próximo drop.
                </p>
            </div>
        </div>
    );
}

export function CatalogFilters({
    open,
    options,
    value,
    onChange,
    onClose,
    resultCount,
}: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        const media = window.matchMedia("(max-width: 900px)");
        const previousOverflow = document.body.style.overflow;

        const sync = () => {
            if (open && media.matches) {
                if (!dialog.open) dialog.showModal();
                document.body.style.overflow = "hidden";
            } else {
                if (dialog.open) dialog.close();
                document.body.style.overflow = previousOverflow;
            }
        };

        sync();
        media.addEventListener("change", sync);
        return () => {
            media.removeEventListener("change", sync);
            if (dialog.open) dialog.close();
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    const toggleSize = (size: string) =>
        onChange((previous) => ({
            ...previous,
            sizes: previous.sizes.includes(size)
                ? previous.sizes.filter((item) => item !== size)
                : [...previous.sizes, size],
        }));

    const toggleColor = (color: string) =>
        onChange((previous) => ({
            ...previous,
            colors: previous.colors.includes(color)
                ? previous.colors.filter((item) => item !== color)
                : [...previous.colors, color],
        }));

    const choosePrice = (price: PriceRange) =>
        onChange((previous) => ({
            ...previous,
            price: previous.price === price ? "" : price,
        }));

    const shared = {
        options,
        value,
        onCategoryChange: (category: string) =>
            onChange((previous) => ({ ...previous, category })),
        onSizeToggle: toggleSize,
        onColorToggle: toggleColor,
        onPriceChange: choosePrice,
        onClear: () => onChange(EMPTY_STORE_FILTERS),
    };

    function trapDialogFocus(event: React.KeyboardEvent<HTMLDialogElement>) {
        if (event.key !== "Tab") return;

        const dialog = dialogRef.current;
        if (!dialog) return;

        const focusable = Array.from(
            dialog.querySelectorAll<HTMLElement>(
                'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
        ).filter((element) => element.getClientRects().length > 0);

        if (focusable.length === 0) {
            event.preventDefault();
            dialog.focus();
            return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        if (event.shiftKey && (active === first || active === dialog)) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && (active === last || active === dialog)) {
            event.preventDefault();
            first.focus();
        }
    }

    return (
        <>
            <aside
                id="store-sidebar"
                className={styles.sidebar}
                hidden={!open}
                aria-label="Filtros do catálogo"
            >
                <FilterPanel {...shared} titleId="desktop-filter-title" />
            </aside>

            <dialog
                id="store-drawer"
                ref={dialogRef}
                className={styles.drawer}
                aria-labelledby="mobile-filter-title"
                onKeyDown={trapDialogFocus}
                onCancel={(event) => {
                    event.preventDefault();
                    onClose();
                }}
                onClick={(event) => {
                    if (event.target !== event.currentTarget) return;
                    const rect = event.currentTarget.getBoundingClientRect();
                    if (
                        event.clientX < rect.left ||
                        event.clientX > rect.right ||
                        event.clientY < rect.top ||
                        event.clientY > rect.bottom
                    )
                        onClose();
                }}
            >
                <div className={styles.mobileToolbar}>
                    <span>CHOUGA / FILTROS</span>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Fechar filtros"
                    >
                        ×
                    </button>
                </div>
                <div className={styles.mobileContent}>
                    <FilterPanel {...shared} titleId="mobile-filter-title" />
                </div>
                <div className={styles.mobileBottom}>
                    <button
                        type="button"
                        className={styles.doneButton}
                        onClick={onClose}
                    >
                        VER {resultCount}{" "}
                        {resultCount === 1 ? "PRODUTO" : "PRODUTOS"}
                        <span aria-hidden="true">↗</span>
                    </button>
                </div>
            </dialog>
        </>
    );
}
