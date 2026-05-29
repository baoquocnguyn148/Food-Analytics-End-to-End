import jwt, { SignOptions } from "jsonwebtoken";
import config from "../config/env";

// =====================================================================
// JWT helpers - Access + Refresh tokens (Sprint 5 - Security)
// =====================================================================

export type Role = "USER" | "ADMIN";

export interface JwtPayload {
  sub: number; // user id
  email: string;
  role: Role;
}

export const signAccessToken = (payload: JwtPayload): string => {
  const opts: SignOptions = {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.JWT_SECRET, opts);
};

export const signRefreshToken = (payload: JwtPayload): string => {
  const opts: SignOptions = {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, config.JWT_REFRESH_SECRET, opts);
};

export const verifyAccessToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.JWT_SECRET) as unknown as JwtPayload;
};

export const verifyRefreshToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.JWT_REFRESH_SECRET) as unknown as JwtPayload;
};
