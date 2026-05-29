import { z } from "zod";

// Module 3.1: Healthy/Unhealthy Classification DTOs

export const HealthClassificationRequestDto = z.object({
  foodId: z.number().int().optional(),
  description: z.string().optional(),
  // Alternative: provide nutrition values directly
  protein: z.number().optional(),
  carbohydrate: z.number().optional(),
  fiber: z.number().optional(),
  totalLipid: z.number().optional(),
  sugarTotal: z.number().optional(),
  sodium: z.number().optional(),
  cholesterol: z.number().optional(),
  vitaminC: z.number().optional(),
  iron: z.number().optional(),
  calcium: z.number().optional(),
});

export const HealthClassificationResponseDto = z.object({
  classification: z.enum(["HEALTHY", "NEUTRAL", "UNHEALTHY"]),
  score: z.number().min(0).max(1),
  explanation: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type HealthClassificationRequest = z.infer<typeof HealthClassificationRequestDto>;
export type HealthClassificationResponse = z.infer<typeof HealthClassificationResponseDto>;
