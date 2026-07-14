const EXTERNAL_URL_PATTERN = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

export function staticAssetUrl(path: string): string {
  if (EXTERNAL_URL_PATTERN.test(path)) {
    return path;
  }

  const normalizedPath = path.replace(/^\/+/, "");
  const moduleUrl = import.meta.url;

  if (import.meta.env.DEV) {
    return new URL(normalizedPath, window.location.origin).href;
  }

  return new URL(`../${normalizedPath}`, moduleUrl).href;
}
