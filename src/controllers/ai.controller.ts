import { Request, Response } from "express";
import { createChatService } from "../services/chatbot.service";

const chatService = createChatService();

export const chatController = {
  /**
   * Handle a chat request
   * @param req Express Request
   * @param res Express Response
   */
  async chat(req: Request, res: Response) {
    try {
      const { message, threadId } = req.body;

      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      let response;

      if (threadId) {
        // Continue existing conversation
        response = await chatService.continueConversation(message, threadId);
      } else {
        // Start new conversation
        response = await chatService.sendMessage(message);
      }

      return res.json({
        message: response.response,
        threadId: response.threadId,
      });
    } catch (error) {
      console.error("Chat error:", error);
      return res.status(500).json({ error: "Error processing chat request" });
    }
  },
};
