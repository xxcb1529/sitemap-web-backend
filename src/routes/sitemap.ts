import { Router } from "express";
import { generateSitemap } from "../utils/sitemap";

const router = Router();

router.post("/sitemap", (req: any, res: any) => {
  const { urls, changefreq, priority, lastmod } = req.body;
  if (!Array.isArray(urls) || urls.length === 0) {
    return res.status(400).json({ error: "urls 必须为非空数组" });
  }
  const xml = generateSitemap({ urls, changefreq, priority, lastmod });
  res.set("Content-Type", "application/xml");
  res.send(xml);
});

export default router;
