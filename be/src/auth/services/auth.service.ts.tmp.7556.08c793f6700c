import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AuthRepository } from "../repositories/auth.repository";
import { RegisterInput, LoginInput } from "../dtos/auth.dto";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  JwtPayload,
  Role,
} from "../../utils/jwt";
import { AppError } from "../../utils/AppError";
import config from "../../config/env";

// =====================================================================
// Auth Service - registration, login, refresh-token rotation (Sprint 5)
// =====================================================================

const BCRYPT_ROUNDS = 12;

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

// Parse "7d" / "15m" / "3600" into ms for computing DB expiry.
const durationToMs = (value: string): number => {
  const match = /^(\d+)([smhd])?$/.exec(value.trim());
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = Number(match[1]);
  const unit = match[2];
  const mult: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return unit ? n * mult[unit] : n * 1000;
};

const toPayload = (user: { id: number; email: string; role: Role }): JwtPayload => ({
  sub: user.id,
  email: user.email,
  role: user.role,
});

export class AuthService {
  private static async issueTokens(user: { id: number; email: string; role: Role }) {
    const payload = toPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const expiresAt = new Date(Date.now() + durationToMs(config.JWT_REFRESH_EXPIRES_IN));
    await AuthRepository.storeRefreshToken(user.id, hashToken(refreshToken), expiresAt);

    return {
      accessToken,
      refreshToken,
      tokenType: "Bearer",
      expiresIn: config.JWT_ACCESS_EXPIRES_IN,
    };
  }

  static async register(input: RegisterInput) {
    const existing = await AuthRepository.findUserByEmail(input.email);
    if (existing) {
      throw AppError.conflict("An account with this email already exists");
    }

    const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await AuthRepository.createUser({
      email: input.email,
      password,
      role: input.role as Role,
    });

    const tokens = await this.issueTokens(user);
    return {
      user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
      ...tokens,
    };
  }

  static async login(input: LoginInput) {
    const user = await AuthRepository.findUserByEmail(input.email);
    if (!user) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const ok = await bcrypt.compare(input.password, user.password);
    if (!ok) {
      throw AppError.unauthorized("Invalid email or password");
    }

    const tokens = await this.issueTokens(user);
    return {
      user: { id: user.id, email: user.email, role: user.role, createdAt: user.createdAt },
      ...tokens,
    };
  }

  static async refresh(refreshToken: string) {
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw AppError.unauthorized("Invalid or expired refresh token");
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await AuthRepository.findRefreshToken(tokenHash);
    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
      throw AppError.unauthorized("Refresh token is no longer valid");
    }

    // Rotate: revoke the used token before issuing a new pair.
    await AuthRepository.revokeRefreshToken(tokenHash);

    const user = await AuthRepository.findUserById(payload.sub);
    if (!user) {
      throw AppError.unauthorized("User no longer exists");
    }

    return this.issueTokens(user);
  }

  static async logout(refreshToken: string) {
    await AuthRepository.revokeRefreshToken(hashToken(refreshToken));
    return { success: true };
  }
}
