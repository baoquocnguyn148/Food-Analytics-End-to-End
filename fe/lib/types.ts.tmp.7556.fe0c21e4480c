// Shared API types mirroring the backend response shapes.

export type Role = "USER" | "ADMIN";

export interface User {
  id: number;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface AuthData {
  user: User;
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Full Food row (subset of the 38 nutrition columns most used by the UI).
export interface Food {
  id: number;
  category: string | null;
  description: string | null;
  protein: number | null;
  carbohydrate: number | null;
  totalLipid: number | null;
  sugarTotal: number | null;
  fiber: number | null;
  sodium: number | null;
  cholesterol: number | null;
  calcium: number | null;
  iron: number | null;
  vitaminC: number | null;
  vitaminARae: number | null;
  [key: string]: unknown;
}

export interface FoodListResponse {
  success: boolean;
  data: Food[];
  pagination: Pagination;
}

export interface Profile {
  id: number;
  userId: number;
  age: number | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  weight: number | null;
  height: number | null;
  activityLevel: "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE" | "VERY_ACTIVE" | null;
  goal: string | null;
}

export interface ProfileResponse {
  id: number;
  email: string;
  role: Role;
  createdAt: string;
  profile: Profile | null;
}

// ML
export interface HealthClassification {
  classification: "HEALTHY" | "NEUTRAL" | "UNHEALTHY";
  score: number;
  explanation: string[];
  recommendations: string[];
}

export interface DietTypeResult {
  dietTypes: { type: string; score: number; reason: string }[];
  suitableDiets: string[];
  unsuitableDiets: string[];
}

export interface Recommendation {
  id: number;
  description: string;
  category?: string;
  similarity: number;
  reason: string;
}

export interface RecommendationResponse {
  originalFood: { id: number; description: string; category?: string };
  recommendations: Recommendation[];
}

export interface PersonalizedItem {
  id: number;
  description: string;
  category?: string;
  score: number;
  matchedGoals: string[];
  matchedRestrictions: string[];
  explanation: string[];
}

export interface PersonalizedResponse {
  recommendations: PersonalizedItem[];
  context: { goals: string[]; restrictions: string[]; activityLevel: string };
}

// History
export interface RecommendationLog {
  id: number;
  userId: number;
  foodId: number;
  score: number;
  createdAt: string;
  food: { id: number; description: string | null; category: string | null };
}

export interface ChatMessage {
  id: number;
  sessionId: number;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface ChatSession {
  id: number;
  userId: number;
  title: string | null;
  createdAt: string;
  messages: ChatMessage[];
  _count?: { messages: number };
}

// Analytics
export interface CategoryDistributionItem {
  category: string | null;
  foodCount: number;
  percentage: number;
}

export interface TopNutrientItem {
  id: number;
  description: string;
  category?: string;
  value: number;
  unit: string;
}
