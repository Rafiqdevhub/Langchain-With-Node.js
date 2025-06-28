"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatService = createChatService;
const google_genai_1 = require("@langchain/google-genai");
const langgraph_1 = require("@langchain/langgraph");
const prompts_1 = require("@langchain/core/prompts");
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
function createChatService() {
    const llm = new google_genai_1.ChatGoogleGenerativeAI({
        apiKey: env_1.config.googleApiKey,
        model: "gemini-2.0-flash",
        temperature: 0.7,
    });
    const promptTemplate = prompts_1.ChatPromptTemplate.fromMessages([
        [
            "system",
            "You are a helpful AI assistant. Answer all questions clearly and provide valuable information.",
        ],
        ["placeholder", "{messages}"],
    ]);
    const callModel = async (state) => {
        const prompt = await promptTemplate.invoke(state);
        const response = await llm.invoke(prompt);
        return { messages: [response] };
    };
    const workflow = new langgraph_1.StateGraph(langgraph_1.MessagesAnnotation)
        .addNode("model", callModel)
        .addEdge(langgraph_1.START, "model")
        .addEdge("model", langgraph_1.END);
    const memory = new langgraph_1.MemorySaver();
    const app = workflow.compile({ checkpointer: memory });
    return {
        async sendMessage(message, threadId) {
            const config = {
                configurable: {
                    thread_id: threadId || (0, uuid_1.v4)(),
                },
            };
            const input = [
                {
                    role: "user",
                    content: message,
                },
            ];
            const output = await app.invoke({ messages: input }, config);
            const lastMessage = output.messages[output.messages.length - 1];
            return {
                response: lastMessage.content,
                threadId: config.configurable.thread_id,
            };
        },
        /**
         * Continue a conversation with the chatbot
         * @param message The message to send to the chatbot
         * @param threadId The thread ID to continue the conversation
         * @returns The chatbot's response
         */
        async continueConversation(message, threadId) {
            if (!threadId) {
                throw new Error("Thread ID is required to continue a conversation");
            }
            const config = {
                configurable: {
                    thread_id: threadId,
                },
            };
            const input = [
                {
                    role: "user",
                    content: message,
                },
            ];
            const output = await app.invoke({ messages: input }, config);
            const lastMessage = output.messages[output.messages.length - 1];
            return {
                response: lastMessage.content,
                threadId: config.configurable.thread_id,
            };
        },
    };
}
