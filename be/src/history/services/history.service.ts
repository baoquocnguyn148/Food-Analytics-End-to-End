import { HistoryRepository } from "../repositories/history.repository";
import { AppError } from "../../utils/AppError";

// =====================================================================
// History Service (Sprint 7)
// =====================================================================

const buildPagination = (total: number, page: number, limit: number) => ({
  page,
  limit,
  total,
  pages: Math.ceil(total / limit),
  hasNext: page * limit < total,
  hasPrev: page > 1,
});

export class HistoryService {
  static async getRecommendationHistory(userId: number, page: number, limit: number) {
    const { data, total } = await HistoryRepository.findRecommendationLogs(userId, page, limit);
    return { data, pagination: buildPagination(total, page, limit) };
  }

  static async getChatHistory(userId: number, page: number, limit: number) {
    const { data, total } = await HistoryRepository.findChatSessions(userId, page, limit);
    return { data, pagination: buildPagination(total, page, limit) };
  }

  static async getChatSession(userId: number, sessionId: number) {
    const session = await HistoryRepository.findChatSessionById(userId, sessionId);
    if (!session) {
      throw AppError.notFound("Chat session not found");
    }
    return session;
  }
}
