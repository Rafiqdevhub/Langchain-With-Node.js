const securityMiddleware = async (req, res, next) => {
    try {
        // Arcjet was removed; keep middleware contract and continue request flow.
        next();
    }
    catch (e) {
        console.error(`[${new Date().toISOString()}] Security middleware error:`, e instanceof Error ? e.message : String(e));
        res.status(500).json({
            error: "Internal server error",
            message: "Something went wrong with security middleware",
        });
    }
};
export default securityMiddleware;
