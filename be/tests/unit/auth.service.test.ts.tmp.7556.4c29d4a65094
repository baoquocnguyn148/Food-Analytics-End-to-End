import { AuthService } from "../../src/auth/services/auth.service";
import { AuthRepository } from "../../src/auth/repositories/auth.repository";
import { AppError } from "../../src/utils/AppError";

// Mock the repository so the service can be tested without a database.
jest.mock("../../src/auth/repositories/auth.repository");

const mockedRepo = AuthRepository as jest.Mocked<typeof AuthRepository>;

describe("AuthService", () => {
  describe("register", () => {
    it("creates a user and returns tokens", async () => {
      mockedRepo.findUserByEmail.mockResolvedValue(null);
      mockedRepo.createUser.mockResolvedValue({
        id: 1,
        email: "new@user.com",
        password: "hashed",
        role: "USER",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      mockedRepo.storeRefreshToken.mockResolvedValue({} as any);

      const result = await AuthService.register({
        email: "new@user.com",
        password: "password123",
        role: "USER",
      });

      expect(result.user.email).toBe("new@user.com");
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(mockedRepo.createUser).toHaveBeenCalledTimes(1);
    });

    it("rejects a duplicate email with 409", async () => {
      mockedRepo.findUserByEmail.mockResolvedValue({ id: 1 } as any);

      await expect(
        AuthService.register({ email: "dup@user.com", password: "password123", role: "USER" })
      ).rejects.toMatchObject({ status: 409 });
    });
  });

  describe("login", () => {
    it("rejects an unknown email with 401", async () => {
      mockedRepo.findUserByEmail.mockResolvedValue(null);
      await expect(
        AuthService.login({ email: "missing@user.com", password: "x" })
      ).rejects.toBeInstanceOf(AppError);
    });
  });
});
