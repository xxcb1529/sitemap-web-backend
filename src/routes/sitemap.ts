import { Router } from "express";
import { SitemapController } from "../controllers/SitemapController";
import { sitemapValidation } from "../middleware/validation";

const router = Router();
const sitemapController = new SitemapController();

// 生成网站地图
router.post(
  "/",
  sitemapValidation,
  sitemapController.generateSitemap.bind(sitemapController)
);

export default router;
