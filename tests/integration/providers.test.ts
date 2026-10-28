import "dotenv/config";
import { it, expect, beforeAll, afterAll } from "vitest";
import Stripe from "stripe";
import { db } from "@/server/db";
import { processWebhook } from "@/modules/billing/service";
import { reserveUsage, finishUsage } from "@/modules/ai/service";
const userId = crypto.randomUUID();
const customerId = "cus_fixture_" + crypto.randomUUID();
beforeAll(async () => {
  await db.user.create({
    data: {
      id: userId,
      name: "Provider Fixture",
      email: userId + "@example.com",
    },
  });
  await db.subscription.create({ data: { userId, customerId } });
  process.env.STRIPE_PRICE_MONTHLY = "price_fixture_monthly";
});
afterAll(async () => {
  await db.user.deleteMany({ where: { id: userId } });
  await db.webhookEvent.deleteMany({
    where: { id: { startsWith: "evt_fixture_" + userId } },
  });
  await db.$disconnect();
});
it("verifies real Stripe signatures and rejects changed payloads", () => {
  const stripe = new Stripe("sk_test_fixture");
  const payload = JSON.stringify({ id: "evt_fixture", object: "event" });
  const secret = "whsec_controlled_fixture";
  const header = stripe.webhooks.generateTestHeaderString({ payload, secret });
  expect(stripe.webhooks.constructEvent(payload, header, secret).id).toBe(
    "evt_fixture",
  );
  expect(() =>
    stripe.webhooks.constructEvent(payload + " ", header, secret),
  ).toThrow();
});
it("processes webhook replays idempotently and rereads canonical provider state", async () => {
  let calls = 0;
  let status = "active";
  const client = {
    subscriptions: {
      list: async () => {
        calls++;
        return {
          data: [
            {
              id: "sub_" + userId,
              created: 123,
              status,
              cancel_at_period_end: false,
              items: {
                data: [
                  {
                    price: { id: "price_fixture_monthly" },
                    current_period_end: 2000000000,
                  },
                ],
              },
            },
          ],
        };
      },
    },
  } as unknown as Stripe;
  const event = {
    id: "evt_fixture_" + userId + "_new",
    type: "customer.subscription.updated",
    data: { object: { customer: customerId, status: "past_due" } },
  } as unknown as Stripe.Event;
  await processWebhook(event, client);
  expect((await db.subscription.findUnique({ where: { userId } }))?.plan).toBe(
    "pro",
  );
  await processWebhook(event, client);
  expect(calls).toBe(1);
  status = "canceled";
  await processWebhook(
    { ...event, id: "evt_fixture_" + userId + "_old" },
    client,
  );
  expect((await db.subscription.findUnique({ where: { userId } }))?.plan).toBe(
    "free",
  );
  expect(
    (await db.subscription.findUnique({ where: { userId } }))?.status,
  ).toBe("canceled");
});
it("reserves AI quotas atomically and records only observed usage", async () => {
  const results = await Promise.allSettled(
    Array.from({ length: 12 }, () => reserveUsage(userId)),
  );
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(10);
  expect(results.filter((r) => r.status === "rejected")).toHaveLength(2);
  const first = results.find((r) => r.status === "fulfilled");
  if (first?.status !== "fulfilled") throw new Error("No reservation");
  await finishUsage(first.value.id, 123, 45);
  expect(
    (await db.aiUsage.findUnique({ where: { id: first.value.id } }))
      ?.outputTokens,
  ).toBe(45);
});
