import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const start = Date.now();
  const path = req.originalUrl || req.url;

  // Log incoming request
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${path} - ${req.ip}`,
  );

  // Override res.end to log response
  const originalEnd = res.end.bind(res);
  res.end = function (chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start;

    console.log(
      `[${new Date().toISOString()}] ${req.method} ${path} - ${
        res.statusCode
      } (${duration}ms)`,
    );

    return originalEnd(chunk, encoding);
  };

  next();
};
