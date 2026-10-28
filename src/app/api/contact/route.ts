import { apiUser, AppError, body, route } from "@/server/http";
import { contactSchema } from "@/modules/settings/schema";
import { rateLimit } from "@/server/limits";
import { sendEmail } from "@/modules/email/service";
import { z } from "zod";
export const POST = route(async (req) => {
  const s = await apiUser();
  await rateLimit(`contact:${s.user.id}`, 3, 3600000);
  const input = await body(req, contactSchema);
  const recipient = z.email().safeParse(process.env.CONTACT_EMAIL);
  if (!recipient.success)
    throw new AppError(503, "Contact delivery is not configured");
  await sendEmail(
    recipient.data,
    "Contact: " + input.subject,
    `From: ${s.user.email}\n\n${input.message}`,
  );
  return Response.json({ sent: true });
}, true);
