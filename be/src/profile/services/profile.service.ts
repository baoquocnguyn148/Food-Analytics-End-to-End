import { ProfileRepository } from "../repositories/profile.repository";
import { UpdateProfileInput } from "../dtos/profile.dto";
import { AppError } from "../../utils/AppError";

// =====================================================================
// Profile Service (Sprint 6)
// =====================================================================

export class ProfileService {
  static async getProfile(userId: number) {
    const user = await ProfileRepository.getUserWithProfile(userId);
    if (!user) {
      throw AppError.notFound("User not found");
    }
    return user;
  }

  static async updateProfile(userId: number, data: UpdateProfileInput) {
    const profile = await ProfileRepository.upsert(userId, data);
    return profile;
  }
}
