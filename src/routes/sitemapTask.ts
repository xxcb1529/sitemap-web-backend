import { Router } from "express";
import {
  createTask,
  getTask,
  updateTask,
  getAllTasks,
  appendTaskLog,
  SitemapTask,
} from "../utils/taskManager";
import { crawlSite } from "../utils/autoCrawler";
import { generateSitemap } from "../utils/sitemap";
import fs from "fs";
import path from "path";

const router = Router();
const MAX_RETRY = 3;
const TASK_TIMEOUT = 10 * 60 * 1000; // 10分钟

// 提交任务接口
router.post("/submit-sitemap-task", (req: any, res: any) => {
  const { type, params } = req.body;
  if (!["auto", "manual", "local"].includes(type)) {
    return res.status(400).json({ error: "type 必须为 auto/manual/local" });
  }
  const task = createTask(type, params);
  processSitemapTask(task);
  res.json({ taskId: task.id });
});

// 查询任务状态接口
router.get("/sitemap-task-status", (req: any, res: any) => {
  const { taskId } = req.query;
  const task = getTask(taskId);
  if (!task) return res.status(404).json({ error: "任务不存在" });
  res.json({ status: task.status, progress: task.progress, error: task.error });
});

// 获取任务结果接口
router.get("/sitemap-task-result", (req: any, res: any) => {
  const { taskId } = req.query;
  const task = getTask(taskId);
  if (!task) return res.status(404).json({ error: "任务不存在" });
  if (task.status !== "success")
    return res.status(400).json({ error: "任务未完成" });
  res.set("Content-Type", "application/xml");
  res.send(task.result);
});

// 历史任务列表接口
router.get("/sitemap-task-list", (req: any, res: any) => {
  const { status } = req.query;
  const filter = status ? { status } : undefined;
  res.json(getAllTasks(filter));
});

// 任务日志接口
router.get("/sitemap-task-log", (req: any, res: any) => {
  const { taskId } = req.query;
  const task = getTask(taskId);
  if (!task) return res.status(404).json({ error: "任务不存在" });
  res.json({ log: task.log || [] });
});

// 异步处理任务主逻辑，支持失败重试和超时
async function processSitemapTask(task: SitemapTask) {
  updateTask(task.id, { status: "processing", progress: 10 });
  appendTaskLog(task.id, "任务开始处理");
  let finished = false;
  let timer = setTimeout(() => {
    if (!finished) {
      updateTask(task.id, { status: "fail", error: "任务超时", progress: 100 });
      appendTaskLog(task.id, "任务超时");
    }
  }, TASK_TIMEOUT);

  for (let attempt = 1; attempt <= MAX_RETRY; attempt++) {
    try {
      let urls: string[] = [];
      if (task.type === "auto") {
        const { url, maxDepth, changefreq, priority, lastmod } = task.params;
        appendTaskLog(task.id, `自动爬取第${attempt}次尝试`);
        urls = await crawlSite(url, maxDepth || 3);
        updateTask(task.id, { progress: 60 });
        appendTaskLog(task.id, `爬取到${urls.length}个页面`);
        const xml = generateSitemap({ urls, changefreq, priority, lastmod });
        updateTask(task.id, { result: xml, status: "success", progress: 100 });
        appendTaskLog(task.id, "任务成功完成");
        finished = true;
        clearTimeout(timer);
        return;
      } else if (task.type === "manual") {
        const { urls: mUrls, changefreq, priority, lastmod } = task.params;
        appendTaskLog(task.id, `手动输入第${attempt}次尝试`);
        urls = mUrls;
        const xml = generateSitemap({ urls, changefreq, priority, lastmod });
        updateTask(task.id, { result: xml, status: "success", progress: 100 });
        appendTaskLog(task.id, "任务成功完成");
        finished = true;
        clearTimeout(timer);
        return;
      } else if (task.type === "local") {
        const { dirPath, baseUrl, changefreq, priority, lastmod } = task.params;
        appendTaskLog(task.id, `本地扫描第${attempt}次尝试`);
        urls = scanHtmlFiles(dirPath, baseUrl);
        const xml = generateSitemap({ urls, changefreq, priority, lastmod });
        updateTask(task.id, { result: xml, status: "success", progress: 100 });
        appendTaskLog(task.id, "任务成功完成");
        finished = true;
        clearTimeout(timer);
        return;
      }
    } catch (err: any) {
      appendTaskLog(task.id, `第${attempt}次失败: ${err.message}`);
      updateTask(task.id, { retryCount: attempt, error: err.message });
      if (attempt === MAX_RETRY) {
        updateTask(task.id, { status: "fail", progress: 100 });
        appendTaskLog(task.id, "任务最终失败");
        finished = true;
        clearTimeout(timer);
      }
    }
  }
}

function scanHtmlFiles(dirPath: string, baseUrl: string): string[] {
  let urls: string[] = [];
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      urls = urls.concat(scanHtmlFiles(fullPath, baseUrl));
    } else if (stat.isFile() && file.endsWith(".html")) {
      urls.push(baseUrl.replace(/\/$/, "") + "/" + file);
    }
  }
  return urls;
}

export default router;
