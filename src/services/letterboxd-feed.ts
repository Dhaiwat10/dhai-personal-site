import type { LetterboxdMovie } from "../types/letterboxd";

type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown, context: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected an object for ${context}`);
  }

  return value as JsonRecord;
}

function optionalString(record: JsonRecord, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function movieKey(movie: LetterboxdMovie): string {
  const slug = movie.url?.match(
    /\/film\/([^/?#]+)(?:\/\d+)?\/?(?:[?#].*)?$/i,
  )?.[1];

  if (slug) {
    return `slug:${slug.toLowerCase()}`;
  }

  return `title:${movie.title.trim().toLowerCase()}:${movie.year}`;
}

export function deduplicateLetterboxdMovies(
  movies: LetterboxdMovie[],
): LetterboxdMovie[] {
  const occurrenceCounts = new Map<string, number>();
  const seen = new Set<string>();

  movies.forEach((movie) => {
    const key = movieKey(movie);
    occurrenceCounts.set(key, (occurrenceCounts.get(key) ?? 0) + 1);
  });

  return movies.flatMap((movie) => {
    const key = movieKey(movie);

    if (seen.has(key)) {
      return [];
    }

    seen.add(key);
    return [
      {
        ...movie,
        rewatch: movie.rewatch || (occurrenceCounts.get(key) ?? 0) > 1,
      },
    ];
  });
}

export function parseLetterboxdMovies(payload: unknown): LetterboxdMovie[] {
  const feed = asRecord(payload, "Letterboxd feed");

  if (feed.status !== "ok") {
    throw new Error(
      `RSS2JSON error: ${optionalString(feed, "message") ?? "Unknown error"}`,
    );
  }

  if (!Array.isArray(feed.items)) {
    throw new Error("Expected Letterboxd feed items to be an array");
  }

  const movies = feed.items
    .flatMap((item, index) => {
      const record = asRecord(item, `Letterboxd item ${index}`);
      const title = optionalString(record, "title") ?? "";
      const titleMatch = title.match(/^(.+?),\s*(\d{4})/);

      if (!titleMatch) {
        return [];
      }

      const description =
        optionalString(record, "description") ??
        optionalString(record, "content") ??
        "";
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

  return deduplicateLetterboxdMovies(movies);
}
