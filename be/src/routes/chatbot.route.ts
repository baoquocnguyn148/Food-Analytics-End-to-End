import { Router } from "express";
import { askChatbot } from "../controllers/chatbot.controller";

const router = Router();

// POST /api/chatbot/ask
// Handles conversational queries integrated with all ML modules
router.post("/ask", askChatbot);

export default router;
