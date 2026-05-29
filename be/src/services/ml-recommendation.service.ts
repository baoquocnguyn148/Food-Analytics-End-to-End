import { FoodRepository } from "../repositories/food.repository";
import { RecommendationRequest, RecommendationResponse } from "../dtos/ml-recommendation.dto";

// Module 3.3: Content-based Recommendation Service
// Uses cosine similarity for finding similar foods
// Can be extended with embeddings for better recommendations

export class RecommendationService {
  static async getRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResponse> {
    const originalFood = await FoodRepository.findById(request.foodId);
    if (!originalFood) {
      throw new Error("Food not found");
    }

    // Get all foods (with pagination in production)
    const allFoods = await this.getAllFoodsForComparison();

    // Calculate similarity scores
    const similarities = allFoods
      .filter(f => f.id !== request.foodId)
      .map(food => ({
        food,
        similarity: this.calculateCosineSimilarity(originalFood, food),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, request.limit);

    return {
      originalFood: {
        id: originalFood.id,
        description: originalFood.description || "",
        category: originalFood.category || "",
      },
      recommendations: similarities.map(({ food, similarity }) => ({
        id: food.id,
        description: food.description || "",
        category: food.category || "",
        similarity,
        reason: this.generateSimilarityReason(originalFood, food, similarity),
      })),
    };
  }

  private static calculateCosineSimilarity(food1: any, food2: any): number {
    // Extract nutrition vector from both foods
    const vector1 = this.getNutritionVector(food1);
    const vector2 = this.getNutritionVector(food2);

    // Calculate dot product
    let dotProduct = 0;
    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
    }

    // Calculate magnitudes
    const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
    const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  private static getNutritionVector(food: any): number[] {
    return [
      food.protein || 0,
      food.carbohydrate || 0,
      food.fiber || 0,
      food.totalLipid || 0,
      food.sugarTotal || 0,
      food.calcium || 0,
      food.iron || 0,
      food.sodium || 0,
      food.vitaminC || 0,
      food.vitaminA || 0,
      food.vitaminB12 || 0,
      food.cholesterol || 0,
      food.water || 0,
      food.zinc || 0,
      food.phosphorus || 0,
    ];
  }

  private static generateSimilarityReason(food1: any, food2: any, similarity: number): string {
    const protein1 = food1.protein || 0;
    const protein2 = food2.protein || 0;
    const carbs1 = food1.carbohydrate || 0;
    const carbs2 = food2.carbohydrate || 0;
    const fat1 = food1.totalLipid || 0;
    const fat2 = food2.totalLipid || 0;

    if (similarity > 0.85) {
      return "Very similar nutritional profile - excellent substitute";
    } else if (similarity > 0.7) {
      return "Similar nutritional composition - good substitute";
    } else if (Math.abs(protein1 - protein2) < 2) {
      return "Similar protein content";
    } else if (Math.abs(carbs1 - carbs2) < 3) {
      return "Similar carbohydrate profile";
    } else if (Math.abs(fat1 - fat2) < 2) {
      return "Similar fat content";
    }
    return "Comparable nutrition values";
  }

  private static async getAllFoodsForComparison() {
    // In production, this should use pagination and caching
    const result = await FoodRepository.findAll(1, 10000);
    return result.data;
  }
}
