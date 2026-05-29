import prisma from "../../config/prisma";
import { UpdateProfileInput } from "../dtos/profile.dto";

// =====================================================================
// Profile Repository (Sprint 6)
// =====================================================================

export class ProfileRepository {
  static findByUserId(userId: number) {
    return prisma.userProfile.findUnique({ where: { userId } });
  }

  static getUserWithProfile(userId: number) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
      },
    });
  }

  static upsert(userId: number, data: UpdateProfileInput) {
    return prisma.userProfile.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
  }
}
