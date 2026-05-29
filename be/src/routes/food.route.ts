import { Router } from "express";
import * as FoodController from "../controllers/food.controller";

const router = Router();

// FIXED: Added search endpoint and organized route documentation
router.get("/", FoodController.getFoods);
router.get("/search", FoodController.searchFood);
router.get("/:id", FoodController.getFood);
router.post("/", FoodController.createFood);

export default router;