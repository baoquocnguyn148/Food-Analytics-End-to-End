import { AnalyticsRepository } from "../repositories/analytics.repository";
import {
  AnalyticsPagination,
  NutrientDistributionQuery,
  TopNutrientResponse,
  NutrientDistributionItem,
} from "../dtos/analytics.dto";

export class AnalyticsService {
  // Top Protein Foods
  static async getTopProtein(pagination: AnalyticsPagination) {
    try {
      const result = await AnalyticsRepository.findTopProtein(pagination);
      return this.formatTopNutrientResponse(result, "g", "Protein");
    } catch (error) {
      throw new Error(`Failed to fetch top protein foods: ${error}`);
    }
  }

  // Top Fiber Foods
  static async getTopFiber(pagination: AnalyticsPagination) {
    try {
      const result = await AnalyticsRepository.findTopFiber(pagination);
      return this.formatTopNutrientResponse(result, "g", "Fiber");
    } catch (error) {
      throw new Error(`Failed to fetch top fiber foods: ${error}`);
    }
  }

  // Top Vitamin C Foods
  static async getTopVitaminC(pagination: AnalyticsPagination) {
    try {
      const result = await AnalyticsRepository.findTopVitaminC(pagination);
      return this.formatTopNutrientResponse(result, "mg", "Vitamin C");
    } catch (error) {
      throw new Error(`Failed to fetch top vitamin C foods: ${error}`);
    }
  }

  // Top Vitamin A Foods
  static async getTopVitaminA(pagination: AnalyticsPagination) {
    try {
      const result = await AnalyticsRepository.findTopVitaminA(pagination);
      return this.formatTopNutrientResponse(result, "µg", "Vitamin A");
    } catch (error) {
      throw new Error(`Failed to fetch top vitamin A foods: ${error}`);
    }
  }

  // Top Calcium Foods
  static async getTopCalcium(pagination: AnalyticsPagination) {
    try {
      const result = await AnalyticsRepository.findTopCalcium(pagination);
      return this.formatTopNutrientResponse(result, "mg", "Calcium");
    } catch (error) {
      throw new Error(`Failed to fetch top calcium foods: ${error}`);
    }
  }

  // Category Distribution
  static async getCategoryDistribution() {
    try {
      const result = await AnalyticsRepository.findCategoryDistribution();
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch category distribution: ${error}`);
    }
  }

  // Nutrient Distribution by Category
  static async getNutrientDistribution(query: NutrientDistributionQuery) {
    try {
      const result = await AnalyticsRepository.findNutrientDistribution(query);
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch nutrient distribution: ${error}`);
    }
  }

  // Top Healthy Foods
  static async getTopHealthyFoods(limit: number, offset: number) {
    try {
      const result = await AnalyticsRepository.findTopHealthyFoods(limit, offset);
      return this.formatHealthyFoodsResponse(result);
    } catch (error) {
      throw new Error(`Failed to fetch top healthy foods: ${error}`);
    }
  }

  // Plant vs Animal
  static async getPlantVsAnimal() {
    try {
      const result = await AnalyticsRepository.findPlantVsAnimal();
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch plant vs animal data: ${error}`);
    }
  }

  // Processing Level Distribution
  static async getProcessingLevelDistribution() {
    try {
      const result = await AnalyticsRepository.findProcessingLevelDistribution();
      return result;
    } catch (error) {
      throw new Error(`Failed to fetch processing level distribution: ${error}`);
    }
  }

  // Helper: Format top nutrient response
  private static formatTopNutrientResponse(
    result: {
      data: Array<{ id: number; description?: string | null; category?: string | null; [key: string]: any }>;
      limit: number;
      offset: number;
      total: number;
    },
    unit: string,
    nutrientName: string
  ) {
    const nutrientFields: Record<string, string> = {
      protein: "protein",
      fiber: "fiber",
      vitaminC: "vitaminC",
      vitaminARae: "vitaminARae",
      calcium: "calcium",
    };

    const fieldName = Object.keys(nutrientFields).find((key) =>
      result.data[0]
        ? result.data[0][nutrientFields[key]] !== undefined
        : false
    ) || "protein";

    const data = result.data.map((food: { id: number; description?: string | null; category?: string | null; [key: string]: any }) => ({
      id: food.id,
      description: food.description,
      category: food.category || null,
      value: food[fieldName] || 0,
      unit,
    }));

    return {
      success: true,
      nutrient: nutrientName,
      data,
      pagination: {
        limit: result.limit,
        offset: result.offset,
        total: result.total,
      },
    };
  }

  // Helper: Format healthy foods response
  private static formatHealthyFoodsResponse(result: {
    data: Array<{
      id: number;
      description?: string | null;
      category?: string | null;
      healthScore: number;
      protein?: number | null;
      fiber?: number | null;
      sugarTotal?: number | null;
    }>;
    limit: number;
    offset: number;
    total: number;
  }) {
    const data = result.data.map((food: {
      id: number;
      description?: string | null;
      category?: string | null;
      healthScore: number;
      protein?: number | null;
      fiber?: number | null;
      sugarTotal?: number | null;
    }) => ({
      id: food.id,
      description: food.description,
      category: food.category || null,
      healthScore: food.healthScore,
      protein: food.protein,
      fiber: food.fiber,
      sugarTotal: food.sugarTotal,
    }));

    return {
      success: true,
      data,
      pagination: {
        limit: result.limit,
        offset: result.offset,
        total: result.total,
      },
    };
  }
}
