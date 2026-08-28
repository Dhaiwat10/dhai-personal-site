import type { BlogPost } from "./types/blog";
import { articlePath } from "./site";

type ToolInput = Record<string, unknown>;

type SiteTool = {
  name: string;
  title: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
    additionalProperties: false;
  };
  annotations: {
    readOnlyHint: true;
  };
  execute: (input: ToolInput) => unknown | Promise<unknown>;
};

type ModelContext = {
  registerTool: (tool: SiteTool) => Promise<void>;
};

function getModelContext(): ModelContext | undefined {
  return (document as Document & { modelContext?: ModelContext }).modelContext;
}

function getOptionalString(input: ToolInput, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" ? value.trim() || undefined : undefined;
}

function getLimit(input: ToolInput, fallback: number): number {
  const value = input.limit;
  return typeof value === "number" && Number.isInteger(value)
    ? Math.min(Math.max(value, 1), 10)
    : fallback;
}

function siteUrl(path: string): string {
  const gatewayBase = window.location.pathname.match(
    /^\/(?:ipfs|ipns)\/[^/]+(?=\/|$)/,
  )?.[0] ?? "";

  return new URL(`${gatewayBase}${path}`, window.location.origin).href;
}

function postSummary(post: BlogPost) {
  return {
    id: post.id,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    tags: post.tags,
    readingTimeMinutes: post.readingTime,
    url: siteUrl(articlePath(post.id)),
  };
}

const searchBlogPostsTool: SiteTool = {
  name: "search_blog_posts",
  title: "Search blog posts",
  description:
    "Search Dhaiwat Pandya's published blog posts by words in their title, excerpt, tags, or text. Use this to find a post before reading it in full.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Optional words to search for. Omit to list the newest posts.",
      },
      tag: {
        type: "string",
        description: "Optional tag to match, such as Ethereum or programming.",
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 10,
        description: "Maximum number of matching posts to return. Defaults to 5.",
      },
    },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: async (input) => {
    const { blogPosts } = await import("./data/blog-posts");
    const query = getOptionalString(input, "query")?.toLocaleLowerCase();
    const tag = getOptionalString(input, "tag")?.toLocaleLowerCase();
    const limit = getLimit(input, 5);

    const posts = blogPosts.filter((post) => {
      const matchesQuery = !query || [
        post.title,
        post.excerpt,
        post.tags.join(" "),
        post.content,
      ].join(" ").toLocaleLowerCase().includes(query);
      const matchesTag = !tag || post.tags.some((postTag) => postTag.toLocaleLowerCase() === tag);

      return matchesQuery && matchesTag;
    });

    return {
      posts: posts.slice(0, limit).map(postSummary),
      totalMatches: posts.length,
    };
  },
};

const readBlogPostTool: SiteTool = {
  name: "read_blog_post",
  title: "Read a blog post",
  description:
    "Read the full text and metadata of a published blog post. Use an exact post id returned by search_blog_posts.",
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The exact id of the published blog post to read.",
      },
    },
    required: ["id"],
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: async (input) => {
    const { blogPosts } = await import("./data/blog-posts");
    const id = getOptionalString(input, "id");
    const post = id ? blogPosts.find((candidate) => candidate.id === id) : undefined;

    if (!post) {
      return {
        error: "No published blog post matches that id. Use search_blog_posts to find a valid id.",
      };
    }

    return {
      ...postSummary(post),
      content: post.content,
    };
  },
};

const listTravelLocationsTool: SiteTool = {
  name: "list_travel_locations",
  title: "List travel locations",
  description:
    "List places shown on Dhaiwat Pandya's travel map. Optionally filter the public list by country.",
  inputSchema: {
    type: "object",
    properties: {
      country: {
        type: "string",
        description: "Optional country name to match, such as India or Japan.",
      },
      limit: {
        type: "integer",
        minimum: 1,
        maximum: 10,
        description: "Maximum number of locations to return. Defaults to 10.",
      },
    },
    additionalProperties: false,
  },
  annotations: { readOnlyHint: true },
  execute: async (input) => {
    const { travelLocations } = await import("./data/travel-locations");
    const country = getOptionalString(input, "country")?.toLocaleLowerCase();
    const locations = travelLocations.filter(
      (location) => !country || location.country.toLocaleLowerCase() === country,
    );

    return {
      locations: locations.slice(0, getLimit(input, 10)),
      totalMatches: locations.length,
    };
  },
};

export async function registerSiteTools(): Promise<void> {
  const modelContext = getModelContext();

  if (!modelContext) {
    return;
  }

  await Promise.all([
    modelContext.registerTool(searchBlogPostsTool),
    modelContext.registerTool(readBlogPostTool),
    modelContext.registerTool(listTravelLocationsTool),
  ]);
}
