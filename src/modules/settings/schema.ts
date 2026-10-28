import { z } from "zod";
export const preferencesSchema = z.object({
  emailUpdates: z.boolean(),
  productAnnouncements: z.boolean(),
});
export const contactSchema = z.object({
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(4000),
});
