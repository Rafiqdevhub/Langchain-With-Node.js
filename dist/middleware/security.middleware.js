import { slidingWindow } from "@arcjet/node";
import aj from "../config/arcjet.js";
const securityMiddleware = async (req, res, next) => {
    try {
        const role = req.user?.role || "guest";
        // Enhanced rate limiting based on user authentication status
        let limit;
        let interval;
        switch (role) {
            case "user":
                limit = 100; // 100 requests per day for authenticated users
                interval = "1d";
                break;
            case "guest":
                limit = 10; // 10 requests per IP address per day for guests
                interval = "1d";
                break;
            default:
                limit = 10; // Default to guest limits
                interval = "1d";
                break;
        }
        // Create client with dynamic rate limiting
        const client = aj.withRule(slidingWindow({
            mode: "LIVE",
            interval: interval,
            max: limit,
        }));
        const decision = await client.protect(req);
        if (decision.isDenied() && decision.reason.isBot()) {
            console.log(`[${new Date().toISOString()}] Bot request blocked - IP: ${req.ip}, Path: ${req.path}, Role: ${role}`);
            res.status(403).json({
                error: "Forbidden",
                message: "Automated requests are not allowed",
            });
            return;
        }
        if (decision.isDenied() && decision.reason.isShield()) {
            console.log(`[${new Date().toISOString()}] Shield blocked request - IP: ${req.ip}, Path: ${req.path}, Method: ${req.method}, Role: ${role}`);
            res.status(403).json({
                error: "Forbidden",
                message: "Request blocked by security policy",
            });
            return;
        }
        if (decision.isDenied() && decision.reason.isRateLimit()) {
            console.log(`[${new Date().toISOString()}] Rate limit exceeded - IP: ${req.ip}, Path: ${req.path}, Role: ${role}, Limit: ${limit}/${interval}`);
            const limitDescription = role === "guest"
                ? `${limit} requests per day per IP address`
                : `${limit} requests per day`;
            res.status(429).json({
                error: "Too Many Requests",
                message: `Rate limit exceeded. Limit: ${limitDescription}. ${role === "guest"
                    ? "Consider registering for higher limits."
                    : "Please try again tomorrow."}`,
                retryAfter: 86400, // 24 hours in seconds
            });
            return;
        }
        next();
    }
    catch (e) {
        console.error(`[${new Date().toISOString()}] Arcjet middleware error:`, e instanceof Error ? e.message : String(e));
        res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong with security middleware",
        });
    }
};
export default securityMiddleware;
