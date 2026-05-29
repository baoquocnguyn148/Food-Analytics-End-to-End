import { z } from "zod";

// =====================================================================
// Auth DTOs (Sprint 5)
// =====================================================================

export const RegisterDto = z.object({
  email: z.string().email("A valid email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters"),
  role: z.enum(["USER", "ADMIN"]).optional().default("USER"),
});

export const LoginDto = z.object({
  email: z.string().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const RefreshDto = z.object({
  refreshToken: z.string().min(10, "refreshToken is required"),
});

export type RegisterInput = z.infer<typeof RegisterDto>;
export type LoginInput = z.infer<typeof LoginDto>;
export type RefreshInput = z.infer<typeof RefreshDto>;
