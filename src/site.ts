export const SITE_URL = "https://dhaiwat.xyz";
export const SITE_NAME = "Dhaiwat Pandya";
export const DEFAULT_DESCRIPTION = "Ethereum Developer. Relentlessly Curious.";
export const DEFAULT_TITLE = "Dhaiwat Pandya";
export const SITE_IMAGE = `${SITE_URL}/og-default.png`;
export const BLOG_PATH = "/blog/";

export function normalizeSitePath(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;

  if (path === "/") {
    return path;
  }

  return `${path.replace(/\/+$/, "")}/`;
}

export function canonicalUrl(pathname: string): string {
  const path = normalizeSitePath(pathname);
  return path === "/" ? SITE_URL : `${SITE_URL}${path}`;
}

export function articlePath(id: string): string {
  return `${BLOG_PATH}${encodeURIComponent(id)}/`;
}
