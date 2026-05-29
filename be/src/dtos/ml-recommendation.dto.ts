import { z } from "zod";

// Module 3.3: Content-based Recommendation DTOs

export const RecommendationRequestDto = z.object({
  foodId: z.number().int(),
  limit: z.number().int().min(1).max(20).default(5),
});

export const RecommendationResponseDto = z.object({
  originalFood: z.object({
    id: z.number(),
    description: z.string(),
    category: z.string().optional(),
  }),
  recommendations: z.array(z.object({
    id: z.number(),
    description: z.string(),
    category: z.string().optional(),
    similarity: z.number().min(0).max(1),
    reason: z.string(),
  })),
});

// Module 3.4: Personalized Diet Recommendation DTOs

export const PersonalizedDietRequestDto = z.object({
  goals: z.array(z.enum([
    "MUSCLEGAIN",
    "WEIGHTLOSS",
    "ENERGY",
    "ENDURANCE",
    "RECOVERY",
    "GENERAL_HEALTH"
  ])),
  restrictions: z.array(z.enum([
    "VEGAN",
    "VEGETARIAN",
    "GLUTENFREE",
    "DAIRYFREE",
    "LOWSODIUM",
    "DIABETICFRIENDLY"
  ])).optional(),
  activityLevel: z.enum(["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"]).default("MODERATE"),
  limit: z.number().int().min(1).max(50).default(10),
});

export const PersonalizedDietResponseDto = z.object({
  recommendations: z.array(z.object({
    id: z.number(),
    description: z.string(),
    category: z.string().optional(),
    score: z.number().min(0).max(1),
    matchedGoals: z.array(z.string()),
    matchedRestrictions: z.array(z.string()),
    explanation: z.array(z.string()),
  })),
  context: z.object({
    goals: z.array(z.string()),
    restrictions: z.array(z.string()),
    activityLevel: z.string(),
  }),
});

export type RecommendationRequest = z.infer<typeof RecommendationRequestDto>;
export type RecommendationResponse = z.infer<typeof RecommendationResponseDto>;
export type PersonalizedDietRequest = z.infer<typeof PersonalizedDietRequestDto>;
export type PersonalizedDietResponse = z.infer<typeof PersonalizedDietResponseDto>;
