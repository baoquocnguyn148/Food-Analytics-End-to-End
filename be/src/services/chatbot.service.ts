import { FoodRepository } from "../repositories/food.repository";
import { HealthClassificationService } from "./ml-health.service";
import { DietTypeClassificationService } from "./ml-diet.service";
import { RecommendationService } from "./ml-recommendation.service";
import { PersonalizedDietService } from "./ml-personalized.service";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  userGoals?: string[];
  dietRestrictions?: string[];
  activityLevel?: string;
  conversationHistory: ChatMessage[];
  lastFoodId?: number;
  lastFoodName?: string;
}

export interface ChatResult {
  message: string;
  context: Partial<ChatContext>;
}

type Intent =
  | "HEALTH_CHECK"
  | "DIET_COMPATIBILITY"
  | "FIND_SUBSTITUTE"
  | "PERSONALIZED_RECO"
  | "NUTRITION_INFO"
  | "GREETING"
  | "UNKNOWN";

type Lang = "en" | "vi";

// ─── Goal / diet labels (bilingual) ──────────────────────────────────────────

const GOAL_LABEL: Record<string, Record<Lang, string>> = {
  MUSCLEGAIN:     { en: "Muscle Gain 💪",      vi: "Tăng cơ 💪" },
  WEIGHTLOSS:     { en: "Weight Loss 🏃",       vi: "Giảm cân 🏃" },
  ENERGY:         { en: "Energy ⚡",             vi: "Tăng năng lượng ⚡" },
  ENDURANCE:      { en: "Endurance 🏊",          vi: "Sức bền 🏊" },
  RECOVERY:       { en: "Recovery 🔄",           vi: "Phục hồi 🔄" },
  GENERAL_HEALTH: { en: "General Health 🌿",    vi: "Sức khỏe tổng quát 🌿" },
};

export class ChatbotService {
  static async handleChatQuery(
    message: string,
    context: ChatContext = { conversationHistory: [] }
  ): Promise<ChatResult> {
    const lang = this.detectLanguage(message);
    const intent = this.detectIntent(message);
    const contextUpdates: Partial<ChatContext> = {};
    let responseText: string;

    switch (intent) {
      case "GREETING":
        responseText = this.getWelcomeMessage(lang);
        break;

      case "HEALTH_CHECK": {
        const r = await this.handleHealthCheck(message, context, lang);
        responseText = r.response;
        if (r.foodId) { contextUpdates.lastFoodId = r.foodId; contextUpdates.lastFoodName = r.foodName; }
        break;
      }

      case "DIET_COMPATIBILITY": {
        const r = await this.handleDietCheck(message, context, lang);
        responseText = r.response;
        if (r.foodId) { contextUpdates.lastFoodId = r.foodId; contextUpdates.lastFoodName = r.foodName; }
        break;
      }

      case "FIND_SUBSTITUTE": {
        const r = await this.handleSubstitute(message, context, lang);
        responseText = r.response;
        if (r.foodId) { contextUpdates.lastFoodId = r.foodId; contextUpdates.lastFoodName = r.foodName; }
        break;
      }

      case "PERSONALIZED_RECO":
        responseText = await this.handlePersonalized(message, context, lang);
        break;

      case "NUTRITION_INFO": {
        const r = await this.handleNutritionInfo(message, context, lang);
        responseText = r.response;
        if (r.foodId) { contextUpdates.lastFoodId = r.foodId; contextUpdates.lastFoodName = r.foodName; }
        break;
      }

      default:
        responseText = this.getDefaultResponse(lang);
    }

    return { message: responseText, context: contextUpdates };
  }

  // ─── Language detection ───────────────────────────────────────────────────────
  // Presence of any Vietnamese-specific character (diacritics unique to Vietnamese)
  // is a reliable indicator. Falls back to English for mixed or pure-ASCII input.

  private static detectLanguage(message: string): Lang {
    return /[đĐăĂơƠưƯắặằẳẵấầẩẫậếềểễệốồổỗộớờởỡợứừửữựýỳỷỹỵìíỉĩịùúủũụéèẻẽẹáàảãạ]/u.test(message)
      ? "vi"
      : "en";
  }

  // ─── Intent detection (EN + VN) ──────────────────────────────────────────────

  private static detectIntent(message: string): Intent {
    const m = message.toLowerCase();

    if (/^(hi|hello|hey|xin chào|chào|alo|good\s*(morning|evening|day|afternoon))\b/i.test(m)) {
      return "GREETING";
    }

    if (/healthy|unhealthy|lành mạnh|tốt không|có tốt|có.*healthy|khỏe không|sức khỏe của|tốt cho|is.*healthy|is.*good|is.*bad/i.test(m)) {
      return "HEALTH_CHECK";
    }

    if (
      /\b(keto|vegan|ăn chay|chay|vegetarian|paleo|gluten.?free|dairy.?free|low.?sodium|ít muối|tiểu đường|diabetic|tăng cơ|muscle.?gain|giảm cân|weight.?loss)\b.*(?:không|ok|phù hợp|suitable|friendly|compatible|được không)/i.test(m) ||
      /(?:phù hợp|suitable|friendly|compatible|được không).*\b(keto|vegan|chay|vegetarian|paleo|gluten|dairy|sodium|tiểu đường|diabetic|tăng cơ|giảm cân)\b/i.test(m)
    ) {
      return "DIET_COMPATIBILITY";
    }

    if (/thay thế|thay vì|thay.*cho|replace|substitute|instead.*of|alternative|tương tự|giống như|đổi sang/i.test(m)) {
      return "FIND_SUBSTITUTE";
    }

    if (/nên ăn gì|ăn gì|gợi ý|đề xuất|recommend|suggest|meal plan|thực đơn|hôm nay.*ăn|ăn.*hôm nay|what.*should.*eat|what.*to.*eat/i.test(m)) {
      return "PERSONALIZED_RECO";
    }

    if (/dinh dưỡng|thành phần|nutrition|tell.*about|cho.*biết|protein|vitamin|calorie|calo|chất béo|fat|carb|tinh bột|khoáng chất/i.test(m)) {
      return "NUTRITION_INFO";
    }

    return "UNKNOWN";
  }

  // ─── Food lookup ──────────────────────────────────────────────────────────────

  private static async findFood(
    message: string,
    context: ChatContext
  ): Promise<{ food: any | null; name: string | null }> {
    const extracted = this.extractFoodName(message);
    if (extracted) {
      const foods = await FoodRepository.findByDescription(extracted);
      if (foods.length > 0) return { food: foods[0], name: extracted };
    }

    if (context.lastFoodId) {
      const food = await FoodRepository.findById(context.lastFoodId);
      if (food) return { food, name: context.lastFoodName ?? (food.description ?? null) };
    }

    for (const msg of [...context.conversationHistory].reverse().slice(0, 6)) {
      if (msg.role === "user") {
        const name = this.extractFoodName(msg.content);
        if (name) {
          const foods = await FoodRepository.findByDescription(name);
          if (foods.length > 0) return { food: foods[0], name };
        }
      }
    }

    return { food: null, name: extracted };
  }

  private static extractFoodName(message: string): string | null {
    const m = message.trim();
    const patterns = [
      /\bis\s+([\w\s]+?)\s+(?:healthy|good|bad|keto|vegan|safe|ok)\b/i,
      /\b(?:about|of)\s+([\w\s]+?)(?:\?|$|\.|\s+là|\s+có)/i,
      /\b(?:replace|substitute|instead\s+of|alternative\s+(?:to|for)|thay\s+thế|thay\s+vì)\s+([\w\s]+?)(?:\?|$|\.|\s+là|\s+với)/i,
      /(?:tell\s+me\s+about|cho\s+(?:tôi\s+)?biết)\s+([\w\s]+?)(?:\?|$|\.)/i,
      /^([\w\s]+?)\s+(?:nutrition|dinh dưỡng|có|is|are|healthy|protein|vitamin|calorie)/i,
      /(?:thành phần|dinh dưỡng)\s+(?:của\s+)?([\w\s]+?)(?:\?|$|\.)/i,
    ];

    for (const re of patterns) {
      const match = m.match(re);
      if (match?.[1]) {
        const name = match[1].trim().toLowerCase();
        const stopWords = new Set(["it", "this", "that", "the", "a", "an", "i", "me", "nó", "đây", "này", "đó"]);
        if (name.length > 1 && !stopWords.has(name)) return name;
      }
    }

    const cleaned = m.replace(/[?.,!]/g, "").trim();
    if (/^[\w\s]+$/.test(cleaned) && cleaned.split(/\s+/).length <= 3) {
      return cleaned.toLowerCase();
    }

    return null;
  }

  // ─── Module 3.1 — Health Classification ──────────────────────────────────────

  private static async handleHealthCheck(
    message: string,
    context: ChatContext,
    lang: Lang
  ): Promise<{ response: string; foodId?: number; foodName?: string }> {
    const { food, name } = await this.findFood(message, context);

    if (!food) {
      const response = name
        ? lang === "en"
          ? `I couldn't find **"${name}"** in the database. Try the English food name or check the spelling!`
          : `Tôi không tìm thấy **"${name}"** trong cơ sở dữ liệu. Hãy thử nhập tên tiếng Anh hoặc kiểm tra lại chính tả nhé!`
        : lang === "en"
          ? `Which food would you like me to analyze? e.g. _"Is chicken healthy?"_`
          : `Bạn muốn phân tích thực phẩm nào? Ví dụ: _"chicken có healthy không?"_`;
      return { response };
    }

    const result = await HealthClassificationService.classifyFood({ foodId: food.id });
    const score = Math.round(result.score * 100);
    const emoji = result.classification === "HEALTHY" ? "🟢" : result.classification === "NEUTRAL" ? "🟡" : "🔴";

    let response = `${emoji} **${food.description}** — **${result.classification}** (${score}/100)\n\n`;

    if (result.explanation.length > 0) {
      response += lang === "en" ? `📋 **Analysis:**\n` : `📋 **Phân tích:**\n`;
      result.explanation.forEach((e) => (response += `• ${e}\n`));
      response += "\n";
    }

    if (result.recommendations.length > 0) {
      response += lang === "en" ? `💡 **Suggestions:**\n` : `💡 **Gợi ý:**\n`;
      result.recommendations.forEach((r) => (response += `• ${r}\n`));
    }

    return { response, foodId: food.id, foodName: name ?? food.description ?? undefined };
  }

  // ─── Module 3.2 — Diet Type Classification ───────────────────────────────────

  private static async handleDietCheck(
    message: string,
    context: ChatContext,
    lang: Lang
  ): Promise<{ response: string; foodId?: number; foodName?: string }> {
    const { food, name } = await this.findFood(message, context);

    if (!food) {
      const response = name
        ? lang === "en"
          ? `I couldn't find **"${name}"** in the database. Try the English food name!`
          : `Không tìm thấy **"${name}"**. Thử nhập tên tiếng Anh nhé!`
        : lang === "en"
          ? `Which food's diet compatibility would you like to check? e.g. _"Is broccoli keto-friendly?"_`
          : `Bạn muốn kiểm tra chế độ ăn nào? Ví dụ: _"broccoli có phù hợp keto không?"_`;
      return { response };
    }

    const result = await DietTypeClassificationService.classifyDietTypes({ foodId: food.id });
    const askedDiet = this.extractDietKeyword(message);
    let response = "";

    if (askedDiet) {
      const match = result.dietTypes.find((d) => d.type === askedDiet);
      if (match) {
        const verdict =
          lang === "en"
            ? match.score >= 0.5 ? "**suitable** ✅" : "**not suitable** ❌"
            : match.score >= 0.5 ? "**phù hợp** ✅" : "**không phù hợp** ❌";
        const forLabel = lang === "en" ? "for" : "với chế độ";
        response += `**${food.description}** ${verdict} ${forLabel} **${askedDiet}**.\n`;
        response += `> ${match.reason}\n\n`;
      }
    }

    const overviewLabel = lang === "en"
      ? `🍽️ **${food.description}** — Diet overview:\n\n`
      : `🍽️ **${food.description}** — Tổng quan chế độ ăn:\n\n`;
    response += overviewLabel;

    const suitableLabel  = lang === "en" ? "✅ Suitable for:"    : "✅ Phù hợp:";
    const unsuitableLabel = lang === "en" ? "❌ Not suitable for:" : "❌ Không phù hợp:";

    if (result.suitableDiets.length > 0) {
      response += `${suitableLabel} ${result.suitableDiets.join(" · ")}\n`;
    }
    if (result.unsuitableDiets.length > 0) {
      response += `${unsuitableLabel} ${result.unsuitableDiets.join(" · ")}\n`;
    }

    response += lang === "en" ? `\n📊 **Details:**\n` : `\n📊 **Chi tiết:**\n`;
    result.dietTypes.forEach((d) => {
      const icon = d.score >= 0.5 ? "✅" : "❌";
      response += `${icon} **${d.type}**: ${d.reason}\n`;
    });

    return { response, foodId: food.id, foodName: name ?? food.description ?? undefined };
  }

  // ─── Module 3.3 — Content-based Recommendation ───────────────────────────────

  private static async handleSubstitute(
    message: string,
    context: ChatContext,
    lang: Lang
  ): Promise<{ response: string; foodId?: number; foodName?: string }> {
    const { food, name } = await this.findFood(message, context);

    if (!food) {
      const response = name
        ? lang === "en"
          ? `I couldn't find **"${name}"** in the database. Try the English food name!`
          : `Không tìm thấy **"${name}"**. Bạn thử tên tiếng Anh nhé!`
        : lang === "en"
          ? `Which food would you like substitutes for? e.g. _"What can I use instead of salmon?"_`
          : `Bạn muốn tìm thay thế cho thực phẩm nào? Ví dụ: _"thay thế cho salmon là gì?"_`;
      return { response };
    }

    const result = await RecommendationService.getRecommendations({ foodId: food.id, limit: 5 });

    const headerLabel = lang === "en"
      ? `🔄 **Substitutes for ${result.originalFood.description}:**\n\n`
      : `🔄 **Thay thế cho ${result.originalFood.description}:**\n\n`;
    let response = headerLabel;

    if (result.recommendations.length === 0) {
      response += lang === "en"
        ? "No similar foods found in the database."
        : "Không tìm thấy thực phẩm tương tự trong cơ sở dữ liệu.";
    } else {
      const similarityLabel = lang === "en" ? "Similarity" : "Tương đồng";
      result.recommendations.forEach((rec, i) => {
        const pct = Math.round(rec.similarity * 100);
        response += `${i + 1}. **${rec.description}** — ${similarityLabel}: ${pct}%\n`;
        response += `   > ${rec.reason}\n\n`;
      });
    }

    return { response, foodId: food.id, foodName: name ?? food.description ?? undefined };
  }

  // ─── Module 3.4 — Personalized Diet Recommendation ───────────────────────────

  private static async handlePersonalized(
    message: string,
    context: ChatContext,
    lang: Lang
  ): Promise<string> {
    const goals = this.extractGoals(message) ?? context.userGoals ?? ["GENERAL_HEALTH"];
    const restrictions = (context.dietRestrictions ?? []) as any[];
    const activityLevel = (this.extractActivity(message) ?? context.activityLevel ?? "MODERATE") as any;

    const result = await PersonalizedDietService.recommendPersonalizedDiet({
      goals: goals as any,
      restrictions,
      activityLevel,
      limit: 8,
    });

    const goalStr = goals.map((g) => GOAL_LABEL[g]?.[lang] ?? g).join(", ");

    const headerLabel = lang === "en"
      ? `🎯 **Food recommendations for: ${goalStr}**\n\n`
      : `🎯 **Gợi ý thực phẩm cho mục tiêu: ${goalStr}**\n\n`;
    let response = headerLabel;

    if (result.recommendations.length === 0) {
      return response + (lang === "en"
        ? "No matching foods found. Try adjusting your goals or restrictions!"
        : "Không tìm thấy thực phẩm phù hợp. Hãy thử thay đổi tiêu chí nhé!");
    }

    const matchLabel   = lang === "en" ? "Match"   : "Phù hợp";
    const fitsLabel    = lang === "en" ? "✅ Fits:" : "✅ Phù hợp với:";

    result.recommendations.forEach((rec, i) => {
      const score = Math.round(rec.score * 100);
      response += `${i + 1}. **${rec.description}** — ${matchLabel}: ${score}%\n`;
      if (rec.matchedGoals.length > 0) {
        response += `   ${fitsLabel} ${rec.matchedGoals.map((g) => GOAL_LABEL[g]?.[lang] ?? g).join(", ")}\n`;
      }
      response += `   > ${rec.explanation[0]}\n\n`;
    });

    return response;
  }

  // ─── Nutrition info ───────────────────────────────────────────────────────────

  private static async handleNutritionInfo(
    message: string,
    context: ChatContext,
    lang: Lang
  ): Promise<{ response: string; foodId?: number; foodName?: string }> {
    const { food, name } = await this.findFood(message, context);

    if (!food) {
      const response = name
        ? lang === "en"
          ? `I couldn't find **"${name}"** in the database.`
          : `Không tìm thấy **"${name}"** trong cơ sở dữ liệu.`
        : lang === "en"
          ? `Which food's nutrition info would you like? e.g. _"Tell me about broccoli"_`
          : `Bạn muốn xem thông tin dinh dưỡng của thực phẩm nào?`;
      return { response };
    }

    const kcal = Math.round(
      (food.protein ?? 0) * 4 + (food.carbohydrate ?? 0) * 4 + (food.totalLipid ?? 0) * 9
    );

    const nutritionHeader = lang === "en" ? `📊 **Nutrition Facts: ${food.description}**\n` : `📊 **Dinh dưỡng: ${food.description}**\n`;
    const categoryLabel   = lang === "en" ? "Category" : "Nhóm";
    const energyLabel     = lang === "en" ? "🔥 **Estimated Energy:**" : "🔥 **Năng lượng (ước tính):**";
    const macrosLabel     = lang === "en" ? "**Macros:**"              : "**Macros:**";
    const fatLabel        = lang === "en" ? "Fat"                      : "Chất béo";
    const fiberLabel      = lang === "en" ? "Fiber"                    : "Chất xơ";
    const sugarLabel      = lang === "en" ? "Sugar"                    : "Đường";
    const mineralsLabel   = lang === "en" ? "**Minerals & Vitamins:**" : "**Khoáng chất & Vitamin:**";
    const ratingLabel     = lang === "en" ? "Rating"                   : "Đánh giá";

    let response = nutritionHeader;
    if (food.category) response += `_${categoryLabel}: ${food.category}_\n`;
    response += `\n${energyLabel} ${kcal} kcal\n\n`;
    response += `${macrosLabel}\n`;
    response += `• Protein: **${food.protein ?? 0}g**\n`;
    response += `• Carbohydrate: **${food.carbohydrate ?? 0}g**\n`;
    response += `• ${fatLabel}: **${food.totalLipid ?? 0}g**\n`;
    response += `• ${fiberLabel}: **${food.fiber ?? 0}g**\n`;
    response += `• ${sugarLabel}: **${food.sugarTotal ?? 0}g**\n`;

    const minerals: [string, number | null][] = [
      ["Vitamin C", food.vitaminC],
      ["Calcium", food.calcium],
      ["Iron", food.iron],
      ["Sodium", food.sodium],
      ["Potassium", food.potassium],
      ["Zinc", food.zinc],
    ];
    const present = minerals.filter(([, v]) => v != null && v > 0);
    if (present.length > 0) {
      response += `\n${mineralsLabel}\n`;
      present.forEach(([label, val]) => (response += `• ${label}: ${val}mg\n`));
    }

    const health = await HealthClassificationService.classifyFood({ foodId: food.id });
    const emoji = health.classification === "HEALTHY" ? "🟢" : health.classification === "NEUTRAL" ? "🟡" : "🔴";
    response += `\n${emoji} ${ratingLabel}: **${health.classification}** (${Math.round(health.score * 100)}/100)`;

    return { response, foodId: food.id, foodName: name ?? food.description ?? undefined };
  }

  // ─── Extraction helpers ───────────────────────────────────────────────────────

  private static extractDietKeyword(message: string): string | null {
    const map: [RegExp, string][] = [
      [/\bketo\b/i, "KETO"],
      [/\bvegan|ăn chay\b/i, "VEGAN"],
      [/\bvegetarian\b/i, "VEGETARIAN"],
      [/\bpaleo\b/i, "PALEO"],
      [/\blow.?sodium|ít muối\b/i, "LOWSODIUM"],
      [/\bdiabetic|tiểu đường\b/i, "DIABETICFRIENDLY"],
      [/\bmuscle.?gain|tăng cơ\b/i, "MUSCLEGAIN"],
      [/\bweight.?loss|giảm cân\b/i, "WEIGHTLOSS"],
      [/\bgluten.?free\b/i, "GLUTENFREE"],
      [/\bdairy.?free\b/i, "DAIRYFREE"],
    ];
    const m = message.toLowerCase();
    for (const [re, diet] of map) {
      if (re.test(m)) return diet;
    }
    return null;
  }

  private static extractGoals(message: string): string[] | null {
    const map: [RegExp, string][] = [
      [/\bmuscle|tăng cơ|gym|tập gym\b/i, "MUSCLEGAIN"],
      [/\blose weight|giảm cân|weight.?loss\b/i, "WEIGHTLOSS"],
      [/\benergy|năng lượng|tăng năng lượng\b/i, "ENERGY"],
      [/\bendurance|sức bền|marathon|chạy bộ\b/i, "ENDURANCE"],
      [/\brecovery|phục hồi\b/i, "RECOVERY"],
      [/\bhealthy|sức khỏe|general.?health\b/i, "GENERAL_HEALTH"],
    ];
    const goals: string[] = [];
    for (const [re, goal] of map) {
      if (re.test(message) && !goals.includes(goal)) goals.push(goal);
    }
    return goals.length > 0 ? goals : null;
  }

  private static extractActivity(message: string): string | null {
    const m = message.toLowerCase();
    if (/very active|vận động nhiều|tập nặng/.test(m)) return "VERY_ACTIVE";
    if (/\bactive\b|tập.*ngày|gym|sport/.test(m)) return "ACTIVE";
    if (/moderate|vừa phải/.test(m)) return "MODERATE";
    if (/sedentary|ngồi nhiều|văn phòng|ít vận động/.test(m)) return "SEDENTARY";
    return null;
  }

  // ─── Static responses (bilingual) ────────────────────────────────────────────

  private static getWelcomeMessage(lang: Lang): string {
    if (lang === "en") {
      return (
        `👋 Hi! I'm **NutriBot** — your AI nutrition assistant.\n\n` +
        `I can help you with:\n` +
        `• 🟢 **Health analysis** — _"Is chicken healthy?"_\n` +
        `• 🍽️ **Diet compatibility** — _"Is egg keto-friendly?"_\n` +
        `• 🔄 **Find substitutes** — _"What can replace salmon?"_\n` +
        `• 📊 **Nutrition facts** — _"Tell me about broccoli"_\n` +
        `• 🎯 **Personalized picks** — _"I want to build muscle, what should I eat?"_\n\n` +
        `Ask me anything about food! 🥗`
      );
    }
    return (
      `👋 Xin chào! Tôi là **NutriBot** — trợ lý dinh dưỡng AI của bạn.\n\n` +
      `Tôi có thể giúp bạn:\n` +
      `• 🟢 **Phân tích sức khỏe** — _"chicken có healthy không?"_\n` +
      `• 🍽️ **Kiểm tra chế độ ăn** — _"egg có phù hợp keto không?"_\n` +
      `• 🔄 **Tìm thay thế** — _"thay thế cho salmon là gì?"_\n` +
      `• 📊 **Thông tin dinh dưỡng** — _"dinh dưỡng của broccoli?"_\n` +
      `• 🎯 **Gợi ý cá nhân** — _"tôi muốn tăng cơ, nên ăn gì?"_\n\n` +
      `Hỏi tôi bất cứ điều gì về thực phẩm! 🥗`
    );
  }

  private static getDefaultResponse(lang: Lang): string {
    if (lang === "en") {
      return (
        `🤔 I didn't quite understand that. You can ask me:\n\n` +
        `• **Health**: _"Is salmon healthy?"_\n` +
        `• **Diet**: _"Is beef keto-friendly?"_\n` +
        `• **Substitute**: _"What can replace eggs?"_\n` +
        `• **Nutrition**: _"How much protein is in chicken?"_\n` +
        `• **Recommendations**: _"I want to lose weight, what should I eat?"_\n\n` +
        `Use English food names so I can find them in the database! 😊`
      );
    }
    return (
      `🤔 Tôi chưa hiểu câu hỏi. Bạn có thể thử:\n\n` +
      `• **Sức khỏe**: _"salmon có healthy không?"_\n` +
      `• **Chế độ ăn**: _"beef có phù hợp keto không?"_\n` +
      `• **Thay thế**: _"thay thế cho egg là gì?"_\n` +
      `• **Dinh dưỡng**: _"protein trong chicken bao nhiêu?"_\n` +
      `• **Gợi ý**: _"tôi muốn giảm cân, nên ăn gì?"_\n\n` +
      `Hãy dùng tên tiếng Anh cho thực phẩm để tôi tìm được trong database nhé! 😊`
    );
  }
}
