import { apiUser, body, feature, route } from "@/server/http";
import { billingProvider, billingReady } from "@/modules/billing/service";
import { db } from "@/server/db";
import { rateLimit } from "@/server/limits";
import { z } from "zod";
export const GET = route(async () => {
  feature("billing");
  const s = await apiUser();
  return Response.json({
    configured: billingReady(),
    subscription: await db.subscription.findUnique({
      where: { userId: s.user.id },
      select: {
        status: true,
        plan: true,
        cancelAtPeriodEnd: true,
        currentPeriodEnd: true,
      },
    }),
  });
});
export const POST = route(async (req) => {
  feature("billing");
  const s = await apiUser();
  await rateLimit(`billing:${s.user.id}`, 5);
  const input = await body(
    req,
    z.object({
      action: z.enum(["checkout", "portal"]),
      interval: z.enum(["monthly", "yearly"]).default("monthly"),
    }),
  );
  return Response.json({
    url:
      input.action === "portal"
        ? await billingProvider.portal(s.user.id)
        : await billingProvider.checkout(
            s.user.id,
            s.user.email,
            input.interval,
          ),
  });
}, true);
