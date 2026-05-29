import request from "supertest";
import app from "../../src/app";

// These integration tests exercise the HTTP layer without requiring a
// live database (validation + static routes run before any DB call).

describe("App integration", () => {
  it("GET / returns the API index", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.endpoints).toBeDefined();
  });

  it("GET /health is live", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("GET /swagger.json serves an OpenAPI document", async () => {
    const res = await request(app).get("/swagger.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBeDefined();
    expect(res.body.paths["/auth/login"]).toBeDefined();
  });

  it("GET /metrics returns a snapshot", async () => {
    const res = await request(app).get("/metrics");
    expect(res.status).toBe(200);
    expect(res.body.data.totalRequests).toBeGreaterThanOrEqual(0);
  });

  it("unknown route returns 404 envelope", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("POST /api/auth/register rejects invalid body with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "not-an-email", password: "short" });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("BAD_REQUEST");
  });

  it("GET /api/profile without token returns 401", async () => {
    const res = await request(app).get("/api/profile");
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe("UNAUTHORIZED");
  });
});
