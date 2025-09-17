"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatController = void 0;
const chatbot_service_1 = require("../services/chatbot.service");
const logger_1 = __importDefault(require("../config/logger"));
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
            logger_1.default.error("Chat controller error", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
                requestBody: req.body,
                timestamp: new Date().toISOString()
            });
            return res.status(500).json({ error: "Error processing chat request" });
        }
    },
};
