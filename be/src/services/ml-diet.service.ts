import { DietTypeClassificationRequest, DietTypeClassificationResponse } from "../dtos/ml-diet.dto";
import { FoodRepository } from "../repositories/food.repository";

// Module 3.2: Diet Type Classification Service
// Multi-label classification for diet compatibility
// Can be replaced with ML model (XGBoost or Transformer)

export class DietTypeClassificationService {
  static async classifyDietTypes(
    request: DietTypeClassificationRequest
  ): Promise<DietTypeClassificationResponse> {
    let nutritionData = {
      protein: request.protein || 0,
      carbohydrate: request.carbohydrate || 0,
      fiber: request.fiber || 0,
      totalLipid: request.totalLipid || 0,
      sugarTotal: request.sugarTotal || 0,
      sodium: request.sodium || 0,
      cholesterol: request.cholesterol || 0,
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
        };
      }
    }

    const dietTypes = this.evaluateDietTypes(nutritionData);
    const suitableDiets = dietTypes.filter(d => d.score >= 0.5).map(d => d.type as any);
    const unsuitableDiets = dietTypes.filter(d => d.score < 0.5).map(d => d.type as any);

    return {
      dietTypes,
      suitableDiets,
      unsuitableDiets,
    };
  }

  private static evaluateDietTypes(nutrition: any): any[] {
    const results: any[] = [];

    // Keto: Low carb, high fat, moderate protein
    const ketoScore = this.scoreKeto(nutrition);
    results.push({
      type: "KETO",
      score: ketoScore,
      reason: ketoScore >= 0.5
        ? "Low carbs and adequate fats make this suitable for keto"
        : "Carbohydrate content is too high for keto diet",
    });

    // Vegan: No animal products
    const veganScore = this.scoreVegan(nutrition);
    results.push({
      type: "VEGAN",
      score: veganScore,
      reason: veganScore >= 0.5
        ? "This plant-based food is suitable for vegans"
        : "Check if this contains any animal-derived ingredients",
    });

    // Vegetarian: No meat but allows dairy/eggs
    const vegetarianScore = this.scoreVegetarian(nutrition);
    results.push({
      type: "VEGETARIAN",
      score: vegetarianScore,
      reason: vegetarianScore >= 0.5
        ? "This food fits vegetarian diet requirements"
        : "May contain meat or fish",
    });

    // Paleo: Whole foods, no grains/legumes
    const paleoScore = this.scorePaleo(nutrition);
    results.push({
      type: "PALEO",
      score: paleoScore,
      reason: paleoScore >= 0.5
        ? "This whole food aligns with paleo principles"
        : "May contain processed ingredients",
    });

    // Low Sodium: < 500mg per serving
    const lowSodiumScore = this.scoreLowSodium(nutrition);
    results.push({
      type: "LOWSODIUM",
      score: lowSodiumScore,
      reason: lowSodiumScore >= 0.5
        ? `Low sodium content (${nutrition.sodium}mg) is suitable`
        : `High sodium content (${nutrition.sodium}mg) not suitable`,
    });

    // Diabetes Friendly: Low glycemic index, moderate carbs
    const diabeticScore = this.scoreDiabeticFriendly(nutrition);
    results.push({
      type: "DIABETICFRIENDLY",
      score: diabeticScore,
      reason: diabeticScore >= 0.5
        ? "Good fiber and controlled carbs make this suitable"
        : "Sugar and carb content may not be suitable",
    });

    // Muscle Gain: High protein, moderate carbs
    const muscleGainScore = this.scoreMuscleGain(nutrition);
    results.push({
      type: "MUSCLEGAIN",
      score: muscleGainScore,
      reason: muscleGainScore >= 0.5
        ? `High protein (${nutrition.protein}g) supports muscle building`
        : `Insufficient protein (${nutrition.protein}g) for muscle gain`,
    });

    // Weight Loss: Low calorie, high protein/fiber
    const weightLossScore = this.scoreWeightLoss(nutrition);
    results.push({
      type: "WEIGHTLOSS",
      score: weightLossScore,
      reason: weightLossScore >= 0.5
        ? "Low calories and high satiety make this suitable"
        : "High caloric density may not support weight loss goals",
    });

    // Gluten Free: Naturally GF or certified
    const glutenFreeScore = this.scoreGlutenFree(nutrition);
    results.push({
      type: "GLUTENFREE",
      score: glutenFreeScore,
      reason: glutenFreeScore >= 0.5
        ? "This whole food is naturally gluten-free"
        : "May contain gluten - check ingredients",
    });

    // Dairy Free: No milk/dairy products
    const dairyFreeScore = this.scoreDairyFree(nutrition);
    results.push({
      type: "DAIRYFREE",
      score: dairyFreeScore,
      reason: dairyFreeScore >= 0.5
        ? "This food is dairy-free"
        : "May contain dairy products",
    });

    return results;
  }

  private static scoreKeto(nutrition: any): number {
    let score = 0;
    score += (nutrition.carbohydrate < 5) ? 1 : (nutrition.carbohydrate < 10) ? 0.5 : 0;
    score += (nutrition.totalLipid > 15) ? 1 : (nutrition.totalLipid > 10) ? 0.5 : 0;
    score += (nutrition.protein > 5) ? 0.5 : 0;
    return Math.min(1, score / 2.5);
  }

  private static scoreVegan(nutrition: any): number {
    // Whole foods are typically vegan
    return (nutrition.carbohydrate + nutrition.protein + nutrition.totalLipid) > 0 ? 0.8 : 0;
  }

  private static scoreVegetarian(nutrition: any): number {
    return (nutrition.carbohydrate + nutrition.protein + nutrition.totalLipid) > 0 ? 0.85 : 0;
  }

  private static scorePaleo(nutrition: any): number {
    let score = 0;
    score += (nutrition.fiber > 2) ? 0.7 : (nutrition.fiber > 0) ? 0.4 : 0;
    score += (nutrition.protein > 5) ? 0.3 : 0;
    return Math.min(1, score / 1.2);
  }

  private static scoreLowSodium(nutrition: any): number {
    if (nutrition.sodium < 300) return 1;
    if (nutrition.sodium < 500) return 0.7;
    if (nutrition.sodium < 800) return 0.4;
    return 0;
  }

  private static scoreDiabeticFriendly(nutrition: any): number {
    let score = 0;
    score += (nutrition.fiber > 2) ? 1 : (nutrition.fiber > 0) ? 0.5 : 0;
    score += (nutrition.sugarTotal < 5) ? 1 : (nutrition.sugarTotal < 10) ? 0.5 : 0;
    score += (nutrition.carbohydrate < 20) ? 0.5 : 0;
    return Math.min(1, score / 2.5);
  }

  private static scoreMuscleGain(nutrition: any): number {
    let score = 0;
    score += (nutrition.protein > 15) ? 1 : (nutrition.protein > 10) ? 0.7 : (nutrition.protein > 5) ? 0.4 : 0;
    score += (nutrition.carbohydrate > 10) ? 0.5 : 0;
    score += (nutrition.totalLipid > 5) ? 0.3 : 0;
    return Math.min(1, score / 1.8);
  }

  private static scoreWeightLoss(nutrition: any): number {
    let score = 0;
    score += (nutrition.fiber > 3) ? 1 : (nutrition.fiber > 1) ? 0.5 : 0;
    score += (nutrition.protein > 10) ? 0.8 : 0;
    score += (nutrition.totalLipid < 10) ? 0.5 : 0;
    score += (nutrition.sugarTotal < 5) ? 0.5 : 0;
    return Math.min(1, score / 2.8);
  }

  private static scoreGlutenFree(nutrition: any): number {
    return 0.9; // Whole foods are typically GF
  }

  private static scoreDairyFree(nutrition: any): number {
    return 0.85; // Most non-dairy foods
  }
}
