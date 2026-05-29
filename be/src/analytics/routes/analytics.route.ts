import { Router } from "express";
import * as AnalyticsController from "../controllers/analytics.controller";

const router = Router();

// 1. Top Nutrient Endpoints
router.get("/top-protein", AnalyticsController.getTopProtein);
router.get("/top-fiber", AnalyticsController.getTopFiber);
router.get("/top-vitamin-c", AnalyticsController.getTopVitaminC);
router.get("/top-vitamin-a", AnalyticsController.getTopVitaminA);
router.get("/top-calcium", AnalyticsController.getTopCalcium);

// 2. Aggregated Analytics Endpoints
router.get("/category-distribution", AnalyticsController.getCategoryDistribution);
router.get(
  "/nutrient-distribution",
  AnalyticsController.getNutrientDistribution
);

// 3. Healthy Foods & Classifications
router.get("/top-healthy-foods", AnalyticsController.getTopHealthyFoods);
router.get("/plant-vs-animal", AnalyticsController.getPlantVsAnimal);
router.get(
  "/processing-level-distribution",
  AnalyticsController.getProcessingLevelDistribution
);

export default router;
