import { Router } from "express";
import { crawlSite } from "../utils/autoCrawler";
import { generateSitemap } from "../utils/sitemap";

const router = Router();

router.post("/auto-sitemap", async (req: any, res: any) => {
  const { url, changefreq, priority, lastmod, maxDepth } = req.body;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url 必须为字符串" });
  }
  try {
    const urls = await crawlSite(url, maxDepth || 3);
    const xml = generateSitemap({ urls, changefreq, priority, lastmod });
    res.set("Content-Type", "application/xml");
    res.send(xml);
  } catch (err) {
    res
      .status(500)
      .json({ error: "爬取网站失败", detail: (err as Error).message });
  }
});

export default router;
