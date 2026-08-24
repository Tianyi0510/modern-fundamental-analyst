import { NextResponse } from "next/server";
import { readLimitedText, RequestBodyError } from "@/lib/api-request";
import { getResendClient, runResendOperation } from "@/lib/resend";
import { getResendWebhookHeaders, getUnsubscribeRecipients } from "@/lib/resend-webhook";

export const runtime = "nodejs";

const MAX_WEBHOOK_BYTES = 100_000;

export async function POST(request: Request) {
  const resend = getResendClient();
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!resend || !webhookSecret) {
    console.error("Resend webhook configuration is unavailable.");
    return NextResponse.json({ error: "Webhook service unavailable." }, { status: 503 });
  }

  const headers = getResendWebhookHeaders(request.headers);
  if (!headers) return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });

  let payload: string;
  try {
    payload = await readLimitedText(request, MAX_WEBHOOK_BYTES);
  } catch (error) {
    const status = error instanceof RequestBodyError ? error.status : 400;
    return NextResponse.json({ error: "Invalid webhook." }, { status });
  }

  let event;
  try {
    event = resend.webhooks.verify({ payload, headers, webhookSecret });
  } catch {
    return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });
  }

  const recipients = getUnsubscribeRecipients(event);
  const updates = await Promise.all(recipients.map((email) => runResendOperation(
    "Resend webhook contact update failed",
    () => resend.contacts.update({ email, unsubscribed: true }),
  )));

  const retryableFailure = updates.some((result) => !result || (result.error && result.error.statusCode !== 404));
  if (retryableFailure) return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
