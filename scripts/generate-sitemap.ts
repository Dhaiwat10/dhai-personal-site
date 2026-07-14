import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { BLOG_PATH, SITE_URL, articlePath } from "../src/site";
import { loadBlogPostMetadata } from "./blog-posts";

type SitemapEntry = {
  url: string;
  lastmod: string;
  changefreq: "weekly" | "monthly";
  priority: string;
};

function generateSitemap(): void {
  const currentDate = new Date().toISOString().slice(0, 10);
  const entries: SitemapEntry[] = [
    {
      url: SITE_URL,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      url: `${SITE_URL}${BLOG_PATH}`,
      lastmod: currentDate,
      changefreq: "weekly",
      priority: "0.9",
    },
    ...loadBlogPostMetadata().map((post) => ({
      url: `${SITE_URL}${articlePath(post.id)}`,
      lastmod: post.date || currentDate,
      changefreq: "monthly" as const,
      priority: "0.8",
    })),
  ];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
  const publicPath = join(process.cwd(), "public", "sitemap.xml");

  writeFileSync(publicPath, sitemap, "utf8");
  console.log(`Generated sitemap.xml with ${entries.length} URLs.`);
}

generateSitemap();

