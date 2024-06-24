import { z } from "zod";
import { MessagesSchema } from "./messages.schema";

export const ProcessAudioSchema = z.object({
  formData: z.instanceof(FormData),
  text: z.string().optional(),
  date: z.coerce.date().optional(),
  messages: MessagesSchema.optional(),
});

export type ProcessAudioParams = z.infer<typeof ProcessAudioSchema>;
