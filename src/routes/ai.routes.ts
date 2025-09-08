import { Router } from "express";
import { chatController } from "../controllers/ai.controller";
import { codeReviewController } from "../controllers/code-review.controller";
import { uploadMiddleware } from "../middleware/upload.middleware";

const router = Router();

router.post("/chat", (req, res, next) => {
  Promise.resolve(chatController.chat(req, res)).catch(next);
});
router.post("/review-text", (req, res, next) => {
  Promise.resolve(codeReviewController.reviewText(req, res)).catch(next);
});
router.post(
  "/review-files",
  uploadMiddleware.array("files", 10),
  (req, res, next) => {
    Promise.resolve(codeReviewController.reviewFiles(req, res)).catch(next);
  }
);
router.get("/languages", (req, res, next) => {
  Promise.resolve(codeReviewController.getSupportedLanguages(req, res)).catch(
    next
  );
});
router.get("/guidelines", (req, res, next) => {
  Promise.resolve(codeReviewController.getGuidelines(req, res)).catch(next);
});

export default router;
