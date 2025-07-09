export interface SitemapOptions {
  urls: string[];
  changefreq?: string;
  priority?: number;
  lastmod?: string;
}

export function generateSitemap({
  urls,
  changefreq,
  priority,
  lastmod,
}: SitemapOptions): string {
  const urlset = urls
    .map((url) => {
      return [
        "  <url>",
        `    <loc>${url}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
        priority ? `    <priority>${priority}</priority>` : "",
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urlset,
    "</urlset>",
  ].join("\n");
}
