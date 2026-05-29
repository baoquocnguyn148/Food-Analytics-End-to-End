import { FoodRepository } from "../repositories/food.repository";
import { CreateFoodType } from "../dtos/food.dto";

// FIXED: Now uses Repository pattern instead of direct Prisma calls
// Added proper types, error handling, and pagination support

export class FoodService {
  static async getAllFoods(page: number = 1, limit: number = 10) {
    try {
      return await FoodRepository.findAll(page, limit);
    } catch (error) {
      throw new Error(`Failed to fetch foods: ${error}`);
    }
  }

  static async getFoodById(id: number) {
    try {
      const food = await FoodRepository.findById(id);
      if (!food) {
        const err = new Error("Food not found") as any;
        err.status = 404;
        throw err;
      }
      return food;
    } catch (error) {
      throw error;
    }
  }

  static async searchFoodByDescription(description: string) {
    try {
      return await FoodRepository.findByDescription(description);
    } catch (error) {
      throw new Error(`Failed to search foods: ${error}`);
    }
  }

  static async createFood(data: CreateFoodType) {
    try {
      return await FoodRepository.create(data);
    } catch (error) {
      throw new Error(`Failed to create food: ${error}`);
    }
  }

  static async getFoodCount() {
    try {
      return await FoodRepository.count();
    } catch (error) {
      throw new Error(`Failed to get food count: ${error}`);
    }
  }
}