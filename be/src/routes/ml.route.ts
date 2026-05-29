import { Router } from "express";
import * as MLController from "../controllers/ml.controller";

const router = Router();

// Module 3.1: Health Classification
// POST /api/ml/health-classification
// Body: { foodId?: number, description?: string, ...nutrition values }
router.post("/health-classification", MLController.classifyHealthiness);

// Module 3.2: Diet Type Classification
// POST /api/ml/diet-classification
// Body: { foodId?: number, ...nutrition values }
router.post("/diet-classification", MLController.classifyDietTypes);

// Module 3.3: Content-based Recommendations
// POST /api/ml/recommendations
// Body: { foodId: number, limit?: number }
router.post("/recommendations", MLController.getRecommendations);

// Module 3.4: Personalized Diet Recommendation
// POST /api/ml/personalized-diet
// Body: { goals: string[], restrictions?: string[], activityLevel?: string, limit?: number }
router.post("/personalized-diet", MLController.getPersonalizedDiet);

export default router;
