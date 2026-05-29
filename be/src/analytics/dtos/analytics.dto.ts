import { z } from "zod";

// Pagination & Query Parameters
export const AnalyticsPaginationDto = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10),
  offset: z.coerce.number().int().min(0).default(0),
  page: z.coerce.number().int().min(1).optional(),
  sortBy: z.enum(["asc", "desc"]).default("desc"),
});

export const CategoryFilterDto = z.object({
  category: z.string().optional(),
});

// Top Nutrient Query DTO
export const TopNutrientQueryDto = AnalyticsPaginationDto.extend({
  category: z.string().optional(),
});

// Nutrient Distribution Query DTO
export const NutrientDistributionQueryDto = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["foodCount", "avgProtein", "avgFiber", "avgVitaminC"]).default("foodCount"),
});

// Healthy Foods Query DTO
export const HealthyFoodsQueryDto = AnalyticsPaginationDto.extend({
  minScore: z.coerce.number().min(0).max(1).optional(),
});

// Response DTOs

// Top Nutrient Response
export const TopNutrientResponseDto = z.object({
  id: z.number(),
  description: z.string(),
  category: z.string().optional(),
  value: z.number(),
  unit: z.string(),
});

export const TopNutrientListResponseDto = z.object({
  success: z.boolean(),
  data: z.array(TopNutrientResponseDto),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
    page: z.number().optional(),
  }),
});

// Category Distribution Response
export const CategoryDistributionItemDto = z.object({
  category: z.string().nullable(),
  foodCount: z.number(),
  percentage: z.number(),
});

export const CategoryDistributionResponseDto = z.object({
  success: z.boolean(),
  data: z.array(CategoryDistributionItemDto),
  total: z.number(),
});

// Nutrient Distribution Response
export const NutrientDistributionItemDto = z.object({
  category: z.string().nullable(),
  foodCount: z.number(),
  avgProtein: z.number(),
  avgFiber: z.number(),
  avgVitaminC: z.number(),
  avgVitaminA: z.number(),
  avgCalcium: z.number(),
});

export const NutrientDistributionResponseDto = z.object({
  success: z.boolean(),
  data: z.array(NutrientDistributionItemDto),
});

// Top Healthy Foods Response
export const HealthyFoodItemDto = z.object({
  id: z.number(),
  description: z.string(),
  category: z.string().optional(),
  healthScore: z.number().min(0).max(1),
  protein: z.number().nullable(),
  fiber: z.number().nullable(),
  sugarTotal: z.number().nullable(),
});

export const TopHealthyFoodsResponseDto = z.object({
  success: z.boolean(),
  data: z.array(HealthyFoodItemDto),
  pagination: z.object({
    limit: z.number(),
    offset: z.number(),
    total: z.number(),
  }),
});

// Plant vs Animal Response
export const PlantVsAnimalResponseDto = z.object({
  success: z.boolean(),
  data: z.object({
    plantBased: z.object({
      count: z.number(),
      percentage: z.number(),
      categories: z.array(z.string()),
    }),
    animalBased: z.object({
      count: z.number(),
      percentage: z.number(),
      categories: z.array(z.string()),
    }),
    mixed: z.object({
      count: z.number(),
      percentage: z.number(),
    }),
    total: z.number(),
  }),
});

// Processing Level Distribution Response
export const ProcessingLevelDistributionDto = z.object({
  success: z.boolean(),
  data: z.object({
    whole: z.object({
      count: z.number(),
      percentage: z.number(),
      examples: z.array(z.string()).max(5),
    }),
    minimally: z.object({
      count: z.number(),
      percentage: z.number(),
      examples: z.array(z.string()).max(5),
    }),
    processed: z.object({
      count: z.number(),
      percentage: z.number(),
      examples: z.array(z.string()).max(5),
    }),
    ultraProcessed: z.object({
      count: z.number(),
      percentage: z.number(),
      examples: z.array(z.string()).max(5),
    }),
    total: z.number(),
  }),
});

export type AnalyticsPagination = z.infer<typeof AnalyticsPaginationDto>;
export type TopNutrientQuery = z.infer<typeof TopNutrientQueryDto>;
export type NutrientDistributionQuery = z.infer<typeof NutrientDistributionQueryDto>;
export type HealthyFoodsQuery = z.infer<typeof HealthyFoodsQueryDto>;
export type TopNutrientResponse = z.infer<typeof TopNutrientResponseDto>;
export type CategoryDistributionItem = z.infer<typeof CategoryDistributionItemDto>;
export type NutrientDistributionItem = z.infer<typeof NutrientDistributionItemDto>;
export type HealthyFoodItem = z.infer<typeof HealthyFoodItemDto>;
