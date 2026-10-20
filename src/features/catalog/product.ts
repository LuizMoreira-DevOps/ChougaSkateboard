/**
 * Contrato de domínio do catálogo Chouga V2.0.
 *
 * Não depende do Supabase, Sanity, Next.js
 * ou de componentes visuais.
 */

export type ProductImage = {
    id: string | null;
    url: string;
    alt: string;
    colorSlug: string | null;
    isPrimary: boolean;
    order: number;
};

export type ProductVariant = {
    sku: string;
    color: string;
    size: string;
    stock: number | null;
    active: boolean;
};

export type Product = {
    id: string;
    slug: string;
    name: string;
    description: string | null;

    price: number;
    promotionalPrice: number | null;

    category: {
        name: string;
        slug: string;
    };

    images: ProductImage[];
    variants: ProductVariant[];
    tags: string[];

    featured: boolean;
    active: boolean;
};
