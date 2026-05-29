import { z } from "zod";

// Module 3.2: Diet Type Classification (Multi-label) DTOs

export const DietTypeClassificationRequestDto = z.object({
  foodId: z.number().int().optional(),
  description: z.string().optional(),
  // Nutrition values for direct analysis
  protein: z.number().optional(),
  carbohydrate: z.number().optional(),
  fiber: z.number().optional(),
  totalLipid: z.number().optional(),
  sugarTotal: z.number().optional(),
  sodium: z.number().optional(),
  cholesterol: z.number().optional(),
});

export const DietType = z.enum([
  "KETO",
  "VEGAN",
  "VEGETARIAN",
  "PALEO",
  "LOWSODIUM",
  "DIABETICFRIENDLY",
  "MUSCLEGAIN",
  "WEIGHTLOSS",
  "GLUTENFREE",
  "DAIRYFREE"
]);

export const DietTypeClassificationResponseDto = z.object({
  dietTypes: z.array(z.object({
    type: DietType,
    score: z.number().min(0).max(1),
    reason: z.string(),
  })),
  suitableDiets: z.array(DietType),
  unsuitableDiets: z.array(DietType),
});

export type DietTypeClassificationRequest = z.infer<typeof DietTypeClassificationRequestDto>;
export type DietTypeClassificationResponse = z.infer<typeof DietTypeClassificationResponseDto>;
