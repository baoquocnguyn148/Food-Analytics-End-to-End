import { Request, Response, NextFunction } from "express";
import { HistoryService } from "../services/history.service";
import { HistoryPaginationDto } from "../dtos/history.dto";
import { AppError } from "../../utils/AppError";

// =====================================================================
// History Controller (Sprint 7) - requires authenticate middleware
// =====================================================================

export const getRecommendationHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parsed = HistoryPaginationDto.safeParse(req.query);
    if (!parsed.success) {
      throw AppError.badRequest("Validation failed", parsed.error.issues);
    }
    const { page, limit } = parsed.data;
    const result = await HistoryService.getRecommendationHistory(req.user!.id, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = HistoryPaginationDto.safeParse(req.query);
    if (!parsed.success) {
      throw AppError.badRequest("Validation failed", parsed.error.issues);
    }
    const { page, limit } = parsed.data;
    const result = await HistoryService.getChatHistory(req.user!.id, page, limit);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

export const getChatSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sessionId = Number(req.params.id);
    if (!Number.isInteger(sessionId)) {
      throw AppError.badRequest("Invalid session id");
    }
    const result = await HistoryService.getChatSession(req.user!.id, sessionId);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
