import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { START, END, MessagesAnnotation, StateGraph, MemorySaver, } from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/env.js";
export function createChatService() {
    const llm = new ChatGoogleGenerativeAI({
        apiKey: config.googleApiKey,
        model: "gemini-2.0-flash",
        temperature: 0.7,
    });
    const promptTemplate = ChatPromptTemplate.fromMessages([
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
    const workflow = new StateGraph(MessagesAnnotation)
        .addNode("model", callModel)
        .addEdge(START, "model")
        .addEdge("model", END);
    const memory = new MemorySaver();
    const app = workflow.compile({ checkpointer: memory });
    return {
        async sendMessage(message, threadId) {
            const config = {
                configurable: {
                    thread_id: threadId || uuidv4(),
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
