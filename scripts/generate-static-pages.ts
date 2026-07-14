import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  BLOG_PATH,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_IMAGE,
  SITE_NAME,
  SITE_URL,
  articlePath,
  canonicalUrl,
} from "../src/site";
import {
  loadBlogPostMetadata,
  type BlogPostMetadata,
} from "./blog-posts";

type StaticPage = {
  path: string;
  title: string;
  description: string;
  kind: "home" | "blog" | "article" | "not-found";
  article?: BlogPostMetadata;
};

const OUTPUT_DIRECTORY = join(process.cwd(), "dist");
const SHELL_PATH = join(OUTPUT_DIRECTORY, "index.html");

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeScript(value: string): string {
  return value.replaceAll("<", "\\u003c").replaceAll(">", "\\u003e");
}

function assertRouteSegment(value: string): void {
  if (!/^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/i.test(value)) {
    throw new Error(`Blog post id must be URL-safe: ${value}`);
  }
}

function buildStructuredData(page: StaticPage): Record<string, unknown> {
  if (page.kind === "home") {
    return {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Dhaiwat Pandya",
      url: SITE_URL,
      sameAs: [
        "https://x.com/dhaiwat10",
        "https://github.com/dhaiwat10",
        "https://farcaster.xyz/dhai.eth",
      ],
      jobTitle: "Ethereum Developer",
      description: DEFAULT_DESCRIPTION,
    };
  }

  if (page.kind === "blog") {
    return {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "dhai.eth Blog",
      url: canonicalUrl(BLOG_PATH),
      description: page.description,
      author: {
        "@type": "Person",
        name: "Dhaiwat Pandya",
      },
    };
  }

  if (page.kind === "article" && page.article) {
    const articleUrl = canonicalUrl(page.path);

    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          itemListElement: [
            {
              "@type": "ListItem",
              position: 1,
              name: "Home",
              item: SITE_URL,
            },
            {
              "@type": "ListItem",
              position: 2,
              name: "Blog",
              item: canonicalUrl(BLOG_PATH),
            },
            {
              "@type": "ListItem",
              position: 3,
              name: page.article.title,
              item: articleUrl,
            },
          ],
        },
        {
          "@type": "BlogPosting",
          headline: page.article.title,
          description: page.article.excerpt,
          url: articleUrl,
          datePublished: page.article.date,
          dateModified: page.article.date,
          author: {
            "@type": "Person",
            name: "Dhaiwat Pandya",
            url: SITE_URL,
          },
          publisher: {
            "@type": "Person",
            name: "Dhaiwat Pandya",
          },
          ...(page.article.tags.length > 0
            ? { keywords: page.article.tags.join(", ") }
            : {}),
        },
      ],
    };
  }

  return {};
}

function renderPage(shell: string, page: StaticPage, assetDepth: number): string {
  const canonical = canonicalUrl(page.path);
  const pageTitle = page.title ? `${page.title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const openGraphType = page.kind === "article" ? "article" : "website";
  const staticMetadata = [
    `<meta name="robots" content="${page.kind === "not-found" ? "noindex" : "index,follow"}">`,
    `<meta property="og:title" content="${escapeHtml(pageTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(page.description)}">`,
    `<meta property="og:image" content="${SITE_IMAGE}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:type" content="${openGraphType}">`,
    `<meta property="og:site_name" content="${SITE_NAME}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<meta name="twitter:title" content="${escapeHtml(pageTitle)}">`,
    `<meta name="twitter:description" content="${escapeHtml(page.description)}">`,
    `<meta name="twitter:image" content="${SITE_IMAGE}">`,
    '<meta name="twitter:creator" content="@dhaiwat10">',
    '<meta name="twitter:site" content="@dhaiwat10">',
  ];

  if (page.article) {
    staticMetadata.push(
      `<meta property="article:published_time" content="${page.article.date}">`,
      `<meta property="article:modified_time" content="${page.article.date}">`,
      '<meta property="article:author" content="Dhaiwat Pandya">',
      ...page.article.tags.map(
        (tag) => `<meta property="article:tag" content="${escapeHtml(tag)}">`,
      ),
    );
  }

  const structuredData = buildStructuredData(page);
  if (Object.keys(structuredData).length > 0) {
    staticMetadata.push(
      `<script type="application/ld+json">${escapeScript(
        JSON.stringify(structuredData),
      )}</script>`,
    );
  }

  const assetPrefix = "../".repeat(assetDepth) || "./";
  return shell
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(pageTitle)}</title>`)
    .replace(
      /<meta name="description"[^>]*>/i,
      `<meta name="description" content="${escapeHtml(page.description)}">`,
    )
    .replace(
      /<link rel="canonical"[^>]*>/i,
      `<link rel="canonical" href="${canonical}">`,
    )
    .replace(/(["'])\.\/(assets\/|favicon\.svg)/g, `$1${assetPrefix}$2`)
    .replace("</head>", `    ${staticMetadata.join("\n    ")}\n  </head>`);
}

function writeStaticPage(path: string, html: string): void {
  mkdirSync(join(path, ".."), { recursive: true });
  writeFileSync(path, html, "utf8");
}

function generateStaticPages(): void {
  if (!existsSync(SHELL_PATH)) {
    throw new Error(`Expected Vite output at ${SHELL_PATH}`);
  }

  const shell = readFileSync(SHELL_PATH, "utf8");
  const blogDescription =
    "Blog posts by Dhaiwat Pandya about Ethereum development and other topics.";

  writeStaticPage(
    SHELL_PATH,
    renderPage(
      shell,
      {
        path: "/",
        title: "",
        description: DEFAULT_DESCRIPTION,
        kind: "home",
      },
      0,
    ),
  );

  writeStaticPage(
    join(OUTPUT_DIRECTORY, "blog", "index.html"),
    renderPage(
      shell,
      {
        path: BLOG_PATH,
        title: "Blog",
        description: blogDescription,
        kind: "blog",
      },
      1,
    ),
  );

  for (const post of loadBlogPostMetadata()) {
    assertRouteSegment(post.id);
    writeStaticPage(
      join(OUTPUT_DIRECTORY, "blog", post.id, "index.html"),
      renderPage(
        shell,
        {
          path: articlePath(post.id),
          title: post.title,
          description: post.excerpt,
          kind: "article",
          article: post,
        },
        2,
      ),
    );
  }

  writeStaticPage(
    join(OUTPUT_DIRECTORY, "404.html"),
    renderPage(
      shell,
      {
        path: "/",
        title: "Page not found",
        description: "The requested page could not be found.",
        kind: "not-found",
      },
      0,
    ),
  );

  console.log("Generated static routes for the home page, blog, and blog posts.");
}

generateStaticPages();
