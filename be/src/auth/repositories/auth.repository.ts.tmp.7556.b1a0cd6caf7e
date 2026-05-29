import prisma from "../../config/prisma";
import { Role } from "@prisma/client";

// =====================================================================
// Auth Repository - User + RefreshToken data access (Sprint 5)
// =====================================================================

export class AuthRepository {
  static findUserByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  static findUserById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  static createUser(data: { email: string; password: string; role: Role }) {
    // Create the user together with an empty profile shell.
    return prisma.user.create({
      data: {
        email: data.email,
        password: data.password,
        role: data.role,
        profile: { create: {} },
      },
    });
  }

  // --- Refresh tokens (hashed, rotatable, revocable) ---

  static storeRefreshToken(userId: number, tokenHash: string, expiresAt: Date) {
    return prisma.refreshToken.create({
      data: { userId, tokenHash, expiresAt },
    });
  }

  static findRefreshToken(tokenHash: string) {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  }

  static revokeRefreshToken(tokenHash: string) {
    return prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revoked: true },
    });
  }

  static revokeAllForUser(userId: number) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  }
}
