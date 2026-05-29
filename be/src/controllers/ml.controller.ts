import { Request, Response } from "express";
import { HealthClassificationService } from "../services/ml-health.service";
import { DietTypeClassificationService } from "../services/ml-diet.service";
import { RecommendationService } from "../services/ml-recommendation.service";
import { PersonalizedDietService } from "../services/ml-personalized.service";
import {
  HealthClassificationRequestDto,
} from "../dtos/ml-health.dto";
import {
  DietTypeClassificationRequestDto,
} from "../dtos/ml-diet.dto";
import {
  RecommendationRequestDto,
  PersonalizedDietRequestDto,
} from "../dtos/ml-recommendation.dto";

// Module 3.1: Health Classification Controller
export const classifyHealthiness = async (req: Request, res: Response) => {
  try {
    const validation = HealthClassificationRequestDto.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const result = await HealthClassificationService.classifyFood(validation.data);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// Module 3.2: Diet Classification Controller
export const classifyDietTypes = async (req: Request, res: Response) => {
  try {
    const validation = DietTypeClassificationRequestDto.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const result = await DietTypeClassificationService.classifyDietTypes(validation.data);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// Module 3.3: Recommendations Controller
export const getRecommendations = async (req: Request, res: Response) => {
  try {
    const validation = RecommendationRequestDto.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const result = await RecommendationService.getRecommendations(validation.data);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// Module 3.4: Personalized Diet Controller
export const getPersonalizedDiet = async (req: Request, res: Response) => {
  try {
    const validation = PersonalizedDietRequestDto.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const result = await PersonalizedDietService.recommendPersonalizedDiet(validation.data);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};
