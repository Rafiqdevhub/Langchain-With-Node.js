"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCodeReviewService = createCodeReviewService;
const google_genai_1 = require("@langchain/google-genai");
const langgraph_1 = require("@langchain/langgraph");
const prompts_1 = require("@langchain/core/prompts");
const uuid_1 = require("uuid");
const env_1 = require("../config/env");
const path_1 = __importDefault(require("path"));
function createCodeReviewService() {
    const llm = new google_genai_1.ChatGoogleGenerativeAI({
        apiKey: env_1.config.googleApiKey,
        model: "gemini-2.0-flash",
        temperature: 0.3, // Lower temperature for more consistent code analysis
    });
    const codeReviewPrompt = prompts_1.ChatPromptTemplate.fromMessages([
        [
            "system",
            `You are an expert code reviewer and software engineer with deep knowledge of multiple programming languages, security best practices, and software design patterns.

Your task is to thoroughly analyze the provided code and return a structured JSON response with the following format:

{{
  "summary": "Brief overview of the code's purpose and overall assessment",
  "issues": [
    {{
      "type": "bug|warning|suggestion|security",
      "severity": "low|medium|high|critical",
      "line": number (if applicable),
      "description": "Detailed description of the issue",
      "suggestion": "How to fix or improve this issue"
    }}
  ],
  "suggestions": ["General improvement suggestions"],
  "securityConcerns": ["Security vulnerabilities or concerns"],
  "codeQuality": {{
    "readability": number (1-10),
    "maintainability": number (1-10),
    "complexity": "Low|Medium|High"
  }}
}}

Focus on:
- Potential bugs and logic errors
- Security vulnerabilities
- Performance issues
- Code maintainability and readability
- Best practices adherence
- Design patterns usage
- Error handling
- Code structure and organization

Be thorough but constructive in your feedback.`,
        ],
        ["placeholder", "{messages}"],
    ]);
    const callModel = async (state) => {
        const prompt = await codeReviewPrompt.invoke(state);
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
        async reviewCode(code, filename, threadId) {
            const config = {
                configurable: {
                    thread_id: threadId || (0, uuid_1.v4)(),
                },
            };
            const language = filename ? this.detectLanguage(filename) : "unknown";
            const reviewPrompt = `Please review the following ${language} code${filename ? ` from file "${filename}"` : ""}:

\`\`\`${language}
${code}
\`\`\`

Provide a comprehensive code review in the specified JSON format.`;
            const input = [
                {
                    role: "user",
                    content: reviewPrompt,
                },
            ];
            const output = await app.invoke({ messages: input }, config);
            const lastMessage = output.messages[output.messages.length - 1];
            try {
                // Parse the JSON response from the AI
                const contentStr = typeof lastMessage.content === "string"
                    ? lastMessage.content
                    : JSON.stringify(lastMessage.content);
                const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const reviewData = JSON.parse(jsonMatch[0]);
                    return {
                        ...reviewData,
                        threadId: config.configurable.thread_id,
                    };
                }
            }
            catch (error) {
                console.error("Error parsing AI response:", error);
            }
            // Fallback if JSON parsing fails
            const contentStr = typeof lastMessage.content === "string"
                ? lastMessage.content
                : JSON.stringify(lastMessage.content);
            return {
                summary: "Code review completed, but response format was unexpected.",
                issues: [],
                suggestions: [contentStr],
                securityConcerns: [],
                codeQuality: {
                    readability: 5,
                    maintainability: 5,
                    complexity: "Medium",
                },
                threadId: config.configurable.thread_id,
            };
        },
        async reviewMultipleFiles(files, threadId) {
            const config = {
                configurable: {
                    thread_id: threadId || (0, uuid_1.v4)(),
                },
            };
            const fileContents = files
                .map((file) => `File: ${file.filename} (${file.language || this.detectLanguage(file.filename)})
\`\`\`${file.language || this.detectLanguage(file.filename)}
${file.content}
\`\`\``)
                .join("\n\n");
            const reviewPrompt = `Please review the following code files as a cohesive project:

${fileContents}

Provide a comprehensive code review focusing on:
- Individual file issues
- Cross-file dependencies and interactions
- Overall project structure
- Consistency across files

Return your analysis in the specified JSON format.`;
            const input = [
                {
                    role: "user",
                    content: reviewPrompt,
                },
            ];
            const output = await app.invoke({ messages: input }, config);
            const lastMessage = output.messages[output.messages.length - 1];
            try {
                const contentStr = typeof lastMessage.content === "string"
                    ? lastMessage.content
                    : JSON.stringify(lastMessage.content);
                const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const reviewData = JSON.parse(jsonMatch[0]);
                    return {
                        ...reviewData,
                        threadId: config.configurable.thread_id,
                    };
                }
            }
            catch (error) {
                console.error("Error parsing AI response:", error);
            }
            const contentStr = typeof lastMessage.content === "string"
                ? lastMessage.content
                : JSON.stringify(lastMessage.content);
            return {
                summary: "Multi-file code review completed, but response format was unexpected.",
                issues: [],
                suggestions: [contentStr],
                securityConcerns: [],
                codeQuality: {
                    readability: 5,
                    maintainability: 5,
                    complexity: "Medium",
                },
                threadId: config.configurable.thread_id,
            };
        },
        detectLanguage(filename) {
            const ext = path_1.default.extname(filename).toLowerCase();
            const languageMap = {
                ".js": "javascript",
                ".jsx": "javascript",
                ".ts": "typescript",
                ".tsx": "typescript",
                ".py": "python",
                ".java": "java",
                ".c": "c",
                ".cpp": "cpp",
                ".h": "c",
                ".hpp": "cpp",
                ".cs": "csharp",
                ".php": "php",
                ".rb": "ruby",
                ".go": "go",
                ".rs": "rust",
                ".swift": "swift",
                ".kt": "kotlin",
                ".scala": "scala",
                ".r": "r",
                ".m": "objective-c",
                ".sh": "bash",
                ".ps1": "powershell",
                ".sql": "sql",
                ".html": "html",
                ".css": "css",
                ".scss": "scss",
                ".less": "less",
                ".json": "json",
                ".xml": "xml",
                ".yaml": "yaml",
                ".yml": "yaml",
                ".md": "markdown",
                ".dockerfile": "dockerfile",
                ".tf": "terraform",
                ".hcl": "hcl",
            };
            return languageMap[ext] || "text";
        },
    };
}
