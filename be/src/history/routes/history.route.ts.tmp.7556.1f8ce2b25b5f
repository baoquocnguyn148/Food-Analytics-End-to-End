import { Router } from "express";
import * as HistoryController from "../controllers/history.controller";
import { authenticate } from "../../middleware/auth.middleware";

// Mounted at /api — defines the full sub-paths to match the spec
// (GET /recommendations/history, GET /chat/history).
const router = Router();

router.use(authenticate);

/**
 * @openapi
 * /recommendations/history:
 *   get:
 *     tags: [History]
 *     summary: Paginated recommendation history for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Recommendation logs with food details
 *       401:
 *         description: Unauthorized
 */
router.get("/recommendations/history", HistoryController.getRecommendationHistory);

/**
 * @openapi
 * /chat/history:
 *   get:
 *     tags: [History]
 *     summary: Paginated chat session history for the current user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Chat sessions with messages
 *       401:
 *         description: Unauthorized
 */
router.get("/chat/history", HistoryController.getChatHistory);

/**
 * @openapi
 * /chat/history/{id}:
 *   get:
 *     tags: [History]
 *     summary: A single chat session with all messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Chat session detail
 *       404:
 *         description: Session not found
 */
router.get("/chat/history/:id", HistoryController.getChatSession);

export default router;
