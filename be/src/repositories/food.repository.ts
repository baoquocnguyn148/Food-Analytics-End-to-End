import prisma from "../config/prisma";
import { CreateFoodType } from "../dtos/food.dto";

// FIXED: Added Repository pattern for cleaner data access
// Separates database operations from business logic

export class FoodRepository {
  static async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        skip,
        take: limit,
        orderBy: { id: "asc" }
      }),
      prisma.food.count()
    ]);

    return {
      data: foods,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  static async findById(id: number) {
    return prisma.food.findUnique({
      where: { id }
    });
  }

  static async findByDescription(description: string) {
    return prisma.food.findMany({
      where: {
        description: {
          contains: description
        }
      }
    });
  }

  static async create(data: CreateFoodType) {
    return prisma.food.create({
      data: {
        ...data,
        nutrientDataBankNumber: BigInt(data.nutrientDataBankNumber)
      }
    });
  }

  static async count() {
    return prisma.food.count();
  }
}
