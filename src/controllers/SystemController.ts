import { Request, Response, NextFunction } from "express";
import { SystemService } from "../services/SystemService";

export class SystemController {
  private systemService: SystemService;

  constructor() {
    this.systemService = new SystemService();
  }

  // 健康检查
  async healthCheck(req: Request, res: Response, next: NextFunction) {
    try {
      const healthInfo = await this.systemService.getHealthInfo();
      res.json(healthInfo);
    } catch (error) {
      next(error);
    }
  }

  // 获取系统信息
  async getSystemInfo(req: Request, res: Response, next: NextFunction) {
    try {
      const systemInfo = await this.systemService.getSystemInfo();
      res.json(systemInfo);
    } catch (error) {
      next(error);
    }
  }
}
