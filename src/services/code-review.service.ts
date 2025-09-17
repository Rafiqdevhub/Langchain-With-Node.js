import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  START,
  END,
  MessagesAnnotation,
  StateGraph,
  MemorySaver,
} from "@langchain/langgraph";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config/env.js";
import path from "path";

export interface CodeReviewFile {
  filename: string;
  content: string;
  language?: string;
}

export interface CodeReviewResult {
  summary: string;
  issues: CodeIssue[];
  suggestions: string[];
  securityConcerns: string[];
  codeQuality: {
    readability: number; // 1-10 scale
    maintainability: number; // 1-10 scale
    complexity: string; // Low, Medium, High
  };
  threadId: string;
}

export interface CodeIssue {
  type: "bug" | "warning" | "suggestion" | "security";
  severity: "low" | "medium" | "high" | "critical";
  line?: number;
  description: string;
  suggestion?: string;
}

export function createCodeReviewService() {
  const llm = new ChatGoogleGenerativeAI({
    apiKey: config.googleApiKey,
    model: "gemini-2.0-flash",
    temperature: 0.3, // Lower temperature for more consistent code analysis
  });

  const codeReviewPrompt = ChatPromptTemplate.fromMessages([
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

  const callModel = async (state: typeof MessagesAnnotation.State) => {
    const prompt = await codeReviewPrompt.invoke(state);
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
    async reviewCode(
      code: string,
      filename?: string,
      threadId?: string
    ): Promise<CodeReviewResult> {
      const config = {
        configurable: {
          thread_id: threadId || uuidv4(),
        },
      };

      const language = filename ? this.detectLanguage(filename) : "unknown";

      const reviewPrompt = `Please review the following ${language} code${
        filename ? ` from file "${filename}"` : ""
      }:

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
        const contentStr =
          typeof lastMessage.content === "string"
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
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Error parsing AI response in single file review:`,
          error instanceof Error ? error.message : String(error)
        );
      }

      // Fallback if JSON parsing fails
      const contentStr =
        typeof lastMessage.content === "string"
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

    async reviewMultipleFiles(
      files: CodeReviewFile[],
      threadId?: string
    ): Promise<CodeReviewResult> {
      const config = {
        configurable: {
          thread_id: threadId || uuidv4(),
        },
      };

      const fileContents = files
        .map(
          (file) =>
            `File: ${file.filename} (${
              file.language || this.detectLanguage(file.filename)
            })
\`\`\`${file.language || this.detectLanguage(file.filename)}
${file.content}
\`\`\``
        )
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
        const contentStr =
          typeof lastMessage.content === "string"
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
      } catch (error) {
        console.error(
          `[${new Date().toISOString()}] Error parsing AI response in multi-file review:`,
          error instanceof Error ? error.message : String(error)
        );
      }

      const contentStr =
        typeof lastMessage.content === "string"
          ? lastMessage.content
          : JSON.stringify(lastMessage.content);
      return {
        summary:
          "Multi-file code review completed, but response format was unexpected.",
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

    detectLanguage(filename: string): string {
      const ext = path.extname(filename).toLowerCase();
      const languageMap: Record<string, string> = {
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
