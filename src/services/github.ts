import type { GitHubStats, LatestRepo } from "../types/github";
import { staticAssetUrl } from "../utils/static-asset";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isLatestRepo(value: unknown): value is LatestRepo {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.name === "string" &&
    (typeof value.description === "string" || value.description === null) &&
    typeof value.url === "string" &&
    (typeof value.language === "string" || value.language === null) &&
    typeof value.updatedAt === "string" &&
    typeof value.stars === "number"
  );
}

function isGitHubStats(value: unknown): value is GitHubStats {
  return (
    isRecord(value) &&
    typeof value.followers === "number" &&
    typeof value.totalStars === "number" &&
    Array.isArray(value.latestRepos) &&
    value.latestRepos.every(isLatestRepo)
  );
}

export async function fetchGitHubStats(username: string): Promise<GitHubStats> {
  const cacheUrl = staticAssetUrl(
    `data/github/${encodeURIComponent(username.toLowerCase())}.json`,
  );
  const response = await fetch(cacheUrl, { cache: "force-cache" });

  if (!response.ok) {
    throw new Error("Unable to load cached GitHub activity.");
  }

  const data: unknown = await response.json();
  if (!isGitHubStats(data)) {
    throw new Error("Cached GitHub activity has an invalid format.");
  }

  return data;
}
