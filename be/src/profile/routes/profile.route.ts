import { Router } from "express";
import * as ProfileController from "../controllers/profile.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// All profile routes require a valid access token.
router.use(authenticate);

/**
 * @openapi
 * /profile:
 *   get:
 *     tags: [Profile]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User and profile data
 *       401:
 *         description: Unauthorized
 */
router.get("/", ProfileController.getProfile);

/**
 * @openapi
 * /profile:
 *   put:
 *     tags: [Profile]
 *     summary: Create or update the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *           example:
 *             age: 28
 *             gender: FEMALE
 *             weight: 62.5
 *             height: 168
 *             activityLevel: ACTIVE
 *             goal: WEIGHTLOSS
 *     responses:
 *       200:
 *         description: Updated profile
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put("/", ProfileController.updateProfile);

export default router;
