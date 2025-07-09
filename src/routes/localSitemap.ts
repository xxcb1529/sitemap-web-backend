import { Router } from "express";
import { SitemapController } from "../controllers/SitemapController";
import { localSitemapValidation } from "../middleware/validation";

const router = Router();
const sitemapController = new SitemapController();

// 本地目录扫描生成网站地图
router.post(
  "/",
  localSitemapValidation,
  sitemapController.generateLocalSitemap.bind(sitemapController)
);

export default router;
