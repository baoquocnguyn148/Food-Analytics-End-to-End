import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  JwtPayload,
} from "../../src/utils/jwt";

describe("jwt utils", () => {
  const payload: JwtPayload = { sub: 1, email: "a@b.com", role: "USER" };

  it("signs and verifies an access token round-trip", () => {
    const token = signAccessToken(payload);
    expect(typeof token).toBe("string");
    const decoded = verifyAccessToken(token);
    expect(decoded.sub).toBe(1);
    expect(decoded.email).toBe("a@b.com");
    expect(decoded.role).toBe("USER");
  });

  it("signs and verifies a refresh token round-trip", () => {
    const token = signRefreshToken(payload);
    const decoded = verifyRefreshToken(token);
    expect(decoded.sub).toBe(1);
  });

  it("rejects a tampered token", () => {
    const token = signAccessToken(payload);
    expect(() => verifyAccessToken(token + "x")).toThrow();
  });
});
