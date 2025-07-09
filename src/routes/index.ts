import { Router } from "express";
import sitemapRouter from "./sitemap";
import autoSitemapRouter from "./autoSitemap";
import localSitemapRouter from "./localSitemap";
import sitemapTaskRouter from "./sitemapTask";
import { SystemController } from "../controllers/SystemController";

const router = Router();
const systemController = new SystemController();

// 基础路由
router.use("/sitemap", sitemapRouter);
router.use("/auto-sitemap", autoSitemapRouter);
router.use("/local-sitemap", localSitemapRouter);
router.use("/task", sitemapTaskRouter);

// 系统路由
router.get("/health", systemController.healthCheck.bind(systemController));
router.get("/system", systemController.getSystemInfo.bind(systemController));

export default router;
