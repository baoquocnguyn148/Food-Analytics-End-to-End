import prisma from "../../config/prisma";

// =====================================================================
// History Repository (Sprint 7)
// =====================================================================

export class HistoryRepository {
  static async findRecommendationLogs(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.recommendationLog.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          food: { select: { id: true, description: true, category: true } },
        },
      }),
      prisma.recommendationLog.count({ where: { userId } }),
    ]);
    return { data, total };
  }

  static logRecommendation(userId: number, foodId: number, score: number) {
    return prisma.recommendationLog.create({ data: { userId, foodId, score } });
  }

  static async findChatSessions(userId: number, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      prisma.chatSession.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          messages: { orderBy: { createdAt: "asc" } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.chatSession.count({ where: { userId } }),
    ]);
    return { data, total };
  }

  static findChatSessionById(userId: number, sessionId: number) {
    return prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
  }
}
