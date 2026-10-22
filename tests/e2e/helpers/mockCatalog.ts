import type { Page } from "@playwright/test";

// Contrato da view public.produtos_catalogo, consumida pelo adaptador real.
// Nunca grava estoque; serve respostas de GET interceptadas no navegador.
const rows = [
    {
        id: "e2e-basic",
        slug: "camiseta-chouga-teste-branca",
        nome: "Camiseta Chouga Teste Branca",
        descricao: "100% algodão",
        preco: 95,
        preco_promocional: null,
        categoria_slug: "camisetas-basicas",
        categoria_nome: "Camisetas Básicas",
        ativo: true,
        destaque: true,
        imagens: [],
        tags: [],
        variacoes: [
            { sku: "CHOUGA-E2E-BRANCA-M", cor: "Branco", tamanho: "M", estoque: 7, ativo: true },
        ],
    },
    {
        id: "e2e-outra",
        slug: "camiseta-chouga-teste-preta",
        nome: "Camiseta Chouga Teste Preta",
        descricao: "100% algodão",
        preco: 180,
        preco_promocional: null,
        categoria_slug: "camisetas-premium",
        categoria_nome: "Camisetas Premium",
        ativo: true,
        destaque: false,
        imagens: [],
        tags: [],
        variacoes: [
            { sku: "CHOUGA-E2E-PRETA-G", cor: "Preto", tamanho: "G", estoque: 2, ativo: true },
        ],
    },
];

export async function mockCatalog(page: Page): Promise<void> {
    await page.route("**/rest/v1/produtos_catalogo**", async (route) => {
        const cors = {
            "access-control-allow-origin": "*",
            "access-control-allow-methods": "GET, OPTIONS",
            "access-control-allow-headers": "apikey, accept, authorization, content-type, x-client-info",
        };

        if (route.request().method() === "OPTIONS") {
            await route.fulfill({ status: 204, headers: cors });
            return;
        }

        if (route.request().method() !== "GET") {
            // Falha estritamente: nenhum teste pode escrever no Supabase.
            await route.fulfill({ status: 405, headers: cors });
            return;
        }

        const url = new URL(route.request().url());
        const slug = url.searchParams.get("slug");
        const result = slug?.startsWith("eq.")
            ? rows.filter((item) => item.slug === slug.slice(3))
            : rows;

        await route.fulfill({
            status: 200,
            contentType: "application/json; charset=utf-8",
            headers: cors,
            body: JSON.stringify(result),
        });
    });
}
