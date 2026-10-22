import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

const PROJECT_ID = "esjkriae";
const DATASET = "production";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_AGE_MS = 5 * 60 * 1000;

async function readLimitedBody(request: Request): Promise<string | null> {
    const reader = request.body?.getReader();

    if (!reader) return null;

    const decoder = new TextDecoder();
    let bytes = 0;
    let body = "";

    while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        bytes += value.byteLength;

        if (bytes > MAX_BODY_BYTES) {
            await reader.cancel();
            return null;
        }

        body += decoder.decode(value, { stream: true });
    }

    body += decoder.decode();

    return body;
}

Deno.serve(async (request: Request): Promise<Response> => {
    if (request.method !== "POST") {
        return new Response("Method not allowed", {
            status: 405,
            headers: { Allow: "POST" },
        });
    }

    const secret = Deno.env.get("SANITY_WEBHOOK_SECRET");

    if (!secret) {
        console.error("Webhook secret is not configured");

        return new Response("Service unavailable", {
            status: 503,
        });
    }

    const contentType = request.headers
        .get("content-type")
        ?.split(";")[0]
        .trim()
        .toLowerCase();

    if (contentType !== "application/json") {
        return new Response("Unsupported media type", {
            status: 415,
        });
    }

    const signature = request.headers.get(SIGNATURE_HEADER_NAME);

    if (!signature) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    const timestamp = Number(/^t=(\d+)[, ]+v1=/.exec(signature)?.[1]);

    const age = Math.abs(Date.now() - timestamp);

    if (!Number.isSafeInteger(timestamp) || age > MAX_AGE_MS) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    const rawBody = await readLimitedBody(request);

    if (!rawBody) {
        return new Response("Invalid or oversized payload", {
            status: 413,
        });
    }

    let validSignature = false;

    try {
        validSignature = await isValidSignature(rawBody, signature, secret);
    } catch {
        return new Response("Signature validation failed", {
            status: 503,
        });
    }

    if (!validSignature) {
        return new Response("Unauthorized", {
            status: 401,
        });
    }

    const projectId = request.headers.get("sanity-project-id");

    const dataset = request.headers.get("sanity-dataset");

    const documentId = request.headers.get("sanity-document-id");

    const operation = request.headers.get("sanity-operation");

    const deliveryId = request.headers.get("idempotency-key");

    if (
        projectId !== PROJECT_ID ||
        dataset !== DATASET ||
        !documentId ||
        !["create", "update", "delete"].includes(operation ?? "") ||
        !deliveryId ||
        deliveryId.length > 200
    ) {
        return new Response("Invalid webhook context", {
            status: 400,
        });
    }

    let payload: unknown;

    try {
        payload = JSON.parse(rawBody);
    } catch {
        return new Response("Invalid JSON", {
            status: 400,
        });
    }

    if (
        typeof payload !== "object" ||
        payload === null ||
        Array.isArray(payload)
    ) {
        return new Response("Invalid payload", {
            status: 400,
        });
    }

    // Segurança: nenhuma escrita antes da implementação
    // de idempotência, validação dos documentos e RPC.

    return new Response("Processing not configured", {
        status: 503,
    });
});
