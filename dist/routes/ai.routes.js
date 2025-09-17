"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const code_review_controller_1 = require("../controllers/code-review.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
router.post("/chat", (req, res, next) => {
    Promise.resolve(ai_controller_1.chatController.chat(req, res)).catch(next);
});
router.post("/review-text", (req, res, next) => {
    Promise.resolve(code_review_controller_1.codeReviewController.reviewText(req, res)).catch(next);
});
router.post("/review-files", upload_middleware_1.uploadMiddleware.array("files", 10), (req, res, next) => {
    Promise.resolve(code_review_controller_1.codeReviewController.reviewFiles(req, res)).catch(next);
});
router.get("/languages", (req, res, next) => {
    Promise.resolve(code_review_controller_1.codeReviewController.getSupportedLanguages(req, res)).catch(next);
});
router.get("/guidelines", (req, res, next) => {
    Promise.resolve(code_review_controller_1.codeReviewController.getGuidelines(req, res)).catch(next);
});
exports.default = router;
