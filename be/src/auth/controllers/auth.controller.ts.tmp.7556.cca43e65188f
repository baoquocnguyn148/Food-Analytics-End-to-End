import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { RegisterDto, LoginDto, RefreshDto } from "../dtos/auth.dto";
import { AppError } from "../../utils/AppError";

// =====================================================================
// Auth Controller (Sprint 5)
// =====================================================================

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RegisterDto.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("Validation failed", parsed.error.issues);
    }
    const result = await AuthService.register(parsed.data);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = LoginDto.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("Validation failed", parsed.error.issues);
    }
    const result = await AuthService.login(parsed.data);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RefreshDto.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("Validation failed", parsed.error.issues);
    }
    const result = await AuthService.refresh(parsed.data.refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = RefreshDto.safeParse(req.body);
    if (!parsed.success) {
      throw AppError.badRequest("Validation failed", parsed.error.issues);
    }
    const result = await AuthService.logout(parsed.data.refreshToken);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response) => {
  res.json({ success: true, data: req.user });
};
