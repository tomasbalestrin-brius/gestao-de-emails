import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  role: z.enum(['ADMIN', 'AGENT']).optional(),
});

export type LoginDTO = z.infer<typeof loginSchema>;
export type RegisterDTO = z.infer<typeof registerSchema>;
