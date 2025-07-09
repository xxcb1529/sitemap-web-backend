import { Router } from "express";
import { TaskController } from "../controllers/TaskController";
import { taskValidation } from "../middleware/validation";

const router = Router();
const taskController = new TaskController();

// 提交任务
router.post(
  "/submit",
  taskValidation,
  taskController.submitTask.bind(taskController)
);

// 查询任务状态
router.get("/status", taskController.getTaskStatus.bind(taskController));

// 获取任务结果
router.get("/result", taskController.getTaskResult.bind(taskController));

// 获取历史任务列表
router.get("/list", taskController.getTaskList.bind(taskController));

// 获取任务日志
router.get("/log", taskController.getTaskLog.bind(taskController));

// 删除任务
router.delete("/delete", taskController.deleteTask.bind(taskController));

export default router;
