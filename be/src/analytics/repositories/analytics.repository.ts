import prisma from "../../config/prisma";
import { AnalyticsPagination, NutrientDistributionQuery } from "../dtos/analytics.dto";

export class AnalyticsRepository {
  // Top Nutrients by specific field
  static async findTopByNutrient(
    nutrientField: string,
    pagination: AnalyticsPagination,
    category?: string
  ) {
    const offset = pagination.offset;
    const limit = pagination.limit;
    const orderDirection = pagination.sortBy === "asc" ? "asc" : "desc";

    const where = category ? { category } : {};

    // Note: the dynamic computed key `[nutrientField]` makes Prisma widen the
    // row type to `{}`, so we cast back to the concrete shape the service uses.
    const foods = (await prisma.food.findMany({
      where: {
        ...where,
        [nutrientField]: {
          not: null,
        },
      },
      select: {
        id: true,
        description: true,
        category: true,
        [nutrientField]: true,
      },
      orderBy: {
        [nutrientField]: orderDirection,
      },
      skip: offset,
      take: limit,
    })) as unknown as Array<{
      id: number;
      description: string | null;
      category: string | null;
      [key: string]: any;
    }>;

    const total = await prisma.food.count({
      where: {
        ...where,
        [nutrientField]: {
          not: null,
        },
      },
    });

    return {
      data: foods,
      total,
      limit,
      offset,
    };
  }

  // Top Protein Foods
  static async findTopProtein(pagination: AnalyticsPagination) {
    return this.findTopByNutrient("protein", pagination);
  }

  // Top Fiber Foods
  static async findTopFiber(pagination: AnalyticsPagination) {
    return this.findTopByNutrient("fiber", pagination);
  }

  // Top Vitamin C Foods
  static async findTopVitaminC(pagination: AnalyticsPagination) {
    return this.findTopByNutrient("vitaminC", pagination);
  }

  // Top Vitamin A Foods
  static async findTopVitaminA(pagination: AnalyticsPagination) {
    return this.findTopByNutrient("vitaminARae", pagination);
  }

  // Top Calcium Foods
  static async findTopCalcium(pagination: AnalyticsPagination) {
    return this.findTopByNutrient("calcium", pagination);
  }

  // Category Distribution - Count foods per category
  static async findCategoryDistribution() {
    const foods = await prisma.food.findMany({
      select: {
        category: true,
      },
    });

    const total = foods.length;

    const distribution = foods.reduce(
      (acc: Record<string, number>, food: { category: string | null }) => {
        const cat = food.category || "Unknown";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const result = Object.entries(distribution).map(([category, count]) => ({
      category: category === "Unknown" ? null : category,
      foodCount: count as number,
      percentage: parseFloat(((count as number / total) * 100).toFixed(2)),
    }));

    return {
      data: result.sort((a, b) => b.foodCount - a.foodCount),
      total,
    };
  }

  // Nutrient Distribution - Average nutrients per category
  static async findNutrientDistribution(query: NutrientDistributionQuery) {
    const limit = query.limit;
    const sortBy = query.sortBy;

    const foods = await prisma.food.findMany({
      select: {
        category: true,
        protein: true,
        fiber: true,
        vitaminC: true,
        vitaminARae: true,
        calcium: true,
      },
    });

    const distribution = foods.reduce(
      (acc: Record<string, { foods: typeof foods; count: number }>, food: typeof foods[0]) => {
        const cat = food.category || "Unknown";
        if (!acc[cat]) {
          acc[cat] = {
            foods: [],
            count: 0,
          };
        }
        acc[cat].foods.push(food);
        acc[cat].count += 1;
        return acc;
      },
      {} as Record<
        string,
        { foods: typeof foods; count: number }
      >
    );

    const result = Object.entries(distribution).map(([category, data]) => {
      const foodsArray = data.foods;
      const count = data.count;

      return {
        category: category === "Unknown" ? null : category,
        foodCount: count,
        avgProtein: parseFloat(
          (
            foodsArray.reduce((sum: number, f: typeof foods[0]) => sum + (f.protein || 0), 0) /
            count
          ).toFixed(2)
        ),
        avgFiber: parseFloat(
          (
            foodsArray.reduce((sum: number, f: typeof foods[0]) => sum + (f.fiber || 0), 0) /
            count
          ).toFixed(2)
        ),
        avgVitaminC: parseFloat(
          (
            foodsArray.reduce((sum: number, f: typeof foods[0]) => sum + (f.vitaminC || 0), 0) /
            count
          ).toFixed(2)
        ),
        avgVitaminA: parseFloat(
          (
            foodsArray.reduce(
              (sum: number, f: typeof foods[0]) => sum + (f.vitaminARae || 0),
              0
            ) / count
          ).toFixed(2)
        ),
        avgCalcium: parseFloat(
          (
            foodsArray.reduce((sum: number, f: typeof foods[0]) => sum + (f.calcium || 0), 0) /
            count
          ).toFixed(2)
        ),
      };
    });

    // Sort based on query
    let sorted = result;
    if (sortBy === "foodCount") {
      sorted = result.sort((a, b) => b.foodCount - a.foodCount);
    } else if (sortBy === "avgProtein") {
      sorted = result.sort((a, b) => b.avgProtein - a.avgProtein);
    } else if (sortBy === "avgFiber") {
      sorted = result.sort((a, b) => b.avgFiber - a.avgFiber);
    } else if (sortBy === "avgVitaminC") {
      sorted = result.sort((a, b) => b.avgVitaminC - a.avgVitaminC);
    }

    return {
      data: sorted.slice(0, limit),
    };
  }

  // Top Healthy Foods using health classification algorithm
  static async findTopHealthyFoods(limit: number, offset: number) {
    const foods = await prisma.food.findMany({
      select: {
        id: true,
        description: true,
        category: true,
        protein: true,
        fiber: true,
        sugarTotal: true,
        sodium: true,
        totalLipid: true,
        cholesterol: true,
        vitaminC: true,
        calcium: true,
        iron: true,
      },
      skip: offset,
      take: limit + 100, // Get extra to ensure we have enough healthy foods
    });

    const total = await prisma.food.count();

    // Score each food
    const scored = foods.map((food) => {
      const healthScore = this.calculateHealthScore(food);
      return {
        ...food,
        healthScore,
      };
    });

    // Sort by health score and take top
    const topHealthy = scored
      .sort((a, b) => b.healthScore - a.healthScore)
      .slice(0, limit);

    return {
      data: topHealthy,
      total,
      limit,
      offset,
    };
  }

  // Plant vs Animal Classification
  static async findPlantVsAnimal() {
    const foods = await prisma.food.findMany({
      select: {
        id: true,
        category: true,
        description: true,
      },
    });

    const plantCategories = [
      "Vegetables",
      "Fruits",
      "Grains",
      "Legumes",
      "Nuts",
      "Seeds",
      "Plant",
    ];
    const animalCategories = [
      "Meat",
      "Poultry",
      "Fish",
      "Seafood",
      "Milk",
      "Dairy",
      "Egg",
      "Animal",
    ];

    let plantBased = 0;
    let animalBased = 0;
    let mixed = 0;
    const plantExamples: string[] = [];
    const animalExamples: string[] = [];

    foods.forEach((food) => {
      const category = (food.category || "").toLowerCase();
      const isPlant = plantCategories.some((p) =>
        category.includes(p.toLowerCase())
      );
      const isAnimal = animalCategories.some((a) =>
        category.includes(a.toLowerCase())
      );

      if (isPlant && !isAnimal) {
        plantBased++;
        if (plantExamples.length < 5) plantExamples.push(food.description || "");
      } else if (isAnimal && !isPlant) {
        animalBased++;
        if (animalExamples.length < 5)
          animalExamples.push(food.description || "");
      } else {
        mixed++;
      }
    });

    const total = foods.length;

    return {
      plantBased: {
        count: plantBased,
        percentage: parseFloat(((plantBased / total) * 100).toFixed(2)),
        categories: plantCategories,
        examples: plantExamples,
      },
      animalBased: {
        count: animalBased,
        percentage: parseFloat(((animalBased / total) * 100).toFixed(2)),
        categories: animalCategories,
        examples: animalExamples,
      },
      mixed: {
        count: mixed,
        percentage: parseFloat(((mixed / total) * 100).toFixed(2)),
      },
      total,
    };
  }

  // Processing Level Distribution
  static async findProcessingLevelDistribution() {
    const foods = await prisma.food.findMany({
      select: {
        id: true,
        description: true,
        category: true,
      },
    });

    const wholeWords = [
      "whole",
      "raw",
      "fresh",
      "natural",
      "fruit",
      "vegetable",
      "grain",
      "nut",
      "seed",
    ];
    const minimallyWords = ["frozen", "dried", "canned", "pasteurized"];
    const processedWords = [
      "bread",
      "cheese",
      "yogurt",
      "oil",
      "butter",
      "juice",
      "sauce",
    ];
    const ultraWords = [
      "instant",
      "ready-made",
      "frozen meal",
      "chips",
      "candy",
      "soda",
      "fast food",
      "artificial",
    ];

    let whole = 0;
    let minimally = 0;
    let processed = 0;
    let ultraProcessed = 0;

    const wholeExamples: string[] = [];
    const minimallyExamples: string[] = [];
    const processedExamples: string[] = [];
    const ultraExamples: string[] = [];

    foods.forEach((food) => {
      const desc = (food.description || "").toLowerCase();

      if (ultraWords.some((w) => desc.includes(w))) {
        ultraProcessed++;
        if (ultraExamples.length < 5) ultraExamples.push(food.description || "");
      } else if (processedWords.some((w) => desc.includes(w))) {
        processed++;
        if (processedExamples.length < 5)
          processedExamples.push(food.description || "");
      } else if (minimallyWords.some((w) => desc.includes(w))) {
        minimally++;
        if (minimallyExamples.length < 5)
          minimallyExamples.push(food.description || "");
      } else if (wholeWords.some((w) => desc.includes(w))) {
        whole++;
        if (wholeExamples.length < 5) wholeExamples.push(food.description || "");
      } else {
        whole++;
        if (wholeExamples.length < 5) wholeExamples.push(food.description || "");
      }
    });

    const total = foods.length;

    return {
      whole: {
        count: whole,
        percentage: parseFloat(((whole / total) * 100).toFixed(2)),
        examples: wholeExamples,
      },
      minimally: {
        count: minimally,
        percentage: parseFloat(((minimally / total) * 100).toFixed(2)),
        examples: minimallyExamples,
      },
      processed: {
        count: processed,
        percentage: parseFloat(((processed / total) * 100).toFixed(2)),
        examples: processedExamples,
      },
      ultraProcessed: {
        count: ultraProcessed,
        percentage: parseFloat(((ultraProcessed / total) * 100).toFixed(2)),
        examples: ultraExamples,
      },
      total,
    };
  }

  // Helper: Calculate health score for a food
  private static calculateHealthScore(nutrition: {
    protein?: number | null;
    fiber?: number | null;
    sugarTotal?: number | null;
    sodium?: number | null;
    totalLipid?: number | null;
    cholesterol?: number | null;
    vitaminC?: number | null;
    calcium?: number | null;
    iron?: number | null;
  }): number {
    let score = 50;

    if ((nutrition.protein || 0) >= 10) score += 15;
    else if ((nutrition.protein || 0) >= 5) score += 10;

    if ((nutrition.fiber || 0) >= 3) score += 15;
    else if ((nutrition.fiber || 0) >= 1) score += 10;

    if ((nutrition.sugarTotal || 0) > 20) score -= 20;
    else if ((nutrition.sugarTotal || 0) > 10) score -= 15;

    if ((nutrition.sodium || 0) > 500) score -= 20;
    else if ((nutrition.sodium || 0) > 200) score -= 10;

    if ((nutrition.totalLipid || 0) > 30) score -= 15;
    else if ((nutrition.totalLipid || 0) > 15) score -= 10;

    if ((nutrition.cholesterol || 0) > 200) score -= 20;
    else if ((nutrition.cholesterol || 0) > 100) score -= 10;

    if ((nutrition.vitaminC || 0) >= 20) score += 15;
    else if ((nutrition.vitaminC || 0) >= 10) score += 10;

    if ((nutrition.calcium || 0) >= 100) score += 10;
    else if ((nutrition.calcium || 0) >= 50) score += 5;

    if ((nutrition.iron || 0) >= 2) score += 10;

    return Math.max(0, Math.min(100, score)) / 100;
  }
}
