import { Request, Response, NextFunction } from "express";

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${
      req.path
    } - ${res.statusCode} - ${duration}ms`;

    if (res.statusCode >= 400) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  });

  next();
};

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[API] ${req.method} ${req.path} - ${req.ip}`);
  next();
};
