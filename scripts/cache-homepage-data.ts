import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import type { GitHubStats, LatestRepo } from "../src/types/github";
import type { LetterboxdMovie } from "../src/types/letterboxd";

const CACHE_DIRECTORY = join(process.cwd(), "public", "data");
const GITHUB_API_URL = "https://api.github.com";
const RSS2JSON_API_URL = "https://api.rss2json.com/v1/api.json";

type JsonRecord = Record<string, unknown>;

type GitHubRepository = {
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  fork: boolean;
  pushedAt: string;
};

function asRecord(value: unknown, context: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected an object for ${context}`);
  }

  return value as JsonRecord;
}

function requiredString(record: JsonRecord, key: string, context: string): string {
  const value = record[key];

  if (typeof value !== "string") {
    throw new Error(`Expected ${key} to be a string for ${context}`);
  }

  return value;
}

function optionalString(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function requiredNumber(record: JsonRecord, key: string, context: string): number {
  const value = record[key];

  if (typeof value !== "number") {
    throw new Error(`Expected ${key} to be a number for ${context}`);
  }

  return value;
}

function requiredBoolean(record: JsonRecord, key: string, context: string): boolean {
  const value = record[key];

  if (typeof value !== "boolean") {
    throw new Error(`Expected ${key} to be a boolean for ${context}`);
  }

  return value;
}

async function requestJson(url: string, headers: HeadersInit = {}): Promise<unknown> {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Request to ${url} failed with ${response.status}`);
  }

  return response.json() as Promise<unknown>;
}

function parseGitHubRepositories(payload: unknown): GitHubRepository[] {
  if (!Array.isArray(payload)) {
    throw new Error("Expected GitHub repositories to be an array");
  }

  return payload.map((item, index) => {
    const record = asRecord(item, `GitHub repository ${index}`);
    const description = record.description;
    const language = record.language;

    return {
      name: requiredString(record, "name", `GitHub repository ${index}`),
      description: typeof description === "string" ? description : null,
      url: requiredString(record, "html_url", `GitHub repository ${index}`),
      language: typeof language === "string" ? language : null,
      stars: requiredNumber(record, "stargazers_count", `GitHub repository ${index}`),
      fork: requiredBoolean(record, "fork", `GitHub repository ${index}`),
      pushedAt: requiredString(record, "pushed_at", `GitHub repository ${index}`),
    };
  });
}

async function fetchGitHubStats(username: string): Promise<GitHubStats> {
  const requestHeaders = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  const [userPayload, repositoriesPayload] = await Promise.all([
    requestJson(`${GITHUB_API_URL}/users/${username}`, requestHeaders),
    requestJson(
      `${GITHUB_API_URL}/users/${username}/repos?per_page=100&sort=updated`,
      requestHeaders,
    ),
  ]);
  const user = asRecord(userPayload, "GitHub user");
  const repositories = parseGitHubRepositories(repositoriesPayload);
  const nonForkRepositories = repositories.filter((repository) => !repository.fork);
  const latestRepos: LatestRepo[] = [...nonForkRepositories]
    .sort(
      (first, second) =>
        new Date(second.pushedAt).getTime() -
        new Date(first.pushedAt).getTime(),
    )
    .slice(0, 3)
    .map((repository) => ({
      name: repository.name,
      description: repository.description,
      url: repository.url,
      language: repository.language,
      updatedAt: repository.pushedAt,
      stars: repository.stars,
    }));

  return {
    followers: requiredNumber(user, "followers", "GitHub user"),
    totalStars: nonForkRepositories.reduce(
      (sum, repository) => sum + repository.stars,
      0,
    ),
    latestRepos,
  };
}

function parseLetterboxdMovies(payload: unknown): LetterboxdMovie[] {
  const feed = asRecord(payload, "Letterboxd feed");

  if (feed.status !== "ok") {
    throw new Error(`RSS2JSON error: ${optionalString(feed, "message") ?? "Unknown error"}`);
  }

  if (!Array.isArray(feed.items)) {
    throw new Error("Expected Letterboxd feed items to be an array");
  }

  return feed.items
    .flatMap((item, index) => {
      const record = asRecord(item, `Letterboxd item ${index}`);
      const title = optionalString(record, "title") ?? "";
      const titleMatch = title.match(/^(.+?),\s*(\d{4})/);

      if (!titleMatch) {
        return [];
      }

      const description =
        optionalString(record, "description") ?? optionalString(record, "content") ?? "";
      const stars = title.match(/★/g)?.length ?? 0;
      const halfStars = title.match(/½/g)?.length ?? 0;
      const rating = stars + halfStars * 0.5 || undefined;
      const posterUrl = description.match(/<img[^>]+src="([^"]+)"[^>]*>/)?.[1];
      const watchedAt = new Date(optionalString(record, "pubDate") ?? "");
      const watchedDate = Number.isNaN(watchedAt.getTime())
        ? new Date().toISOString().slice(0, 10)
        : watchedAt.toISOString().slice(0, 10);
      const url = optionalString(record, "link");

      return [
        {
          id: url ?? `letterboxd-${index}`,
          title: titleMatch[1].trim(),
          year: Number.parseInt(titleMatch[2], 10),
          rating,
          memberRating: rating,
          watchedDate,
          rewatch: description.toLowerCase().includes("rewatch"),
          posterUrl,
          review:
            description
              .replace(/<[^>]*>/g, "")
              .replace(/^\s*[\r\n]/gm, "")
              .trim() || undefined,
          url,
        },
      ];
    })
    .sort(
      (first, second) =>
        new Date(second.watchedDate).getTime() -
        new Date(first.watchedDate).getTime(),
    );
}

async function fetchLetterboxdMovies(username: string): Promise<LetterboxdMovie[]> {
  const rssUrl = `https://letterboxd.com/${username}/rss/`;
  const endpoint = `${RSS2JSON_API_URL}?rss_url=${encodeURIComponent(rssUrl)}`;
  return parseLetterboxdMovies(await requestJson(endpoint));
}

async function updateCache<T>(
  cachePath: string,
  fetchData: () => Promise<T>,
): Promise<void> {
  try {
    const data = await fetchData();
    mkdirSync(dirname(cachePath), { recursive: true });
    writeFileSync(cachePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    console.log(`Updated ${cachePath}`);
  } catch (error) {
    if (!existsSync(cachePath)) {
      throw error;
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Keeping cached ${cachePath}: ${message}`);
    JSON.parse(readFileSync(cachePath, "utf8")) as unknown;
  }
}

async function cacheHomepageData(): Promise<void> {
  await Promise.all([
    updateCache(
      join(CACHE_DIRECTORY, "github", "dhaiwat10.json"),
      () => fetchGitHubStats("dhaiwat10"),
    ),
    updateCache(
      join(CACHE_DIRECTORY, "letterboxd", "dhaiwat.json"),
      () => fetchLetterboxdMovies("Dhaiwat"),
    ),
  ]);
}

cacheHomepageData().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
