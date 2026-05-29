import { HealthClassificationRequest, HealthClassificationResponse } from "../dtos/ml-health.dto";
import { FoodRepository } from "../repositories/food.repository";

// Module 3.1: Health Classification Service
// Uses rule-based scoring based on nutrition values
// Can be replaced with ML model (XGBoost/Random Forest)

export class HealthClassificationService {
  static async classifyFood(
    request: HealthClassificationRequest
  ): Promise<HealthClassificationResponse> {
    let nutritionData = {
      protein: request.protein || 0,
      carbohydrate: request.carbohydrate || 0,
      fiber: request.fiber || 0,
      totalLipid: request.totalLipid || 0,
      sugarTotal: request.sugarTotal || 0,
      sodium: request.sodium || 0,
      cholesterol: request.cholesterol || 0,
      vitaminC: request.vitaminC || 0,
      iron: request.iron || 0,
      calcium: request.calcium || 0,
    };

    // If foodId provided, fetch from database
    if (request.foodId) {
      const food = await FoodRepository.findById(request.foodId);
      if (food) {
        nutritionData = {
          protein: food.protein || 0,
          carbohydrate: food.carbohydrate || 0,
          fiber: food.fiber || 0,
          totalLipid: food.totalLipid || 0,
          sugarTotal: food.sugarTotal || 0,
          sodium: food.sodium || 0,
          cholesterol: food.cholesterol || 0,
          vitaminC: food.vitaminC || 0,
          iron: food.iron || 0,
          calcium: food.calcium || 0,
        };
      }
    }

    // Rule-based health scoring
    const healthScore = this.calculateHealthScore(nutritionData);
    const classification = this.classifyScore(healthScore);
    const explanation = this.generateExplanation(nutritionData);
    const recommendations = this.generateRecommendations(nutritionData, classification);

    return {
      classification,
      score: healthScore,
      explanation,
      recommendations,
    };
  }

  private static calculateHealthScore(nutrition: any): number {
    let score = 50; // Base score

    // Protein: good (increases score)
    if (nutrition.protein >= 10) score += 15;
    else if (nutrition.protein >= 5) score += 10;
    else if (nutrition.protein > 0) score += 5;

    // Fiber: good (increases score)
    if (nutrition.fiber >= 3) score += 15;
    else if (nutrition.fiber >= 1) score += 10;
    else if (nutrition.fiber > 0) score += 5;

    // Sugar: bad (decreases score)
    if (nutrition.sugarTotal > 20) score -= 20;
    else if (nutrition.sugarTotal > 10) score -= 15;
    else if (nutrition.sugarTotal > 5) score -= 10;

    // Sodium: bad (decreases score)
    if (nutrition.sodium > 500) score -= 20;
    else if (nutrition.sodium > 200) score -= 10;
    else if (nutrition.sodium > 0) score -= 5;

    // Total Fat: neutral to bad
    if (nutrition.totalLipid > 30) score -= 15;
    else if (nutrition.totalLipid > 15) score -= 10;
    else if (nutrition.totalLipid > 0) score -= 5;

    // Cholesterol: bad (decreases score)
    if (nutrition.cholesterol > 200) score -= 20;
    else if (nutrition.cholesterol > 100) score -= 10;
    else if (nutrition.cholesterol > 0) score -= 5;

    // Vitamin C: good (increases score)
    if (nutrition.vitaminC >= 20) score += 15;
    else if (nutrition.vitaminC >= 10) score += 10;

    // Iron: good (increases score)
    if (nutrition.iron >= 2) score += 10;
    else if (nutrition.iron >= 1) score += 5;

    // Calcium: good (increases score)
    if (nutrition.calcium >= 100) score += 10;
    else if (nutrition.calcium >= 50) score += 5;

    return Math.max(0, Math.min(100, score)) / 100;
  }

  private static classifyScore(score: number): "HEALTHY" | "NEUTRAL" | "UNHEALTHY" {
    if (score >= 0.65) return "HEALTHY";
    if (score >= 0.4) return "NEUTRAL";
    return "UNHEALTHY";
  }

  private static generateExplanation(nutrition: any): string[] {
    const explanations: string[] = [];

    if (nutrition.protein >= 10) {
      explanations.push(`High protein content (${nutrition.protein}g) - good for muscle building`);
    }

    if (nutrition.fiber >= 3) {
      explanations.push(`High fiber content (${nutrition.fiber}g) - aids digestion`);
    }

    if (nutrition.sugarTotal > 20) {
      explanations.push(`High sugar content (${nutrition.sugarTotal}g) - may cause blood sugar spikes`);
    }

    if (nutrition.sodium > 500) {
      explanations.push(`High sodium content (${nutrition.sodium}mg) - may increase blood pressure`);
    }

    if (nutrition.totalLipid > 30) {
      explanations.push(`High fat content (${nutrition.totalLipid}g) - high caloric density`);
    }

    if (nutrition.vitaminC >= 20) {
      explanations.push(`Rich in Vitamin C (${nutrition.vitaminC}mg) - supports immune system`);
    }

    if (nutrition.calcium >= 100) {
      explanations.push(`Good source of calcium (${nutrition.calcium}mg) - supports bone health`);
    }

    return explanations.length > 0 ? explanations : ["Balanced nutrition profile"];
  }

  private static generateRecommendations(
    nutrition: any,
    classification: string
  ): string[] {
    const recommendations: string[] = [];

    if (nutrition.sugarTotal > 20) {
      recommendations.push("Consider reducing sugar intake or pairing with high-fiber foods");
    }

    if (nutrition.sodium > 500) {
      recommendations.push("This food is high in sodium - consume in moderation");
    }

    if (nutrition.totalLipid > 30 && classification === "UNHEALTHY") {
      recommendations.push("Balance with lower-fat options or increase physical activity");
    }

    if (nutrition.protein < 5 && classification === "UNHEALTHY") {
      recommendations.push("Combine with protein-rich foods for a complete meal");
    }

    if (nutrition.fiber < 1) {
      recommendations.push("Add fiber-rich foods to improve digestive health");
    }

    return recommendations.length > 0 ? recommendations : ["Continue enjoying this food as part of a balanced diet"];
  }
}
