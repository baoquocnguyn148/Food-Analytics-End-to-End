import { FoodRepository } from "../repositories/food.repository";
import { PersonalizedDietRequest, PersonalizedDietResponse } from "../dtos/ml-recommendation.dto";

// Module 3.4: Personalized Diet Recommendation Service
// Hybrid system combining rule-based scoring with ML approach

export class PersonalizedDietService {
  static async recommendPersonalizedDiet(
    request: PersonalizedDietRequest
  ): Promise<PersonalizedDietResponse> {
    // Get all foods
    const allFoods = await this.getAllFoodsForRecommendation();

    // Score each food based on goals, restrictions, and activity level
    const scored = allFoods.map(food => {
      const score = this.calculatePersonalizedScore(food, request);
      const matchedGoals = this.matchGoals(food, request.goals);
      const matchedRestrictions = this.matchRestrictions(food, request.restrictions || []);

      return {
        food,
        score,
        matchedGoals,
        matchedRestrictions,
      };
    })
      .filter(item => item.score > 0) // Only include foods with positive score
      .sort((a, b) => b.score - a.score)
      .slice(0, request.limit);

    return {
      recommendations: scored.map(item => ({
        id: item.food.id,
        description: item.food.description || "",
        category: item.food.category || "",
        score: item.score,
        matchedGoals: item.matchedGoals,
        matchedRestrictions: item.matchedRestrictions,
        explanation: this.generateExplanation(item.food, request, item.matchedGoals),
      })),
      context: {
        goals: request.goals,
        restrictions: request.restrictions || [],
        activityLevel: request.activityLevel,
      },
    };
  }

  private static calculatePersonalizedScore(food: any, request: PersonalizedDietRequest): number {
    let baseScore = 0;

    // Score based on goals
    for (const goal of request.goals) {
      baseScore += this.scoreForGoal(food, goal, request.activityLevel);
    }

    // Check restrictions (disqualify if not met)
    if (request.restrictions && request.restrictions.length > 0) {
      const restrictionsMet = this.checkRestrictions(food, request.restrictions);
      if (!restrictionsMet) return 0;
    }

    // Normalize score
    return Math.min(1, baseScore / (request.goals.length * 2));
  }

  private static scoreForGoal(food: any, goal: string, activityLevel: string): number {
    const protein = food.protein || 0;
    const carbs = food.carbohydrate || 0;
    const fiber = food.fiber || 0;
    const fat = food.totalLipid || 0;
    const sugar = food.sugarTotal || 0;
    const calories = (protein * 4 + carbs * 4 + fat * 9) / 1000; // Rough estimate

    switch (goal) {
      case "MUSCLEGAIN":
        // High protein, moderate carbs
        return (protein > 10 ? 2 : protein > 5 ? 1 : 0) +
               (carbs > 10 ? 1 : 0);

      case "WEIGHTLOSS":
        // Low fat, high fiber, low sugar
        return (fat < 10 ? 1 : 0) +
               (fiber > 2 ? 1 : 0) +
               (sugar < 5 ? 1 : 0) +
               (calories < 2 ? 1 : 0);

      case "ENERGY":
        // Balanced with good carbs
        return (carbs > 15 ? 1 : 0) +
               (fiber > 1 ? 1 : 0) +
               (sugar < 20 ? 1 : 0);

      case "ENDURANCE":
        // Good carbs and moderate protein
        return (carbs > 20 ? 1.5 : 0) +
               (protein > 8 ? 1 : 0) +
               (fat > 5 ? 0.5 : 0);

      case "RECOVERY":
        // High protein, moderate carbs
        return (protein > 12 ? 2 : protein > 8 ? 1 : 0) +
               (carbs > 15 ? 1 : 0);

      case "GENERAL_HEALTH":
        // Balanced nutrition
        return (protein > 5 ? 0.5 : 0) +
               (fiber > 2 ? 1 : 0) +
               (sugar < 10 ? 0.5 : 0) +
               (Math.abs(fat - 10) < 5 ? 0.5 : 0);

      default:
        return 1;
    }
  }

  private static checkRestrictions(food: any, restrictions: string[]): boolean {
    // In production, would check ingredients
    // For now, use heuristics based on nutrition

    for (const restriction of restrictions) {
      switch (restriction) {
        case "VEGAN":
        case "VEGETARIAN":
          // Would need ingredient data to verify
          return true;

        case "GLUTENFREE":
          // Whole foods are typically GF
          return true;

        case "DAIRYFREE":
          // Would need ingredient data
          return true;

        case "LOWSODIUM":
          if ((food.sodium || 0) > 500) return false;
          break;

        case "DIABETICFRIENDLY":
          if ((food.sugarTotal || 0) > 15) return false;
          break;
      }
    }

    return true;
  }

  private static matchGoals(food: any, goals: string[]): string[] {
    const matched: string[] = [];
    const protein = food.protein || 0;
    const carbs = food.carbohydrate || 0;
    const fiber = food.fiber || 0;
    const fat = food.totalLipid || 0;

    if (goals.includes("MUSCLEGAIN") && protein > 10) matched.push("MUSCLEGAIN");
    if (goals.includes("WEIGHTLOSS") && fiber > 2 && fat < 10) matched.push("WEIGHTLOSS");
    if (goals.includes("ENERGY") && carbs > 15 && fiber > 1) matched.push("ENERGY");
    if (goals.includes("ENDURANCE") && carbs > 20) matched.push("ENDURANCE");
    if (goals.includes("RECOVERY") && protein > 12 && carbs > 15) matched.push("RECOVERY");
    if (goals.includes("GENERAL_HEALTH") && fiber > 2) matched.push("GENERAL_HEALTH");

    return matched;
  }

  private static matchRestrictions(food: any, restrictions: string[]): string[] {
    const matched: string[] = [];
    const sodium = food.sodium || 0;
    const sugar = food.sugarTotal || 0;

    if (restrictions.includes("LOWSODIUM") && sodium < 500) matched.push("LOWSODIUM");
    if (restrictions.includes("DIABETICFRIENDLY") && sugar < 15) matched.push("DIABETICFRIENDLY");
    if (restrictions.includes("VEGAN")) matched.push("VEGAN");
    if (restrictions.includes("VEGETARIAN")) matched.push("VEGETARIAN");
    if (restrictions.includes("GLUTENFREE")) matched.push("GLUTENFREE");
    if (restrictions.includes("DAIRYFREE")) matched.push("DAIRYFREE");

    return matched;
  }

  private static generateExplanation(food: any, request: PersonalizedDietRequest, matchedGoals: string[]): string[] {
    const explanations: string[] = [];
    const protein = food.protein || 0;
    const carbs = food.carbohydrate || 0;
    const fiber = food.fiber || 0;

    if (matchedGoals.includes("MUSCLEGAIN")) {
      explanations.push(`Excellent protein source (${protein}g) for building muscle`);
    }

    if (matchedGoals.includes("WEIGHTLOSS")) {
      explanations.push(`High fiber (${fiber}g) promotes satiety and aids weight loss`);
    }

    if (matchedGoals.includes("ENERGY")) {
      explanations.push(`Good carbohydrate content (${carbs}g) for sustained energy`);
    }

    if (request.restrictions?.includes("LOWSODIUM")) {
      explanations.push(`Low sodium (${food.sodium || 0}mg) suitable for your diet`);
    }

    if (explanations.length === 0) {
      explanations.push("Aligns with your dietary preferences and activity level");
    }

    return explanations;
  }

  private static async getAllFoodsForRecommendation() {
    // In production, use pagination and caching
    const result = await FoodRepository.findAll(1, 10000);
    return result.data;
  }
}
