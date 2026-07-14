import type { LetterboxdFeed, LetterboxdMovie } from "../types/letterboxd";
import { staticAssetUrl } from "../utils/static-asset";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isLetterboxdMovie(value: unknown): value is LetterboxdMovie {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.year === "number" &&
    typeof value.watchedDate === "string" &&
    typeof value.rewatch === "boolean" &&
    (value.rating === undefined || typeof value.rating === "number") &&
    (value.memberRating === undefined || typeof value.memberRating === "number") &&
    (value.posterUrl === undefined || typeof value.posterUrl === "string") &&
    (value.review === undefined || typeof value.review === "string") &&
    (value.url === undefined || typeof value.url === "string")
  );
}

export class LetterboxdService {
  static async fetchUserFeed(username: string): Promise<LetterboxdFeed> {
    const cacheUrl = staticAssetUrl(
      `data/letterboxd/${encodeURIComponent(username.toLowerCase())}.json`,
    );
    const response = await fetch(cacheUrl, { cache: "force-cache" });

    if (!response.ok) {
      throw new Error("Unable to load cached Letterboxd activity.");
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data) || !data.every(isLetterboxdMovie)) {
      throw new Error("Cached Letterboxd activity has an invalid format.");
    }

    const lastModified = new Date(response.headers.get("last-modified") ?? "");
    return {
      movies: data,
      lastUpdated: Number.isNaN(lastModified.getTime())
        ? new Date().toISOString()
        : lastModified.toISOString(),
    };
  }

  static async getRecentMovies(
    username: string,
    limit: number = 10,
  ): Promise<LetterboxdMovie[]> {
    const feed = await this.fetchUserFeed(username);
    return feed.movies.slice(0, limit);
  }
}