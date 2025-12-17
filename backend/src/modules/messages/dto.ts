import { z } from 'zod';

export const replyToTicketSchema = z.object({
  body_text: z.string().min(1, 'A mensagem não pode estar vazia'),
  body_html: z.string().optional(),
});

export type ReplyToTicketDTO = z.infer<typeof replyToTicketSchema>;
