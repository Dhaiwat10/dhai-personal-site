import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export interface BlogPostMetadata {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
}

type FrontMatter = Partial<BlogPostMetadata>;
const ARRAY_FIELDS: Record<string, true> = { tags: true };
const FRONT_MATTER_REGEX = /^---\s*\n([\s\S]*?)\n---\s*\n?/;

function cleanValue(value: string): string {
  const trimmed = value.trim();

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }

  return trimmed;
}

function parseFrontMatter(content: string): FrontMatter {
  const match = content.match(FRONT_MATTER_REGEX);

  if (!match) {
    return {};
  }

  const frontMatter: FrontMatter = {};
  let currentKey: keyof FrontMatter | undefined;

  for (const rawLine of match[1].split(/\r?\n/)) {
    const line = rawLine.trim();

    if (!line) {
      continue;
    }

    if (line.startsWith("-")) {
      if (currentKey === "tags") {
        frontMatter.tags ??= [];
        frontMatter.tags.push(cleanValue(line.replace(/^-+\s*/, "")));
      }
      continue;
    }

    const [rawKey, ...rawValue] = line.split(":");
    const key = rawKey.trim() as keyof FrontMatter;
    const value = cleanValue(rawValue.join(":").trim());
    currentKey = key;

    if (ARRAY_FIELDS[key]) {
      frontMatter.tags = value ? [value] : [];
    } else if (key === "id" || key === "title" || key === "date" || key === "excerpt") {
      frontMatter[key] = value;
    }
  }

  return frontMatter;
}

export function loadBlogPostMetadata(projectRoot = process.cwd()): BlogPostMetadata[] {
  const postsDirectory = join(projectRoot, "src", "posts");

  return readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const frontMatter = parseFrontMatter(
        readFileSync(join(postsDirectory, file), "utf8"),
      );
      const id = frontMatter.id ?? file.replace(/\.md$/, "");

      return {
        id,
        title: frontMatter.title ?? id,
        date: frontMatter.date ?? "",
        excerpt: frontMatter.excerpt ?? "",
        tags: frontMatter.tags ?? [],
      };
    })
    .sort((first, second) => Date.parse(second.date) - Date.parse(first.date));
}
