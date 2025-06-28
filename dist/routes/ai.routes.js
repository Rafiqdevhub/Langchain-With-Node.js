"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const code_review_controller_1 = require("../controllers/code-review.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
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
/**
 * @route POST /api/ai/review-text
 * @description Review code submitted as text
 * @body {string} code - The code to review
 * @body {string} filename - Optional filename for language detection
 * @body {string} threadId - Optional thread ID for conversation continuity
 * @returns {Object} Detailed code review analysis
 */
router.post("/review-text", (req, res, next) => {
    Promise.resolve(code_review_controller_1.codeReviewController.reviewText(req, res)).catch(next);
});
/**
 * @route POST /api/ai/review-files
 * @description Review uploaded code files
 * @body {File[]} files - Code files to review (multipart/form-data)
 * @body {string} threadId - Optional thread ID for conversation continuity
 * @returns {Object} Detailed code review analysis for all files
 */
router.post("/review-files", upload_middleware_1.uploadMiddleware.array("files", 10), (req, res, next) => {
    Promise.resolve(code_review_controller_1.codeReviewController.reviewFiles(req, res)).catch(next);
});
/**
 * @route GET /api/ai/languages
 * @description Get supported programming languages and file types
 * @returns {Object} List of supported languages and file extensions
 */
router.get("/languages", (req, res, next) => {
    Promise.resolve(code_review_controller_1.codeReviewController.getSupportedLanguages(req, res)).catch(next);
});
/**
 * @route GET /api/ai/guidelines
 * @description Get code review guidelines and best practices
 * @returns {Object} Code review criteria and guidelines
 */
router.get("/guidelines", (req, res, next) => {
    Promise.resolve(code_review_controller_1.codeReviewController.getGuidelines(req, res)).catch(next);
});
exports.default = router;
