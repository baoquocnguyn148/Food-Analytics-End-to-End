import { Request, Response } from "express";
import { FoodService } from "../services/food.service";
import { CreateFoodDto, GetFoodPaginationDto } from "../dtos/food.dto";

// FIXED: Added error handling, proper HTTP status codes, pagination support, and type validation

export const getFoods = async (req: Request, res: Response) => {
  try {
    // Validate pagination parameters
    const validation = GetFoodPaginationDto.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues
      });
    }

    const { page, limit } = validation.data;
    const result = await FoodService.getAllFoods(page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
};

export const getFood = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format"
      });
    }

    const food = await FoodService.getFoodById(id);
    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Food not found") {
      return res.status(404).json({
        success: false,
        error: "Food not found"
      });
    }
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
};

export const searchFood = async (req: Request, res: Response) => {
  try {
    const { description } = req.query;
    if (!description || typeof description !== "string") {
      return res.status(400).json({
        success: false,
        error: "Description query parameter is required"
      });
    }

    const foods = await FoodService.searchFoodByDescription(description);
    res.json({
      success: true,
      data: foods
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
};

export const createFood = async (req: Request, res: Response) => {
  try {
    const validation = CreateFoodDto.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues
      });
    }

    const food = await FoodService.createFood(validation.data);
    res.status(201).json({
      success: true,
      data: food
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error"
    });
  }
};
