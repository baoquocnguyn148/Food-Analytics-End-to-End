import { Request, Response, NextFunction } from "express";
import { ProfileService } from "../services/profile.service";
import { UpdateProfileDto } from "../dtos/profile.dto";
import { AppError } from "../../utils/AppError";

// =====================================================================
// Profile Controller (Sprint 6) - requires authenticate middleware
// =====================================================================

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await ProfileService.getProfile(req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = UpdateProfileDto.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("Validation failed", parsed.error.issues);
    }
    const result = await ProfileService.updateProfile(req.user!.id, parsed.data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};
