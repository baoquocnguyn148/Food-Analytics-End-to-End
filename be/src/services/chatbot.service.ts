import { FoodRepository } from "../repositories/food.repository";
import { HealthClassificationService } from "./ml-health.service";
import { DietTypeClassificationService } from "./ml-diet.service";
import { RecommendationService } from "./ml-recommendation.service";
import { PersonalizedDietService } from "./ml-personalized.service";

// Chatbot Service - Integrates all ML modules
// Understands conversational context and provides intelligent responses

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatContext {
  userGoals?: string[];
  dietRestrictions?: string[];
  activityLevel?: string;
  conversationHistory: ChatMessage[];
}

export class ChatbotService {
  static async handleChatQuery(message: string, context: ChatContext = { conversationHistory: [] }): Promise<string> {
    const query = message.toLowerCase();

    // Try to match user intent
    if (this.isHealthinessQuery(query)) {
      return await this.handleHealthinessQuery(message, context);
    }

    if (this.isDietQuery(query)) {
      return await this.handleDietQuery(message, context);
    }

    if (this.isRecommendationQuery(query)) {
      return await this.handleRecommendationQuery(message, context);
    }

    if (this.isPersonalizedQuery(query)) {
      return await this.handlePersonalizedQuery(message, context);
    }

    if (this.isInformationQuery(query)) {
      return await this.handleInformationQuery(message, context);
    }

    // Default response
    return this.generateDefaultResponse();
  }

  private static isHealthinessQuery(query: string): boolean {
    return /healthy|unhealthy|nutritious|nutrition|good.*eat|bad.*eat|is.*healthy|health.*food/i.test(query);
  }

  private static isDietQuery(query: string): boolean {
    return /keto|vegan|vegetarian|paleo|dairy.*free|gluten.*free|low.*sodium|diabetic|diet.*suitable/i.test(query);
  }

  private static isRecommendationQuery(query: string): boolean {
    return /replace|substitute|alternative|instead.*of|similar.*to|like.*but/i.test(query);
  }

  private static isPersonalizedQuery(query: string): boolean {
    return /recommend|suggest|what.*eat|what.*should.*eat|meal|diet.*plan|personalized/i.test(query);
  }

  private static isInformationQuery(query: string): boolean {
    return /tell.*about|what.*is|nutrition.*of|how.*much|protein|carb|fat|vitamin/i.test(query);
  }

  private static async handleHealthinessQuery(message: string, context: ChatContext): Promise<string> {
    const foodName = this.extractFoodName(message);
    if (!foodName) {
      return "Could you tell me which food you'd like me to analyze? For example: 'Is chicken healthy?' or 'How healthy is salmon?'";
    }

    const foods = await FoodRepository.findByDescription(foodName);
    if (foods.length === 0) {
      return `I couldn't find '${foodName}' in our database. Could you try another food item?`;
    }

    const food = foods[0];
    const classification = await HealthClassificationService.classifyFood({
      foodId: food.id,
    });

    let response = `🥗 **${food.description}** is **${classification.classification}**.\n\n`;
    response += `Health Score: ${(classification.score * 100).toFixed(0)}/100\n\n`;
    response += `**Key Points:**\n`;
    classification.explanation.forEach(exp => {
      response += `• ${exp}\n`;
    });
    response += `\n**Recommendations:**\n`;
    classification.recommendations.forEach(rec => {
      response += `• ${rec}\n`;
    });

    return response;
  }

  private static async handleDietQuery(message: string, context: ChatContext): Promise<string> {
    const foodName = this.extractFoodName(message);
    if (!foodName) {
      return "Which food would you like me to check for diet compatibility? For example: 'Is broccoli vegan?' or 'Is this keto-friendly?'";
    }

    const foods = await FoodRepository.findByDescription(foodName);
    if (foods.length === 0) {
      return `I couldn't find '${foodName}' in our database.`;
    }

    const food = foods[0];
    const dietClassification = await DietTypeClassificationService.classifyDietTypes({
      foodId: food.id,
    });

    let response = `🥗 **${food.description}**\n\n`;
    response += `✅ **Suitable For:** ${dietClassification.suitableDiets.join(", ") || "None"}\n`;
    response += `❌ **Not Suitable For:** ${dietClassification.unsuitableDiets.join(", ") || "None"}\n\n`;
    response += `**Detailed Analysis:**\n`;
    dietClassification.dietTypes.forEach(diet => {
      const icon = diet.score >= 0.5 ? "✅" : "❌";
      response += `${icon} ${diet.type}: ${diet.reason}\n`;
    });

    return response;
  }

  private static async handleRecommendationQuery(message: string, context: ChatContext): Promise<string> {
    const foodName = this.extractFoodName(message);
    if (!foodName) {
      return "Which food would you like alternatives for? For example: 'What's a substitute for salmon?' or 'What can I use instead of eggs?'";
    }

    const foods = await FoodRepository.findByDescription(foodName);
    if (foods.length === 0) {
      return `I couldn't find '${foodName}' in our database.`;
    }

    const recommendations = await RecommendationService.getRecommendations({
      foodId: foods[0].id,
      limit: 5,
    });

    let response = `🔄 **Alternatives to ${recommendations.originalFood.description}:**\n\n`;
    recommendations.recommendations.forEach((rec, idx) => {
      response += `${idx + 1}. **${rec.description}**\n`;
      response += `   Similarity: ${(rec.similarity * 100).toFixed(0)}%\n`;
      response += `   ${rec.reason}\n\n`;
    });

    return response;
  }

  private static async handlePersonalizedQuery(message: string, context: ChatContext): Promise<string> {
    // Extract goals from context or message
    const defaultGoals: any = context.userGoals || ["GENERAL_HEALTH"];
    const defaultRestrictions: any = context.dietRestrictions || [];
    const defaultActivityLevel = (context.activityLevel || "MODERATE") as any;

    const recommendations = await PersonalizedDietService.recommendPersonalizedDiet({
      goals: defaultGoals,
      restrictions: defaultRestrictions,
      activityLevel: defaultActivityLevel,
      limit: 8,
    });

    let response = `🎯 **Personalized Food Recommendations**\n\n`;
    recommendations.recommendations.forEach((rec, idx) => {
      response += `${idx + 1}. **${rec.description}**\n`;
      response += `   Match Score: ${(rec.score * 100).toFixed(0)}%\n`;
      if (rec.matchedGoals.length > 0) {
        response += `   Matches: ${rec.matchedGoals.join(", ")}\n`;
      }
      response += `   ${rec.explanation[0]}\n\n`;
    });

    return response;
  }

  private static async handleInformationQuery(message: string, context: ChatContext): Promise<string> {
    const foodName = this.extractFoodName(message);
    if (!foodName) {
      return "Which food would you like to know more about?";
    }

    const foods = await FoodRepository.findByDescription(foodName);
    if (foods.length === 0) {
      return `I couldn't find information about '${foodName}'.`;
    }

    const food = foods[0];
    let response = `📊 **Nutrition Facts for ${food.description}**\n\n`;
    response += `**Macronutrients:**\n`;
    response += `• Protein: ${food.protein || 0}g\n`;
    response += `• Carbohydrates: ${food.carbohydrate || 0}g\n`;
    response += `• Fat: ${food.totalLipid || 0}g\n`;
    response += `• Fiber: ${food.fiber || 0}g\n`;
    response += `• Sugar: ${food.sugarTotal || 0}g\n\n`;
    response += `**Key Minerals:**\n`;
    response += `• Calcium: ${food.calcium || 0}mg\n`;
    response += `• Iron: ${food.iron || 0}mg\n`;
    response += `• Sodium: ${food.sodium || 0}mg\n`;
    response += `• Potassium: ${food.potassium || 0}mg\n`;

    return response;
  }

  private static generateDefaultResponse(): string {
    return `👋 Hi! I'm your Food Analytics Chatbot. I can help you with:\n\n` +
           `• 🥗 **Health Analysis**: "Is chicken healthy?"\n` +
           `• 🎯 **Diet Compatibility**: "Is this keto-friendly?"\n` +
           `• 🔄 **Food Substitutes**: "What can I use instead of salmon?"\n` +
           `• 📊 **Nutrition Info**: "Tell me about broccoli's nutrition"\n` +
           `• 🎪 **Personalized Recommendations**: "What should I eat for muscle gain?"\n\n` +
           `What would you like to know?`;
  }

  private static extractFoodName(message: string): string | null {
    // Simple extraction - in production would use NLP
    const foodPatterns = [
      /(?:is|about|for|instead.*of|like|replace|substitute)\s+([\w\s]+)\s*[\?.]?$/i,
      /^([\w\s]+)\s+(?:is|for|about|health)/i,
      /(?:what|which).*?([a-zA-Z\s]+)(?:\?|$)/i,
    ];

    for (const pattern of foodPatterns) {
      const match = message.match(pattern);
      if (match && match[1]) {
        return match[1].trim().toLowerCase();
      }
    }

    return null;
  }
}
