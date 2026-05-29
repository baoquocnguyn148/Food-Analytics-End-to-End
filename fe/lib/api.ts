import { tokenStore } from "./token-store";
import type {
  AuthData,
  Food,
  FoodListResponse,
  ProfileResponse,
  Profile,
  HealthClassification,
  DietTypeResult,
  RecommendationResponse,
  PersonalizedResponse,
  RecommendationLog,
  ChatSession,
  Pagination,
  CategoryDistributionItem,
  TopNutrientItem,
} from "./types";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean; // attach Bearer token
  query?: Record<string, string | number | undefined>;
  _retried?: boolean;
}

// Single in-flight refresh shared across concurrent 401s.
let refreshPromise: Promise<boolean> | null = null;

async function doRefresh(): Promise<boolean> {
  const refreshToken = tokenStore.getRefresh();
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
      tokenStore.clear();
      return false;
    }
    const json = await res.json();
    const data = json.data as AuthData;
    tokenStore.setTokens(data.accessToken, data.refreshToken);
    return true;
  } catch {
    tokenStore.clear();
    return false;
  }
}

function buildQuery(query?: RequestOptions["query"]): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
  }
  const s = params.toString();
  return s ? `?${s}` : "";
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = false, query } = opts;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = tokenStore.getAccess();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}${buildQuery(query)}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Auto-refresh once on 401 for authenticated calls.
  if (res.status === 401 && auth && !opts._retried) {
    if (!refreshPromise) refreshPromise = doRefresh();
    const ok = await refreshPromise;
    refreshPromise = null;
    if (ok) return request<T>(path, { ...opts, _retried: true });
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const msg =
      json?.error?.message ||
      (typeof json?.error === "string" ? json.error : null) ||
      `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, json?.error?.code);
  }
  return json as T;
}

// ---------- Grouped API surface ----------

export const api = {
  raw: request,

  auth: {
    register: (email: string, password: string) =>
      request<{ success: boolean; data: AuthData }>("/api/auth/register", {
        method: "POST",
        body: { email, password },
      }),
    login: (email: string, password: string) =>
      request<{ success: boolean; data: AuthData }>("/api/auth/login", {
        method: "POST",
        body: { email, password },
      }),
    logout: (refreshToken: string) =>
      request("/api/auth/logout", { method: "POST", body: { refreshToken } }),
    me: () => request<{ success: boolean; data: { id: number; email: string; role: string } }>(
      "/api/auth/me",
      { auth: true }
    ),
  },

  foods: {
    list: (page = 1, limit = 12) =>
      request<FoodListResponse>("/api/foods", { query: { page, limit } }),
    get: (id: number) =>
      request<{ success: boolean; data: Food }>(`/api/foods/${id}`),
    search: (description: string) =>
      request<{ success: boolean; data: Food[] }>("/api/foods/search", {
        query: { description },
      }),
  },

  ml: {
    health: (foodId: number) =>
      request<{ success: boolean; data: HealthClassification }>(
        "/api/ml/health-classification",
        { method: "POST", body: { foodId } }
      ),
    diet: (foodId: number) =>
      request<{ success: boolean; data: DietTypeResult }>(
        "/api/ml/diet-classification",
        { method: "POST", body: { foodId } }
      ),
    recommendations: (foodId: number, limit = 5) =>
      request<{ success: boolean; data: RecommendationResponse }>(
        "/api/ml/recommendations",
        { method: "POST", body: { foodId, limit } }
      ),
    personalized: (payload: {
      goals: string[];
      restrictions?: string[];
      activityLevel?: string;
      limit?: number;
    }) =>
      request<{ success: boolean; data: PersonalizedResponse }>(
        "/api/ml/personalized-diet",
        { method: "POST", body: payload }
      ),
  },

  chatbot: {
    ask: (message: string, context?: Record<string, unknown>) =>
      request<{ success: boolean; data: { message: string; context: unknown } }>(
        "/api/chatbot/ask",
        { method: "POST", body: { message, context } }
      ),
  },

  analytics: {
    categoryDistribution: () =>
      request<{ success: boolean; data: CategoryDistributionItem[]; summary: any }>(
        "/api/analytics/category-distribution"
      ),
    topProtein: (limit = 8) =>
      request<{ success: boolean; data: TopNutrientItem[]; pagination: Pagination }>(
        "/api/analytics/top-protein",
        { query: { limit } }
      ),
    topFiber: (limit = 8) =>
      request<{ success: boolean; data: TopNutrientItem[]; pagination: Pagination }>(
        "/api/analytics/top-fiber",
        { query: { limit } }
      ),
    topVitaminC: (limit = 8) =>
      request<{ success: boolean; data: TopNutrientItem[]; pagination: Pagination }>(
        "/api/analytics/top-vitamin-c",
        { query: { limit } }
      ),
  },

  profile: {
    get: () => request<{ success: boolean; data: ProfileResponse }>("/api/profile", { auth: true }),
    update: (data: Partial<Profile>) =>
      request<{ success: boolean; data: Profile }>("/api/profile", {
        method: "PUT",
        body: data,
        auth: true,
      }),
  },

  history: {
    recommendations: (page = 1, limit = 20) =>
      request<{ success: boolean; data: RecommendationLog[]; pagination: Pagination }>(
        "/api/recommendations/history",
        { query: { page, limit }, auth: true }
      ),
    chat: (page = 1, limit = 20) =>
      request<{ success: boolean; data: ChatSession[]; pagination: Pagination }>(
        "/api/chat/history",
        { query: { page, limit }, auth: true }
      ),
  },
};

// Helper: estimate calories from macros (backend has no calories column).
export function estimateCalories(food: Partial<Food>): number {
  const p = Number(food.protein) || 0;
  const c = Number(food.carbohydrate) || 0;
  const f = Number(food.totalLipid) || 0;
  return Math.round(p * 4 + c * 4 + f * 9);
}
