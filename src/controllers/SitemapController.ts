import { Request, Response, NextFunction } from "express";
import { SitemapService } from "../services/SitemapService";
import { createError } from "../middleware/errorHandler";

export class SitemapController {
  private sitemapService: SitemapService;

  constructor() {
    this.sitemapService = new SitemapService();
  }

  // 手动输入URL生成网站地图
  async generateSitemap(req: Request, res: Response, next: NextFunction) {
    try {
      const { urls, changefreq, priority, lastmod } = req.body;

      if (urls.length === 0) {
        return next(createError("urls 数组不能为空", 400));
      }

      const xml = await this.sitemapService.generateFromUrls(urls, {
        changefreq,
        priority,
        lastmod,
      });

      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      next(error);
    }
  }

  // 自动爬取生成网站地图
  async generateAutoSitemap(req: Request, res: Response, next: NextFunction) {
    try {
      const { url, changefreq, priority, lastmod, maxDepth } = req.body;

      const xml = await this.sitemapService.generateFromCrawling(url, {
        maxDepth: maxDepth || 3,
        changefreq,
        priority,
        lastmod,
      });

      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      next(error);
    }
  }

  // 本地目录扫描生成网站地图
  async generateLocalSitemap(req: Request, res: Response, next: NextFunction) {
    try {
      const { dirPath, baseUrl, changefreq, priority, lastmod } = req.body;

      const xml = await this.sitemapService.generateFromLocalDirectory(
        dirPath,
        baseUrl,
        {
          changefreq,
          priority,
          lastmod,
        }
      );

      res.set("Content-Type", "application/xml");
      res.send(xml);
    } catch (error) {
      next(error);
    }
  }
}
