import type { Product } from "./product";
import { adaptSupabaseProduct } from "./supabaseProductAdapter";

function getPublicConfig() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const projectRef = process.env.NEXT_PUBLIC_SUPABASE_DEV_PROJECT_REF;

    if (!url || !key || !projectRef) {
        throw new Error(
            "Configuração pública do Supabase Development ausente.",
        );
    }

    const parsed = new URL(url);

    if (
        parsed.protocol !== "https:" ||
        parsed.hostname !== `${projectRef}.supabase.co` ||
        parsed.pathname !== "/" ||
        parsed.search ||
        parsed.hash
    ) {
        throw new Error("URL do Supabase Development inválida.");
    }

    if (!key.startsWith("sb_publishable_")) {
        throw new Error("Chave pública Development inválida.");
    }

    return { url: parsed, key };
}

export async function getCatalogProducts(
    signal?: AbortSignal,
): Promise<Product[]> {
    const { url, key } = getPublicConfig();

    const endpoint = new URL("/rest/v1/produtos_catalogo", url);

    endpoint.searchParams.set("select", "*");
    endpoint.searchParams.set("order", "nome.asc");
    endpoint.searchParams.set("limit", "50");

    const response = await fetch(endpoint, {
        method: "GET",
        signal,
        cache: "no-store",
        headers: {
            apikey: key,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Falha ao consultar catálogo: HTTP ${response.status}`);
    }

    const records: unknown = await response.json();

    if (!Array.isArray(records)) {
        throw new Error("Resposta inválida do catálogo.");
    }

    return records
        .map((record) => {
            if (
                record === null ||
                typeof record !== "object" ||
                Array.isArray(record)
            ) {
                throw new Error("Registro de produto inválido.");
            }

            return adaptSupabaseProduct(record as Record<string, unknown>);
        })
        .filter((product) => product.active);
}

export async function getCatalogProductBySlug(
    slug: string,
    signal?: AbortSignal,
): Promise<Product | null> {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        return null;
    }

    const { url, key } = getPublicConfig();

    const endpoint = new URL("/rest/v1/produtos_catalogo", url);

    endpoint.searchParams.set("select", "*");
    endpoint.searchParams.set("slug", `eq.${slug}`);
    endpoint.searchParams.set("limit", "1");

    const response = await fetch(endpoint, {
        signal,
        cache: "no-store",
        headers: {
            apikey: key,
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`Falha ao consultar produto: HTTP ${response.status}`);
    }

    const records: unknown = await response.json();

    if (!Array.isArray(records)) {
        throw new Error("Resposta inválida do catálogo.");
    }

    const record: unknown = records[0];

    if (record === undefined) return null;

    if (
        record === null ||
        typeof record !== "object" ||
        Array.isArray(record)
    ) {
        throw new Error("Registro inválido.");
    }

    const product = adaptSupabaseProduct(record as Record<string, unknown>);

    return product.active ? product : null;
}
