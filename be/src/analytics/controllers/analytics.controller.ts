import { Request, Response } from "express";
import { AnalyticsService } from "../services/analytics.service";
import {
  TopNutrientQueryDto,
  NutrientDistributionQueryDto,
  HealthyFoodsQueryDto,
} from "../dtos/analytics.dto";

// 1. Top Protein Foods
export const getTopProtein = async (req: Request, res: Response) => {
  try {
    const validation = TopNutrientQueryDto.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const { limit, offset, sortBy } = validation.data;
    const result = await AnalyticsService.getTopProtein({
      limit,
      offset,
      sortBy,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// 2. Top Fiber Foods
export const getTopFiber = async (req: Request, res: Response) => {
  try {
    const validation = TopNutrientQueryDto.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const { limit, offset, sortBy } = validation.data;
    const result = await AnalyticsService.getTopFiber({
      limit,
      offset,
      sortBy,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// 3. Top Vitamin C Foods
export const getTopVitaminC = async (req: Request, res: Response) => {
  try {
    const validation = TopNutrientQueryDto.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const { limit, offset, sortBy } = validation.data;
    const result = await AnalyticsService.getTopVitaminC({
      limit,
      offset,
      sortBy,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// 4. Top Vitamin A Foods
export const getTopVitaminA = async (req: Request, res: Response) => {
  try {
    const validation = TopNutrientQueryDto.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const { limit, offset, sortBy } = validation.data;
    const result = await AnalyticsService.getTopVitaminA({
      limit,
      offset,
      sortBy,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// 5. Top Calcium Foods
export const getTopCalcium = async (req: Request, res: Response) => {
  try {
    const validation = TopNutrientQueryDto.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const { limit, offset, sortBy } = validation.data;
    const result = await AnalyticsService.getTopCalcium({
      limit,
      offset,
      sortBy,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// 6. Category Distribution
export const getCategoryDistribution = async (req: Request, res: Response) => {
  try {
    const result = await AnalyticsService.getCategoryDistribution();

    res.json({
      success: true,
      data: result.data,
      summary: {
        totalCategories: result.data.length,
        totalFoods: result.total,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// 7. Nutrient Distribution by Category
export const getNutrientDistribution = async (req: Request, res: Response) => {
  try {
    const validation = NutrientDistributionQueryDto.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const result = await AnalyticsService.getNutrientDistribution(validation.data);

    res.json({
      success: true,
      data: result.data,
      summary: {
        totalCategories: result.data.length,
        sortedBy: validation.data.sortBy,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// 8. Top Healthy Foods
export const getTopHealthyFoods = async (req: Request, res: Response) => {
  try {
    const validation = HealthyFoodsQueryDto.safeParse(req.query);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.issues,
      });
    }

    const { limit, offset } = validation.data;
    const result = await AnalyticsService.getTopHealthyFoods(limit, offset);

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Internal Server Error",
    });
  }
};

// 9. Plant vs Animal Classification
export const getPlantVsAnimal = async (req: Request, res: Response) => {
  try {
    const result = await AnalyticsService.getPlantVsAnimal();

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

// 10. Processing Level Distribution
export const getProcessingLevelDistribution = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await AnalyticsService.getProcessingLevelDistribution();

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
