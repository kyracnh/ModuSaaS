import { z } from "zod";
export const projectSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(2000).default(""),
  status: z.enum(["active", "paused", "completed"]).default("active"),
});
export type ProjectInput = z.infer<typeof projectSchema>;
