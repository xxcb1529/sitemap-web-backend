import { generateSitemap } from "../utils/sitemap";
import { crawlSite } from "../utils/autoCrawler";
import fs from "fs";
import path from "path";

export interface SitemapOptions {
  changefreq?: string;
  priority?: number;
  lastmod?: string;
}

export interface CrawlOptions extends SitemapOptions {
  maxDepth?: number;
}

export class SitemapService {
  // 从URL列表生成网站地图
  async generateFromUrls(
    urls: string[],
    options: SitemapOptions
  ): Promise<string> {
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error("URL列表不能为空");
    }

    return generateSitemap({ urls, ...options });
  }

  // 从爬取生成网站地图
  async generateFromCrawling(
    url: string,
    options: CrawlOptions
  ): Promise<string> {
    if (!url || typeof url !== "string") {
      throw new Error("URL必须为有效字符串");
    }

    const urls = await crawlSite(url, options.maxDepth || 3);
    return generateSitemap({ urls, ...options });
  }

  // 从本地目录生成网站地图
  async generateFromLocalDirectory(
    dirPath: string,
    baseUrl: string,
    options: SitemapOptions
  ): Promise<string> {
    if (!dirPath || !baseUrl) {
      throw new Error("目录路径和基础URL必须提供");
    }

    if (!fs.existsSync(dirPath)) {
      throw new Error(`目录不存在: ${dirPath}`);
    }

    const urls = this.scanHtmlFiles(dirPath, baseUrl);
    return generateSitemap({ urls, ...options });
  }

  // 扫描HTML文件的私有方法
  private scanHtmlFiles(dirPath: string, baseUrl: string): string[] {
    let urls: string[] = [];
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        urls = urls.concat(this.scanHtmlFiles(fullPath, baseUrl));
      } else if (stat.isFile() && file.endsWith(".html")) {
        urls.push(baseUrl.replace(/\/$/, "") + "/" + file);
      }
    }

    return urls;
  }
}
