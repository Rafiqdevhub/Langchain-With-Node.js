"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const router = (0, express_1.Router)();
/**
 * @route POST /api/ai/chat
 * @description Send a message to the AI chatbot
 * @body {string} message - The message to send to the AI
 * @body {string} threadId - Optional thread ID for continuing a conversation
 * @returns {Object} message - AI response and threadId for conversation tracking
 */
router.post("/chat", (req, res, next) => {
    Promise.resolve(ai_controller_1.chatController.chat(req, res)).catch(next);
});
exports.default = router;
