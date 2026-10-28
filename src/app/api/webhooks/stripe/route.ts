import { AppError, feature, route, readBody } from "@/server/http";
import { getEnv } from "@/config/env";
import { stripe, processWebhook } from "@/modules/billing/service";
export const POST = route(async (req) => {
  feature("billing");
  const secret = getEnv().STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new AppError(503, "Webhook not configured");
  const signature = req.headers.get("stripe-signature");
  if (!signature) throw new AppError(400, "Missing signature");
  const payload = (await readBody(req, 1048576)).toString("utf8");
  const client = stripe();
  let event;
  try {
    event = client.webhooks.constructEvent(payload, signature, secret);
  } catch {
    throw new AppError(400, "Invalid signature");
  }
  await processWebhook(event, client);
  return Response.json({ received: true });
});
