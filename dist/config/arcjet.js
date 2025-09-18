import arcjet, { shield, detectBot } from "@arcjet/node";
import { config } from "./env.js";
// Set the ARCJET_ENV environment variable for proper development mode
if (config.nodeEnv === "development") {
    process.env.ARCJET_ENV = "development";
}
const aj = arcjet({
    key: config.arcjet.key,
    rules: [
        shield({ mode: config.arcjet.mode }),
        detectBot({
            mode: config.arcjet.mode,
            allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        // Removed default sliding window rule - rate limiting is now handled dynamically
        // in the security middleware based on user authentication status
    ],
});
export default aj;
