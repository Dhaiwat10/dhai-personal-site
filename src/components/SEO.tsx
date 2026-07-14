import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  SITE_IMAGE,
  SITE_NAME,
  canonicalUrl,
} from "../site";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  author?: string;
}

function SEO({
  title,
  description,
  image,
  type = "website",
  publishedTime,
  modifiedTime,
  tags,
  author = "Dhaiwat Pandya",
}: SEOProps) {
  const location = useLocation();
  const fullUrl = canonicalUrl(location.pathname);
  const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
  const pageDescription = description || DEFAULT_DESCRIPTION;
  const pageImage = image || SITE_IMAGE;

  useEffect(() => {
    const updateMetaTag = (
      name: string,
      content: string,
      attribute: "name" | "property" = "name",
    ) => {
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    const appendArticleMetaTag = (property: string, content: string) => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", property);
      meta.setAttribute("content", content);
      document.head.appendChild(meta);
    };

    document.title = pageTitle;
    updateMetaTag("description", pageDescription);
    updateMetaTag("author", author);
    updateMetaTag("viewport", "width=device-width, initial-scale=1.0");
    updateMetaTag("theme-color", "#000000");

    updateMetaTag("og:title", pageTitle, "property");
    updateMetaTag("og:description", pageDescription, "property");
    updateMetaTag("og:image", pageImage, "property");
    updateMetaTag("og:url", fullUrl, "property");
    updateMetaTag("og:type", type, "property");
    updateMetaTag("og:site_name", SITE_NAME, "property");

    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", pageTitle);
    updateMetaTag("twitter:description", pageDescription);
    updateMetaTag("twitter:image", pageImage);
    updateMetaTag("twitter:creator", "@dhaiwat10");
    updateMetaTag("twitter:site", "@dhaiwat10");

    document
      .querySelectorAll('meta[property^="article:"]')
      .forEach((meta) => meta.remove());

    if (type === "article") {
      if (publishedTime) {
        appendArticleMetaTag("article:published_time", publishedTime);
      }
      if (modifiedTime) {
        appendArticleMetaTag("article:modified_time", modifiedTime);
      }
      appendArticleMetaTag("article:author", author);
      tags?.forEach((tag) => appendArticleMetaTag("article:tag", tag));
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    document.documentElement.lang = "en";
  }, [
    author,
    fullUrl,
    modifiedTime,
    pageDescription,
    pageImage,
    pageTitle,
    publishedTime,
    tags,
    type,
  ]);

  return null;
}

export default SEO;

