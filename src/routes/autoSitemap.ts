import { Router } from "express";
import { SitemapController } from "../controllers/SitemapController";
import { autoSitemapValidation } from "../middleware/validation";

const router = Router();
const sitemapController = new SitemapController();

// 自动爬取生成网站地图
router.post(
  "/",
  autoSitemapValidation,
  sitemapController.generateAutoSitemap.bind(sitemapController)
);

export default router;
