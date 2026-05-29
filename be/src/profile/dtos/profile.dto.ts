import { z } from "zod";

// =====================================================================
// Profile DTOs (Sprint 6)
// =====================================================================

export const UpdateProfileDto = z
  .object({
    age: z.coerce.number().int().min(1).max(120).optional(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    weight: z.coerce.number().positive().max(500).optional(), // kg
    height: z.coerce.number().positive().max(300).optional(), // cm
    activityLevel: z
      .enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"])
      .optional(),
    goal: z.string().max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type UpdateProfileInput = z.infer<typeof UpdateProfileDto>;
