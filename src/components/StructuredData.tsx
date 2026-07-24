import { useEffect } from "react";
import type { BlogPost } from "../types/blog";
import { BLOG_PATH, SITE_URL, articlePath, canonicalUrl } from "../site";

interface StructuredDataProps {
  type: 'person' | 'blog' | 'article';
  article?: BlogPost;
}

function StructuredData({ type, article }: StructuredDataProps) {
  useEffect(() => {
    document
      .querySelectorAll('script[type="application/ld+json"]')
      .forEach((script) => script.remove());

    let jsonLd: object;

    if (type === "person") {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Dhaiwat Pandya",
        url: SITE_URL,
        sameAs: [
          "https://x.com/dhaiwat10",
          "https://github.com/dhaiwat10",
          "https://farcaster.xyz/~/profiles/3339",
        ],
        jobTitle: "Ethereum Developer",
        description: "Ethereum Developer. Relentlessly Curious.",
      };
    } else if (type === "blog") {
      jsonLd = {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Dhaiwat Pandya Blog",
        url: canonicalUrl(BLOG_PATH),
        description:
          "Blog posts by Dhaiwat Pandya about Ethereum development and other topics.",
        author: {
          "@type": "Person",
          name: "Dhaiwat Pandya",
        },
      };
    } else if (type === "article" && article) {
      const articleUrl = canonicalUrl(articlePath(article.id));
      jsonLd = {
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
                name: article.title,
                item: articleUrl,
              },
            ],
          },
          {
            "@type": "BlogPosting",
            headline: article.title,
            description: article.excerpt,
            url: articleUrl,
            datePublished: article.date,
            dateModified: article.date,
            author: {
              "@type": "Person",
              name: "Dhaiwat Pandya",
              url: SITE_URL,
            },
            publisher: {
              "@type": "Person",
              name: "Dhaiwat Pandya",
            },
            ...(article.tags.length > 0
              ? { keywords: article.tags.join(", ") }
              : {}),
          },
        ],
      };
    } else {
      return;
    }

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [article, type]);

  return null;
}

export default StructuredData;

