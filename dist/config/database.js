"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = exports.db = void 0;
require("dotenv/config");
const serverless_1 = require("@neondatabase/serverless");
const neon_http_1 = require("drizzle-orm/neon-http");
if (process.env.NODE_ENV === "development") {
    serverless_1.neonConfig.fetchEndpoint = "http://neon-local:5432/sql";
    serverless_1.neonConfig.useSecureWebSocket = false;
    serverless_1.neonConfig.poolQueryViaFetch = true;
}
const sql = (0, serverless_1.neon)(process.env.DATABASE_URL || "");
exports.sql = sql;
const db = (0, neon_http_1.drizzle)(sql);
exports.db = db;
