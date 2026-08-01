import { z } from "zod";

export const contactMessageSchema = z.object({
  subject: z.string().trim().min(1, "L'objet est requis").max(200),
  message: z.string().trim().min(1, "Le message est requis").max(5000),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
