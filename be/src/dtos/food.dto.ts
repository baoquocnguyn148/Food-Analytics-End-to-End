import { z } from "zod";

// FIXED: Added proper DTO validation for type safety
// Replaces the previous `any` type usage in services

export const CreateFoodDto = z.object({
  category: z.string().optional(),
  description: z.string(),
  nutrientDataBankNumber: z.number(),
  alphaCarotene: z.number().optional(),
  betaCarotene: z.number().optional(),
  betaCryptoxanthin: z.number().optional(),
  luteinZeaxanthin: z.number().optional(),
  lycopene: z.number().optional(),
  retinol: z.number().optional(),
  carbohydrate: z.number().optional(),
  protein: z.number().optional(),
  totalLipid: z.number().optional(),
  sugarTotal: z.number().optional(),
  fiber: z.number().optional(),
  cholesterol: z.number().optional(),
  water: z.number().optional(),
  choline: z.number().optional(),
  monoFat: z.number().optional(),
  polyFat: z.number().optional(),
  saturatedFat: z.number().optional(),
  calcium: z.number().optional(),
  copper: z.number().optional(),
  iron: z.number().optional(),
  magnesium: z.number().optional(),
  phosphorus: z.number().optional(),
  potassium: z.number().optional(),
  sodium: z.number().optional(),
  zinc: z.number().optional(),
  vitaminARae: z.number().optional(),
  vitaminB12: z.number().optional(),
  vitaminB6: z.number().optional(),
  vitaminC: z.number().optional(),
  vitaminE: z.number().optional(),
  vitaminK: z.number().optional(),
  niacin: z.number().optional(),
  riboflavin: z.number().optional(),
  selenium: z.number().optional(),
  thiamin: z.number().optional(),
});

export const GetFoodPaginationDto = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateFoodType = z.infer<typeof CreateFoodDto>;
export type GetFoodPaginationType = z.infer<typeof GetFoodPaginationDto>;
