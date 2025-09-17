"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const chatbot_service_1 = require("../services/chatbot.service");
const chatService = (0, chatbot_service_1.createChatService)();
exports.chatController = {
    async chat(req, res) {
        try {
            if (!req.body) {
                return res.status(400).json({
                    error: "Request body is missing",
                    message: "Make sure to send JSON data with Content-Type: application/json header",
                });
            }
            const { message, threadId } = req.body;
            if (!message) {
                return res.status(400).json({
                    error: "Message is required",
                    message: "Please provide a 'message' field in the request body",
                });
            }
            let response;
            if (threadId) {
                response = await chatService.continueConversation(message, threadId);
            }
            else {
                response = await chatService.sendMessage(message);
            }
            return res.json({
                message: response.response,
                threadId: response.threadId,
            });
        }
        catch (error) {
            return res.status(500).json({ error: "Error processing chat request" });
        }
    },
};
