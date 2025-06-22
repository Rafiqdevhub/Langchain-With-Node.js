import { Router } from "express";
import { chatController } from "../controllers/ai.controller";

const router = Router();

/**
 * @route POST /api/ai/chat
 * @description Send a message to the AI chatbot
 * @body {string} message - The message to send to the AI
 * @body {string} threadId - Optional thread ID for continuing a conversation
 * @returns {Object} message - AI response and threadId for conversation tracking
 */
router.post("/chat", (req, res, next) => {
  Promise.resolve(chatController.chat(req, res)).catch(next);
});

export default router;
