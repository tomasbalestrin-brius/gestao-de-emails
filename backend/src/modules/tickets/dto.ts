import { z } from 'zod';

export const ticketQuerySchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'REOPENED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'updated_at', 'last_message_at']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'REOPENED']),
});

export const updateTicketPrioritySchema = z.object({
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

export const updateTicketTagsSchema = z.object({
  tags: z.array(z.string()),
});

export const replyToTicketSchema = z.object({
  body_text: z.string().min(1, 'A mensagem não pode estar vazia'),
  body_html: z.string().optional(),
});

export type TicketQueryDTO = z.infer<typeof ticketQuerySchema>;
export type UpdateTicketStatusDTO = z.infer<typeof updateTicketStatusSchema>;
export type UpdateTicketPriorityDTO = z.infer<typeof updateTicketPrioritySchema>;
export type UpdateTicketTagsDTO = z.infer<typeof updateTicketTagsSchema>;
export type ReplyToTicketDTO = z.infer<typeof replyToTicketSchema>;
