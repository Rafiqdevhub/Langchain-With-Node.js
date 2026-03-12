import { Request, Response, NextFunction } from "express";

interface User {
  id?: number;
  email?: string;
  name?: string;
  role?: "user" | "guest";
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

interface ErrorResponse {
  error: string;
  message: string;
}

const securityMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Keep middleware contract and continue request flow.
    next();
  } catch (e: unknown) {
    console.error(
      `[${new Date().toISOString()}] Security middleware error:`,
      e instanceof Error ? e.message : String(e),
    );
    res.status(500).json({
      error: "Internal server error",
      message: "Something went wrong with security middleware",
    } as ErrorResponse);
  }
};
export default securityMiddleware;
