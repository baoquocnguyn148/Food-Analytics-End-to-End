import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { authenticate } from "../../middleware/auth.middleware";
import { authLimiter } from "../../middleware/rateLimiter";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: jane@example.com
 *             password: Sup3rSecret!
 *     responses:
 *       201:
 *         description: User created and tokens issued
 *       409:
 *         description: Email already registered
 */
router.post("/register", authLimiter, AuthController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate and receive access + refresh tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: jane@example.com
 *             password: Sup3rSecret!
 *     responses:
 *       200:
 *         description: Tokens issued
 *       401:
 *         description: Invalid credentials
 */
router.post("/login", authLimiter, AuthController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Exchange a refresh token for a new token pair (rotation)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: New token pair issued
 *       401:
 *         description: Refresh token invalid / revoked / expired
 */
router.post("/refresh", AuthController.refresh);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke a refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshRequest'
 *     responses:
 *       200:
 *         description: Token revoked
 */
router.post("/logout", AuthController.logout);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Return the authenticated user from the access token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticate, AuthController.me);

export default router;
