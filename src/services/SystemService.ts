import os from "os";
import { getAllTasks } from "../utils/taskManager";

export interface HealthInfo {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
    free: number;
  };
  tasks: {
    total: number;
    pending: number;
    processing: number;
    success: number;
    failed: number;
  };
}

export interface SystemInfo {
  version: string;
  nodeVersion: string;
  platform: string;
  arch: string;
  cpus: number;
  memory: {
    total: number;
    free: number;
  };
  uptime: number;
}

export class SystemService {
  // 获取健康检查信息
  async getHealthInfo(): Promise<HealthInfo> {
    const tasks = getAllTasks();
    const taskStats = {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "pending").length,
      processing: tasks.filter((t) => t.status === "processing").length,
      success: tasks.filter((t) => t.status === "success").length,
      failed: tasks.filter((t) => t.status === "fail").length,
    };

    const memUsage = process.memoryUsage();

    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        used: Math.round(memUsage.heapUsed / 1024 / 1024),
        total: Math.round(memUsage.heapTotal / 1024 / 1024),
        free: Math.round(
          (memUsage.heapTotal - memUsage.heapUsed) / 1024 / 1024
        ),
      },
      tasks: taskStats,
    };
  }

  // 获取系统信息
  async getSystemInfo(): Promise<SystemInfo> {
    return {
      version: "1.0.0",
      nodeVersion: process.version,
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      memory: {
        total: Math.round(os.totalmem() / 1024 / 1024 / 1024),
        free: Math.round(os.freemem() / 1024 / 1024 / 1024),
      },
      uptime: os.uptime(),
    };
  }
}
