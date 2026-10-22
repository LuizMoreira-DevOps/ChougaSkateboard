import { encodeSignatureHeader } from "@sanity/webhook";

const URL = "http://127.0.0.1:8000/";
const SECRET = Deno.env.get("SANITY_WEBHOOK_SECRET");

if (!SECRET) {
    throw new Error("Configure SANITY_WEBHOOK_SECRET para os testes.");
}

const body = JSON.stringify({
    _id: "produto-teste",
    _type: "product",
});

function checkStatus(actual: number, expected: number): void {
    if (actual !== expected) {
        throw new Error(`Esperado HTTP ${expected}, recebido ${actual}`);
    }
}

async function sendSignedRequest(
    timestamp: number,
    payload = body,
    options: { invalidContext?: boolean } = {},
): Promise<number> {
    const signature = await encodeSignatureHeader(body, timestamp, SECRET!);

    const response = await fetch(URL, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "sanity-webhook-signature": signature,
            "sanity-project-id": options.invalidContext
                ? "projeto-incorreto"
                : "esjkriae",
            "sanity-dataset": "production",
            "sanity-document-id": "produto-teste",
            "sanity-operation": "create",
            "idempotency-key": "teste-local-001",
        },
        body: payload,
    });

    return response.status;
}

Deno.test("assinatura válida alcança receptor", async () => {
    const status = await sendSignedRequest(Date.now());

    // O processamento ainda não foi implementado.
    checkStatus(status, 503);
});

Deno.test("assinatura expirada é rejeitada", async () => {
    const expired = Date.now() - 10 * 60 * 1000;
    const status = await sendSignedRequest(expired);

    checkStatus(status, 401);
});

Deno.test("alteração do corpo invalida a assinatura", async () => {
    const status = await sendSignedRequest(
        Date.now(),
        JSON.stringify({ _id: "produto-adulterado" }),
    );

    checkStatus(status, 401);
});

Deno.test("contexto incorreto é rejeitado", async () => {
    const status = await sendSignedRequest(Date.now(), body, {
        invalidContext: true,
    });

    checkStatus(status, 400);
});
