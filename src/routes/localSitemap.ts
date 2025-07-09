import { Router } from "express";
import { generateSitemap } from "../utils/sitemap";
import fs from "fs";
import path from "path";

const router = Router();

function scanHtmlFiles(dirPath: string, baseUrl: string): string[] {
  let urls: string[] = [];
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      urls = urls.concat(scanHtmlFiles(fullPath, baseUrl));
    } else if (stat.isFile() && file.endsWith(".html")) {
      // 生成相对路径的URL
      const relativePath = path.relative(dirPath, fullPath).replace(/\\/g, "/");
      urls.push(baseUrl.replace(/\/$/, "") + "/" + file);
    }
  }
  return urls;
}

router.post("/local-sitemap", (req: any, res: any) => {
  const { dirPath, baseUrl, changefreq, priority, lastmod } = req.body;
  if (!dirPath || !baseUrl) {
    return res.status(400).json({ error: "dirPath 和 baseUrl 必须提供" });
  }
  try {
    const urls = scanHtmlFiles(dirPath, baseUrl);
    const xml = generateSitemap({ urls, changefreq, priority, lastmod });
    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    res
      .status(500)
      .json({ error: "扫描本地目录失败", detail: (err as Error).message });
  }
});

export default router;
