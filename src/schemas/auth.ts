import { z } from 'zod';

export const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
});

export const signUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  displayName: z.string().min(2, 'Nombre muy corto').optional(),
});

export const diagnosticSchema = z.object({
  businessType: z.string().min(1, 'Tipo de negocio requerido'),
  mainChallenge: z.string().min(1, 'Desafío principal requerido'),
  businessDescription: z.string().min(10, 'Descripción muy corta'),
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type DiagnosticInput = z.infer<typeof diagnosticSchema>;
