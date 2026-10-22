import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockCatalog } from "./helpers/mockCatalog";

const productUrl = "/produto/?slug=camiseta-chouga-teste-branca";

async function focusInside(page: Page, selector: string): Promise<boolean> {
    return page.evaluate((target) => {
        const root = document.querySelector(target);
        return Boolean(
            root &&
            document.activeElement &&
            root.contains(document.activeElement),
        );
    }, selector);
}

test.beforeEach(async ({ page }) => {
    await mockCatalog(page);
});

test("sacola vazia: foco inicial, ciclo de Tab, Escape e restauração do foco", async ({
    page,
}) => {
    await page.goto("/loja");
    await expect(
        page.getByRole("heading", { name: /os drops/i }),
    ).toBeVisible();

    const trigger = page.getByRole("button", { name: /abrir sacola/i });
    await trigger.focus();
    await page.keyboard.press("Enter");

    const cart = page.getByRole("dialog", { name: /sacola/i });
    const close = cart.getByRole("button", { name: "Fechar sacola" });
    const last = cart.getByRole("button", { name: /continuar explorando/i });

    await expect(cart).toBeVisible();
    await expect(close).toBeFocused();
    await expect
        .poll(() => page.evaluate(() => document.body.style.overflow))
        .toBe("hidden");

    await page.keyboard.press("Shift+Tab");
    await expect(last).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(cart).not.toBeVisible();
    await expect(trigger).toBeFocused();
    await expect
        .poll(() => page.evaluate(() => document.body.style.overflow))
        .not.toBe("hidden");
});

test("sacola mantém duas unidades após recarregar a página", async ({
    page,
}) => {
    await page.goto(productUrl);
    await expect(
        page.getByRole("heading", { name: /camiseta chouga teste branca/i }),
    ).toBeVisible();

    await page.getByRole("button", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: "Aumentar quantidade" }).click();
    await page.getByRole("button", { name: /adicionar à sacola/i }).click();

    const cart = page.getByRole("dialog", { name: /sacola/i });
    await expect(cart).toBeVisible();
    await expect(cart.getByText("R$ 190,00", { exact: true })).toBeVisible();
    await cart.getByRole("button", { name: "Fechar sacola" }).click();

    await page.reload();
    const trigger = page.getByRole("button", {
        name: /abrir sacola, 2 unidade/i,
    });
    await expect(trigger).toBeVisible();
    await trigger.click();

    await expect(cart).toBeVisible();
    await expect(cart.getByText("R$ 190,00", { exact: true })).toBeVisible();
    await expect(
        cart.getByRole("button", { name: /aumentar quantidade/i }),
    ).toBeEnabled();
});

test("sacola limita estoque e permite remover item sem resíduo", async ({
    page,
}) => {
    await page.goto(productUrl);
    await expect(
        page.getByRole("heading", { name: /camiseta chouga teste branca/i }),
    ).toBeVisible();
    await page.getByRole("button", { name: "M", exact: true }).click();
    await page.getByRole("button", { name: /adicionar à sacola/i }).click();

    const cart = page.getByRole("dialog", { name: /sacola/i });
    await expect(cart).toBeVisible();
    await expect(
        cart.getByRole("article").getByText("R$ 95,00", { exact: true }),
    ).toBeVisible();

    const plus = cart.getByRole("button", { name: /aumentar quantidade/i });
    for (let n = 1; n < 7; n++) await plus.click();
    await expect(plus).toBeDisabled();
    await expect(cart.getByText("R$ 665,00", { exact: true })).toBeVisible();

    await cart.getByRole("button", { name: "REMOVER" }).click();
    await expect(cart.getByText(/ainda não tem drop por aqui/i)).toBeVisible();
    await cart.getByRole("button", { name: "Fechar sacola" }).click();
    await page.reload();
    await expect(
        page.getByRole("button", { name: /abrir sacola, 0 unidade/i }),
    ).toBeVisible();
});

test("filtros mobile/tablet: foco confinado e Escape devolve ao botão", async ({
    page,
}) => {
    test.skip(
        (page.viewportSize()?.width ?? 1440) > 900,
        "O desktop usa sidebar, não dialog modal.",
    );

    await page.goto("/loja");
    const trigger = page.getByRole("button", { name: /mostrar filtros/i });
    await expect(trigger).toBeVisible();
    await trigger.focus();
    await page.keyboard.press("Enter");

    const dialog = page.locator("#store-drawer");
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("open", "");
    await expect.poll(() => focusInside(page, "#store-drawer")).toBe(true);

    for (let i = 0; i < 12; i++) {
        await page.keyboard.press("Tab");
        expect(
            await focusInside(page, "#store-drawer"),
            `Tab #${i + 1} saiu do dialog`,
        ).toBe(true);
    }
    for (let i = 0; i < 12; i++) {
        await page.keyboard.press("Shift+Tab");
        expect(
            await focusInside(page, "#store-drawer"),
            `Shift+Tab #${i + 1} saiu do dialog`,
        ).toBe(true);
    }

    await page.keyboard.press("Escape");
    await expect(dialog).not.toBeVisible();
    await expect(trigger).toBeFocused();
});

test("filtros mobile/tablet: seleciona categoria, aplica e mostra chip", async ({
    page,
}) => {
    test.skip(
        (page.viewportSize()?.width ?? 1440) > 900,
        "O desktop usa sidebar.",
    );

    await page.goto("/loja");
    await page.getByRole("button", { name: /mostrar filtros/i }).click();
    const dialog = page.locator("#store-drawer");
    await dialog.getByRole("button", { name: "Camisetas Básicas" }).click();
    await dialog.getByRole("button", { name: /ver 1 produto/i }).click();
    await expect(dialog).not.toBeVisible();
    await expect(
        page.getByRole("button", {
            name: /remover filtro categoria: camisetas básicas/i,
        }),
    ).toBeVisible();
    await expect(
        page.getByRole("link", {
            name: /ver detalhes de camiseta chouga teste branca/i,
        }),
    ).toBeVisible();
    await expect(
        page.getByRole("link", {
            name: /ver detalhes de camiseta chouga teste preta/i,
        }),
    ).toHaveCount(0);
});

test("desktop: barra lateral filtra catálogo sem abrir dialog", async ({
    page,
}) => {
    test.skip(
        (page.viewportSize()?.width ?? 0) <= 900,
        "Teste exclusivo de desktop.",
    );

    await page.goto("/loja");
    await page.getByRole("button", { name: /mostrar filtros/i }).click();
    const sidebar = page.locator("#store-sidebar");
    await expect(sidebar).toBeVisible();
    await expect(page.locator("#store-drawer")).not.toBeVisible();

    await sidebar.getByRole("button", { name: "Camisetas Básicas" }).click();
    await expect(
        page.getByRole("button", {
            name: /remover filtro categoria: camisetas básicas/i,
        }),
    ).toBeVisible();
    await expect(
        page.getByRole("link", {
            name: /ver detalhes de camiseta chouga teste preta/i,
        }),
    ).toHaveCount(0);
});

test("axe: sacola aberta sem violações WCAG automatizáveis", async ({
    page,
}) => {
    await page.goto("/loja");
    await page.getByRole("button", { name: /abrir sacola/i }).click();
    await expect(page.getByRole("dialog", { name: /sacola/i })).toBeVisible();

    const scan = await new AxeBuilder({ page })
        .include("#chouga-cart-panel")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

    expect(scan.violations, JSON.stringify(scan.violations, null, 2)).toEqual(
        [],
    );
});

test("axe: filtro modal sem violações WCAG automatizáveis", async ({
    page,
}) => {
    test.skip(
        (page.viewportSize()?.width ?? 1440) > 900,
        "O desktop não tem filtro modal.",
    );

    await page.goto("/loja");
    await page.getByRole("button", { name: /mostrar filtros/i }).click();
    await expect(page.locator("#store-drawer")).toBeVisible();

    const scan = await new AxeBuilder({ page })
        .include("#store-drawer")
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

    expect(scan.violations, JSON.stringify(scan.violations, null, 2)).toEqual(
        [],
    );
});
