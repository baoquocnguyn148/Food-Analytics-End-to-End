// Mock data based on the analysis plan
// In production, this would load from CSV files or API

export interface FoodItem {
  description: string;
  main_group: string;
  sub_group: string;
  calories: number;
  protein: number;
  carbohydrate: number;
  fat_total_lipid: number;
  fiber: number;
  sugar_total: number;
  sodium: number;
  nds: number;
  cws: number;
  health_label: string;
  health_score: number;
  food_cluster: string;
  cluster_name: string;
  anomaly_flag: boolean;
  is_muscle_gain: boolean;
  is_keto: boolean;
  is_heart_health: boolean;
  is_weight_loss: boolean;
  is_diabetes_friendly: boolean;
  is_vegan: boolean;
  is_plant_based: boolean;
}

// Sample KPI data
export const getKPIData = () => ({
  totalFoods: 7083,
  avgNDS: 42.3,
  percentPlantBased: 38.5,
  percentUltraProcessed: 22.1,
});

// Plant-based vs Animal-based distribution
export const getPlantAnimalDistribution = () => [
  { name: "Plant-based", value: 2721, color: "#10b981" },
  { name: "Animal-based", value: 4362, color: "#f97316" },
];

// NOVA processing levels by main group
export const getNovaDistribution = () => [
  {
    main_group: "Dairy & Eggs",
    nova1: 45,
    nova2: 25,
    nova3: 20,
    nova4: 10,
  },
  {
    main_group: "Meat & Poultry",
    nova1: 50,
    nova2: 20,
    nova3: 15,
    nova4: 15,
  },
  {
    main_group: "Vegetables",
    nova1: 85,
    nova2: 10,
    nova3: 4,
    nova4: 1,
  },
  {
    main_group: "Fruits",
    nova1: 90,
    nova2: 5,
    nova3: 3,
    nova4: 2,
  },
  { main_group: "Grains", nova1: 20, nova2: 40, nova3: 25, nova4: 15 },
  { main_group: "Beverages", nova1: 15, nova2: 20, nova3: 30, nova4: 35 },
];

// Scatter plot: Calories vs Protein
export const getCalorieProteinData = () => [
  {
    name: "Vegetables",
    x: 35,
    y: 2.5,
    size: 65,
    color: "#10b981",
  },
  {
    name: "Fruits",
    x: 60,
    y: 0.8,
    size: 45,
    color: "#f59e0b",
  },
  {
    name: "Grains",
    x: 340,
    y: 13,
    size: 120,
    color: "#d97706",
  },
  {
    name: "Meat & Poultry",
    x: 165,
    y: 26,
    size: 85,
    color: "#ef4444",
  },
  {
    name: "Dairy & Eggs",
    x: 120,
    y: 17,
    size: 75,
    color: "#3b82f6",
  },
  {
    name: "Legumes",
    x: 123,
    y: 8.7,
    size: 95,
    color: "#8b5cf6",
  },
];

// ML Clustering - Macro profiles
export const getMacroProfiles = () => [
  {
    cluster: "High-Carb",
    Protein: 65,
    Carbs: 85,
    Fat: 35,
  },
  {
    cluster: "High-Protein",
    Protein: 95,
    Carbs: 45,
    Fat: 50,
  },
  {
    cluster: "High-Fat",
    Protein: 55,
    Carbs: 40,
    Fat: 90,
  },
  {
    cluster: "Balanced",
    Protein: 65,
    Carbs: 70,
    Fat: 65,
  },
  {
    cluster: "Low-Cal",
    Protein: 50,
    Carbs: 40,
    Fat: 20,
  },
  {
    cluster: "Low-Carb",
    Protein: 75,
    Carbs: 20,
    Fat: 75,
  },
];

// Health classification treemap
export const getHealthTreemapData = () => ({
  name: "Health Labels",
  children: [
    {
      name: "Healthy",
      value: 3200,
      fill: "#10b981",
    },
    {
      name: "Neutral",
      value: 2400,
      fill: "#f59e0b",
    },
    {
      name: "Unhealthy",
      value: 1483,
      fill: "#ef4444",
    },
  ],
});

// Nutrition traps (anomalies)
export const getNutritionTraps = () => [
  {
    name: "Granola with dried fruit",
    calories: 480,
    sugar: 28,
    sodium: 180,
    reason: "High sugar despite health appearance",
  },
  {
    name: "Low-fat yogurt",
    calories: 100,
    sugar: 18,
    sodium: 85,
    reason: "Added sugar to compensate for low fat",
  },
  {
    name: "Trail mix",
    calories: 590,
    sugar: 32,
    sodium: 160,
    reason: "High calories and sugar from dried fruits",
  },
  {
    name: "Commercial juice blend",
    calories: 110,
    sugar: 26,
    sodium: 45,
    reason: "Liquid sugar with minimal fiber",
  },
  {
    name: "Whole grain cereal",
    calories: 380,
    sugar: 12,
    sodium: 520,
    reason: "Excessive sodium despite health label",
  },
];

// Diet recommendations by goal
export const getDietRecommendations = () => [
  { diet: "Keto", count: 1200, color: "#3b82f6" },
  { diet: "Vegan", count: 890, color: "#10b981" },
  { diet: "Diabetes-friendly", count: 1450, color: "#f59e0b" },
  { diet: "Heart Health", count: 1680, color: "#ef4444" },
  { diet: "Muscle Gain", count: 1340, color: "#8b5cf6" },
  { diet: "Weight Loss", count: 1520, color: "#06b6d4" },
];

// Sugar vs Sodium scatter
export const getSugarSodiumData = () => [
  { sugar: 5, sodium: 120, category: "Vegetables", size: 80 },
  { sugar: 15, sodium: 45, category: "Fruits", size: 65 },
  { sugar: 2, sodium: 800, category: "Processed", size: 90 },
  { sugar: 28, sodium: 200, category: "Beverages", size: 75 },
  { sugar: 8, sodium: 650, category: "Grains", size: 95 },
  { sugar: 0, sodium: 500, category: "Meat", size: 70 },
];

// Sample foods for finder
export const getSampleFoods = (): FoodItem[] => [
  {
    description: "Broccoli, raw",
    main_group: "Vegetables",
    sub_group: "Leafy Greens",
    calories: 34,
    protein: 2.8,
    carbohydrate: 7,
    fat_total_lipid: 0.4,
    fiber: 2.4,
    sugar_total: 1.7,
    sodium: 64,
    nds: 78.5,
    cws: 85.2,
    health_label: "Healthy",
    health_score: 95,
    food_cluster: 1,
    cluster_name: "Low-Calorie",
    anomaly_flag: false,
    is_muscle_gain: true,
    is_keto: true,
    is_heart_health: true,
    is_weight_loss: true,
    is_diabetes_friendly: true,
    is_vegan: true,
    is_plant_based: true,
  },
  {
    description: "Salmon, wild, raw",
    main_group: "Meat & Poultry",
    sub_group: "Fish",
    calories: 206,
    protein: 22,
    carbohydrate: 0,
    fat_total_lipid: 13,
    fiber: 0,
    sugar_total: 0,
    sodium: 75,
    nds: 72.3,
    cws: 78.9,
    health_label: "Healthy",
    health_score: 92,
    food_cluster: 2,
    cluster_name: "High-Protein",
    anomaly_flag: false,
    is_muscle_gain: true,
    is_keto: true,
    is_heart_health: true,
    is_weight_loss: false,
    is_diabetes_friendly: true,
    is_vegan: false,
    is_plant_based: false,
  },
  {
    description: "Lentils, raw",
    main_group: "Legumes",
    sub_group: "Beans & Legumes",
    calories: 353,
    protein: 25,
    carbohydrate: 63,
    fat_total_lipid: 1.1,
    fiber: 10.5,
    sugar_total: 1.8,
    sodium: 6,
    nds: 68.4,
    cws: 81.2,
    health_label: "Healthy",
    health_score: 88,
    food_cluster: 0,
    cluster_name: "High-Carb",
    anomaly_flag: false,
    is_muscle_gain: true,
    is_keto: false,
    is_heart_health: true,
    is_weight_loss: true,
    is_diabetes_friendly: true,
    is_vegan: true,
    is_plant_based: true,
  },
  {
    description: "Spinach, raw",
    main_group: "Vegetables",
    sub_group: "Leafy Greens",
    calories: 23,
    protein: 2.7,
    carbohydrate: 3.6,
    fat_total_lipid: 0.4,
    fiber: 2.2,
    sugar_total: 0.4,
    sodium: 79,
    nds: 82.1,
    cws: 88.4,
    health_label: "Healthy",
    health_score: 98,
    food_cluster: 1,
    cluster_name: "Low-Calorie",
    anomaly_flag: false,
    is_muscle_gain: true,
    is_keto: true,
    is_heart_health: true,
    is_weight_loss: true,
    is_diabetes_friendly: true,
    is_vegan: true,
    is_plant_based: true,
  },
  {
    description: "Chicken breast, skinless",
    main_group: "Meat & Poultry",
    sub_group: "Poultry",
    calories: 165,
    protein: 31,
    carbohydrate: 0,
    fat_total_lipid: 3.6,
    fiber: 0,
    sugar_total: 0,
    sodium: 74,
    nds: 65.2,
    cws: 72.8,
    health_label: "Healthy",
    health_score: 89,
    food_cluster: 2,
    cluster_name: "High-Protein",
    anomaly_flag: false,
    is_muscle_gain: true,
    is_keto: true,
    is_heart_health: true,
    is_weight_loss: true,
    is_diabetes_friendly: true,
    is_vegan: false,
    is_plant_based: false,
  },
];

export const getAllFoods = (): FoodItem[] => {
  // In production, load from CSV
  return getSampleFoods();
};
