import { Request, Response, NextFunction } from "express";
import { TaskService } from "../services/TaskService";
import { createError } from "../middleware/errorHandler";

export class TaskController {
  private taskService: TaskService;

  constructor() {
    this.taskService = new TaskService();
  }

  // 提交任务
  async submitTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { type, params } = req.body;
      const task = await this.taskService.submitTask(type, params);

      res.json({
        taskId: task.id,
        message: "任务已提交，正在处理中",
      });
    } catch (error) {
      next(error);
    }
  }

  // 查询任务状态
  async getTaskStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.query;

      if (!taskId || typeof taskId !== "string") {
        return next(createError("taskId 参数必须提供", 400));
      }

      const taskStatus = await this.taskService.getTaskStatus(taskId);
      res.json(taskStatus);
    } catch (error) {
      next(error);
    }
  }

  // 获取任务结果
  async getTaskResult(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.query;

      if (!taskId || typeof taskId !== "string") {
        return next(createError("taskId 参数必须提供", 400));
      }

      const result = await this.taskService.getTaskResult(taskId);
      res.set("Content-Type", "application/xml");
      res.send(result);
    } catch (error) {
      next(error);
    }
  }

  // 获取任务列表
  async getTaskList(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const filter =
        status &&
        typeof status === "string" &&
        ["pending", "processing", "success", "fail"].includes(status)
          ? { status: status as "pending" | "processing" | "success" | "fail" }
          : undefined;

      const taskList = await this.taskService.getTaskList(filter);
      res.json(taskList);
    } catch (error) {
      next(error);
    }
  }

  // 获取任务日志
  async getTaskLog(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.query;

      if (!taskId || typeof taskId !== "string") {
        return next(createError("taskId 参数必须提供", 400));
      }

      const taskLog = await this.taskService.getTaskLog(taskId);
      res.json(taskLog);
    } catch (error) {
      next(error);
    }
  }

  // 删除任务
  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const { taskId } = req.query;

      if (!taskId || typeof taskId !== "string") {
        return next(createError("taskId 参数必须提供", 400));
      }

      await this.taskService.deleteTask(taskId);
      res.json({
        message: "任务删除成功",
        taskId: taskId,
      });
    } catch (error) {
      next(error);
    }
  }
}
