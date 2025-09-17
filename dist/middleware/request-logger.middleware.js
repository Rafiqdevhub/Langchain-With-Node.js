"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const requestLogger = (req, res, next) => {
    const start = Date.now();
    // Log incoming request
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);
    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function (chunk, encoding) {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        return originalEnd(chunk, encoding);
    };
    next();
};
exports.requestLogger = requestLogger;
