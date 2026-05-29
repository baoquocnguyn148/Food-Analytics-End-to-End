import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import config from "./env";

// =====================================================================
// OpenAPI / Swagger spec (Sprint 8 - P1)
// JSDoc @openapi annotations live next to each route file.
// =====================================================================

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Food Analytics Platform API",
      version: "1.0.0",
      description:
        "REST API for the Food Analytics Platform: foods, ML classification & recommendations, chatbot, analytics, authentication, user profiles and history.",
    },
    servers: [{ url: `http://localhost:${config.PORT}`, description: "Local" }],
    tags: [
      { name: "Auth", description: "Authentication & token management" },
      { name: "Profile", description: "User profile" },
      { name: "History", description: "Recommendation & chat history" },
      { name: "Foods", description: "Food catalogue" },
      { name: "ML", description: "Machine learning modules" },
      { name: "Chatbot", description: "Conversational assistant" },
      { name: "Analytics", description: "Aggregated nutrition analytics" },
      { name: "Health", description: "Health & readiness probes" },
      { name: "Monitoring", description: "Metrics" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            role: { type: "string", enum: ["USER", "ADMIN"] },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        RefreshRequest: {
          type: "object",
          required: ["refreshToken"],
          properties: { refreshToken: { type: "string" } },
        },
        UpdateProfileRequest: {
          type: "object",
          properties: {
            age: { type: "integer" },
            gender: { type: "string", enum: ["MALE", "FEMALE", "OTHER"] },
            weight: { type: "number" },
            height: { type: "number" },
            activityLevel: {
              type: "string",
              enum: ["SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"],
            },
            goal: { type: "string" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: {
              type: "object",
              properties: {
                user: { type: "object" },
                accessToken: { type: "string" },
                refreshToken: { type: "string" },
                tokenType: { type: "string", example: "Bearer" },
                expiresIn: { type: "string", example: "15m" },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: {
                status: { type: "integer" },
                code: { type: "string" },
                message: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  // Glob over compiled (.js) and source (.ts) route files.
  apis: [
    path.join(__dirname, "../**/*.route.{ts,js}"),
    path.join(__dirname, "../**/routes/*.{ts,js}"),
  ],
};

export const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
