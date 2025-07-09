import { Request, Response, NextFunction } from "express";
import { createError } from "./errorHandler";

export interface ValidationRule {
  field: string;
  required?: boolean;
  type?: "string" | "array" | "object";
  validator?: (value: any) => boolean;
  message?: string;
}

export const validateRequest = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const body = req.body;

    for (const rule of rules) {
      const value = body[rule.field];

      // 检查必填字段
      if (
        rule.required &&
        (value === undefined || value === null || value === "")
      ) {
        return next(
          createError(rule.message || `${rule.field} 是必填字段`, 400)
        );
      }

      // 检查类型
      if (value !== undefined && rule.type) {
        if (rule.type === "string" && typeof value !== "string") {
          return next(
            createError(rule.message || `${rule.field} 必须是字符串`, 400)
          );
        }
        if (rule.type === "array" && !Array.isArray(value)) {
          return next(
            createError(rule.message || `${rule.field} 必须是数组`, 400)
          );
        }
        if (rule.type === "object" && typeof value !== "object") {
          return next(
            createError(rule.message || `${rule.field} 必须是对象`, 400)
          );
        }
      }

      // 自定义验证器
      if (value !== undefined && rule.validator && !rule.validator(value)) {
        return next(createError(rule.message || `${rule.field} 验证失败`, 400));
      }
    }

    next();
  };
};

// 预定义的验证规则
export const sitemapValidation = validateRequest([
  {
    field: "urls",
    required: true,
    type: "array",
    message: "urls 必须为非空数组",
  },
]);

export const autoSitemapValidation = validateRequest([
  { field: "url", required: true, type: "string", message: "url 必须为字符串" },
]);

export const localSitemapValidation = validateRequest([
  {
    field: "dirPath",
    required: true,
    type: "string",
    message: "dirPath 必须提供",
  },
  {
    field: "baseUrl",
    required: true,
    type: "string",
    message: "baseUrl 必须提供",
  },
]);

export const taskValidation = validateRequest([
  {
    field: "type",
    required: true,
    type: "string",
    validator: (value) => ["auto", "manual", "local"].includes(value),
    message: "type 必须为 auto/manual/local",
  },
  {
    field: "params",
    required: true,
    type: "object",
    message: "params 必须提供",
  },
]);
