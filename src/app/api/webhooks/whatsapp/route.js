import { createHmac, timingSafeEqual } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(left, right) {
  const a = Buffer.from(String(left ?? ""), "utf8");
  const b = Buffer.from(String(right ?? ""), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Meta webhook verification handshake.
 * Configure META_WHATSAPP_VERIFY_TOKEN in Vercel before verifying the
 * callback URL in the Meta Developer dashboard.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const expectedToken = process.env.META_WHATSAPP_VERIFY_TOKEN;

  if (!expectedToken) {
    return new Response("Webhook verification is not configured", { status: 503 });
  }

  if (mode === "subscribe" && token && safeEqual(token, expectedToken) && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return new Response("Forbidden", { status: 403 });
}

/**
 * Meta webhook event receiver.
 * Verify the raw request body against X-Hub-Signature-256 before parsing.
 * Only event metadata is logged; message contents and employee phone numbers
 * are deliberately not written to application logs.
 */
export async function POST(request) {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    return new Response("Webhook signature verification is not configured", { status: 503 });
  }

  const signature = request.headers.get("x-hub-signature-256") || "";
  if (!signature.startsWith("sha256=")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rawBody = await request.text();
  const expectedSignature =
    "sha256=" + createHmac("sha256", appSecret).update(rawBody, "utf8").digest("hex");

  if (!safeEqual(signature, expectedSignature)) {
    return new Response("Unauthorized", { status: 401 });
  }

  let payload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (payload?.object !== "whatsapp_business_account") {
    return new Response("Unsupported event", { status: 404 });
  }

  // Acknowledge valid Meta events quickly. Persisting delivery events into
  // the payroll database will be added with the HR delivery-report workflow.
  const entryCount = Array.isArray(payload.entry) ? payload.entry.length : 0;
  const changeCount = Array.isArray(payload.entry)
    ? payload.entry.reduce(
        (total, entry) => total + (Array.isArray(entry?.changes) ? entry.changes.length : 0),
        0
      )
    : 0;

  console.info("[WhatsApp webhook] Valid event received", {
    object: payload.object,
    entryCount,
    changeCount,
  });

  return Response.json({ received: true }, { status: 200 });
}
