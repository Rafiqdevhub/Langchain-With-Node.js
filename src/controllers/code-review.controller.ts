import { Request, Response } from "express";
import {
  createCodeReviewService,
  CodeReviewFile,
} from "../services/code-review.service";
import { SUPPORTED_EXTENSIONS } from "../middleware/upload.middleware";

const codeReviewService = createCodeReviewService();

export const codeReviewController = {
  /**
   * Review code submitted as text
   */
  async reviewText(req: Request, res: Response) {
    try {
      const { code, filename, threadId } = req.body;

      if (!code) {
        return res.status(400).json({
          error: "Validation Error",
          message: "Code content is required",
        });
      }

      const result = await codeReviewService.reviewCode(
        code,
        filename,
        threadId
      );

      return res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("Code review error:", error);
      return res.status(500).json({
        error: "Code Review Error",
        message: "Error processing code review request",
      });
    }
  },

  /**
   * Review uploaded code files
   */
  async reviewFiles(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      const { threadId } = req.body;

      if (!files || files.length === 0) {
        return res.status(400).json({
          error: "Validation Error",
          message: "At least one file is required",
        });
      }

      // Convert uploaded files to CodeReviewFile format
      const codeFiles: CodeReviewFile[] = files.map((file) => ({
        filename: file.originalname,
        content: file.buffer.toString("utf8"),
        language: codeReviewService.detectLanguage(file.originalname),
      }));

      let result;
      if (codeFiles.length === 1) {
        // Single file review
        const file = codeFiles[0];
        result = await codeReviewService.reviewCode(
          file.content,
          file.filename,
          threadId
        );
      } else {
        // Multiple files review
        result = await codeReviewService.reviewMultipleFiles(
          codeFiles,
          threadId
        );
      }

      return res.json({
        success: true,
        data: {
          ...result,
          filesAnalyzed: codeFiles.map((f) => ({
            filename: f.filename,
            language: f.language,
            size: f.content.length,
          })),
        },
      });
    } catch (error) {
      console.error("File review error:", error);
      return res.status(500).json({
        error: "File Review Error",
        message: "Error processing file review request",
      });
    }
  },

  /**
   * Get supported programming languages and file types
   */
  async getSupportedLanguages(req: Request, res: Response) {
    try {
      const languageInfo = SUPPORTED_EXTENSIONS.map((ext) => ({
        extension: ext,
        language: codeReviewService.detectLanguage(`example${ext}`),
      }));

      return res.json({
        success: true,
        data: {
          supportedExtensions: SUPPORTED_EXTENSIONS,
          languages: languageInfo,
          maxFileSize: "5MB",
          maxFiles: 10,
        },
      });
    } catch (error) {
      console.error("Error getting supported languages:", error);
      return res.status(500).json({
        error: "Server Error",
        message: "Error retrieving supported languages",
      });
    }
  },

  /**
   * Get code review guidelines and best practices
   */
  async getGuidelines(req: Request, res: Response) {
    try {
      return res.json({
        success: true,
        data: {
          reviewCriteria: [
            "Potential bugs and logic errors",
            "Security vulnerabilities",
            "Performance issues",
            "Code maintainability and readability",
            "Best practices adherence",
            "Design patterns usage",
            "Error handling",
            "Code structure and organization",
          ],
          severityLevels: {
            critical: "Critical issues that must be fixed immediately",
            high: "Important issues that should be addressed soon",
            medium: "Issues that should be considered for improvement",
            low: "Minor suggestions for enhancement",
          },
          issueTypes: {
            bug: "Potential runtime errors or logic mistakes",
            warning: "Code that might cause issues",
            suggestion: "Recommendations for improvement",
            security: "Security vulnerabilities or concerns",
          },
          tips: [
            "Provide clear, descriptive variable and function names",
            "Include comprehensive error handling",
            "Add comments for complex logic",
            "Follow language-specific conventions",
            "Keep functions small and focused",
            "Validate user inputs",
            "Use consistent code formatting",
          ],
        },
      });
    } catch (error) {
      console.error("Error getting guidelines:", error);
      return res.status(500).json({
        error: "Server Error",
        message: "Error retrieving guidelines",
      });
    }
  },
};
