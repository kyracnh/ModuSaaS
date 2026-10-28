import "server-only";
import Stripe from "stripe";
import { getEnv } from "@/config/env";
import { appConfig } from "@/config/app";
import { db } from "@/server/db";
import { AppError } from "@/server/http";
export interface BillingProvider {
  checkout(
    userId: string,
    email: string,
    interval: "monthly" | "yearly",
  ): Promise<string>;
  portal(userId: string): Promise<string>;
}
export function billingReady() {
  return (
    appConfig.features.billing &&
    !!process.env.STRIPE_SECRET_KEY &&
    !!process.env.STRIPE_PRICE_MONTHLY &&
    !!process.env.STRIPE_PRICE_YEARLY
  );
}
export function stripe() {
  const env = getEnv();
  if (!env.STRIPE_SECRET_KEY)
    throw new AppError(503, "Configure Stripe before using billing");
  return new Stripe(env.STRIPE_SECRET_KEY, { maxNetworkRetries: 2 });
}
export const billingProvider: BillingProvider = {
  async checkout(userId, email, interval) {
    const env = getEnv();
    const client = stripe();
    const price =
      interval === "monthly"
        ? env.STRIPE_PRICE_MONTHLY
        : env.STRIPE_PRICE_YEARLY;
    if (!price) throw new AppError(503, "Stripe price is not configured");
    let sub = await db.subscription.findUnique({ where: { userId } });
    if (sub && ["active", "trialing"].includes(sub.status))
      throw new AppError(
        409,
        "Manage your existing subscription in the billing portal",
      );
    if (!sub) {
      const customer = await client.customers.create(
        { email, metadata: { userId } },
        { idempotencyKey: `customer:${userId}` },
      );
      sub = await db.subscription.upsert({
        where: { userId },
        create: { userId, customerId: customer.id },
        update: {},
      });
    }
    const checkout = await client.checkout.sessions.create({
      mode: "subscription",
      customer: sub.customerId,
      line_items: [{ price, quantity: 1 }],
      success_url: `${env.BETTER_AUTH_URL}/dashboard/billing?checkout=returned`,
      cancel_url: `${env.BETTER_AUTH_URL}/dashboard/billing`,
      client_reference_id: userId,
    });
    if (!checkout.url) throw new AppError(502, "No checkout URL returned");
    return checkout.url;
  },
  async portal(userId) {
    const sub = await db.subscription.findUnique({ where: { userId } });
    if (!sub) throw new AppError(404, "No billing account found");
    return (
      await stripe().billingPortal.sessions.create({
        customer: sub.customerId,
        return_url: `${getEnv().BETTER_AUTH_URL}/dashboard/billing`,
      })
    ).url;
  },
};
export async function processWebhook(event: Stripe.Event, client: Stripe) {
  if (
    ![
      "checkout.session.completed",
      "customer.subscription.created",
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "invoice.paid",
      "invoice.payment_failed",
    ].includes(event.type)
  )
    return;
  const object = event.data.object as unknown as {
    customer?: string | { id: string };
  };
  const customerId =
    typeof object.customer === "string" ? object.customer : object.customer?.id;
  if (!customerId) return;
  await db.$transaction(
    async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${customerId}))`;
      if (await tx.webhookEvent.findUnique({ where: { id: event.id } })) return;
      const sub = await tx.subscription.findUnique({ where: { customerId } });
      if (!sub)
        throw new AppError(409, "Customer mapping not ready; retry event");
      // Query the provider under the customer lock; never apply an old event snapshot.
      const live = await client.subscriptions.list({
        customer: customerId,
        status: "all",
        limit: 100,
      });
      const knownPrices = [
        process.env.STRIPE_PRICE_MONTHLY,
        process.env.STRIPE_PRICE_YEARLY,
      ].filter(Boolean);
      const current = live.data
        .filter((s) =>
          s.items.data.some((i) => knownPrices.includes(i.price.id)),
        )
        .sort((a, b) => b.created - a.created)[0];
      const entitled =
        !!current && ["active", "trialing"].includes(current.status);
      const period = current?.items.data[0]?.current_period_end;
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          providerSubscriptionId: current?.id ?? null,
          status: current?.status ?? "inactive",
          plan: entitled ? "pro" : "free",
          cancelAtPeriodEnd: current?.cancel_at_period_end ?? false,
          currentPeriodEnd: period ? new Date(period * 1000) : null,
        },
      });
      await tx.webhookEvent.create({ data: { id: event.id } });
    },
    { timeout: 20000 },
  );
}
