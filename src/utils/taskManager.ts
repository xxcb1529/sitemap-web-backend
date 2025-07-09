import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";

export type TaskStatus = "pending" | "processing" | "success" | "fail";

export interface SitemapTask {
  id: string;
  type: "auto" | "manual" | "local";
  params: any;
  status: TaskStatus;
  progress: number; // 0-100
  result?: string; // sitemap.xml 内容
  error?: string;
  createdAt: number;
  updatedAt: number;
  retryCount?: number;
  log?: string[];
}

const TASKS_FILE = path.resolve(__dirname, "../../data/tasks.json");
const tasks = new Map<string, SitemapTask>();

// 加载历史任务
function loadTasks() {
  if (fs.existsSync(TASKS_FILE)) {
    try {
      const arr = JSON.parse(fs.readFileSync(TASKS_FILE, "utf-8"));
      arr.forEach((t: SitemapTask) => tasks.set(t.id, t));
    } catch {}
  }
}

// 持久化任务
function saveTasks() {
  fs.mkdirSync(path.dirname(TASKS_FILE), { recursive: true });
  fs.writeFileSync(
    TASKS_FILE,
    JSON.stringify(Array.from(tasks.values()), null, 2)
  );
}

loadTasks();

export function createTask(
  type: "auto" | "manual" | "local",
  params: any
): SitemapTask {
  const id = uuidv4();
  const now = Date.now();
  const task: SitemapTask = {
    id,
    type,
    params,
    status: "pending",
    progress: 0,
    createdAt: now,
    updatedAt: now,
    retryCount: 0,
    log: [],
  };
  tasks.set(id, task);
  saveTasks();
  return task;
}

export function getTask(id: string): SitemapTask | undefined {
  return tasks.get(id);
}

export function updateTask(id: string, patch: Partial<SitemapTask>) {
  const task = tasks.get(id);
  if (task) {
    Object.assign(task, patch, { updatedAt: Date.now() });
    saveTasks();
  }
}

export function getAllTasks(filter?: Partial<SitemapTask>): SitemapTask[] {
  let arr = Array.from(tasks.values());
  if (filter) {
    arr = arr.filter((t) =>
      Object.entries(filter).every(([k, v]) => (t as any)[k] === v)
    );
  }
  return arr.sort((a, b) => b.createdAt - a.createdAt);
}

export function appendTaskLog(id: string, msg: string) {
  const task = tasks.get(id);
  if (task) {
    task.log = task.log || [];
    task.log.push(`[${new Date().toISOString()}] ${msg}`);
    saveTasks();
  }
}
