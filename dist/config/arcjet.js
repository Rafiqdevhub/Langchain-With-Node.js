import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { config } from "./env";
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
        slidingWindow({
            mode: config.arcjet.mode,
            interval: "2s",
            max: 5,
        }),
    ],
});
export default aj;
