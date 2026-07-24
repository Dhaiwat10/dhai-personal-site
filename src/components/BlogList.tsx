import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { blogPosts } from '../data/blog-posts';
import { BLOG_PATH, articlePath } from "../site";
import { useMemo, useState } from 'react';
import PageTransition from './PageTransition';

function BlogList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const selectedTag = searchParams.get('tag');
  const [searchQuery, setSearchQuery] = useState('');

  // Get all unique tags from all posts
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    blogPosts.forEach(post => {
      post.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, []);

  // Filter posts by selected tag and search query
  const filteredPosts = useMemo(() => {
    let posts = [...blogPosts].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    if (selectedTag) {
      posts = posts.filter(post => post.tags.includes(selectedTag));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.excerpt.toLowerCase().includes(query)
      );
    }
    
    return posts;
  }, [selectedTag, searchQuery]);

  const clearFilter = () => {
    navigate(BLOG_PATH);
    setSearchQuery('');
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-5xl">
        <header className="mb-10 border-b border-white/10 pb-8 sm:mb-12">
          <h1 className="text-balance text-4xl font-semibold text-white sm:text-5xl">
            Blog
          </h1>
        </header>

        <div className="mb-10 space-y-5">
          <div className="relative max-w-2xl">
            <label htmlFor="blog-search" className="sr-only">
              Search posts
            </label>
            <input
              id="blog-search"
              type="search"
              placeholder="Search posts…"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 pr-11 text-sm text-white placeholder:text-zinc-600 transition-colors focus:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-800"
            />
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-zinc-600"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </div>

          <nav aria-label="Filter posts by tag" className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Link
                key={tag}
                to={`${BLOG_PATH}?tag=${encodeURIComponent(tag)}`}
                className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selectedTag === tag
                    ? "border-zinc-500 bg-zinc-800 text-white"
                    : "border-white/10 bg-white/[0.025] text-zinc-500 hover:border-white/20 hover:bg-white/[0.04] hover:text-zinc-200"
                }`}
              >
                {tag}
              </Link>
            ))}
          </nav>

          {(selectedTag || searchQuery) && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-zinc-500">
              <span className="text-pretty">
                {selectedTag && searchQuery ? (
                  <>
                    Filtering by <span className="font-medium text-zinc-200">{selectedTag}</span> and searching for{" "}
                    <span className="font-medium text-zinc-200">“{searchQuery}”</span>
                  </>
                ) : selectedTag ? (
                  <>
                    Filtering by <span className="font-medium text-zinc-200">{selectedTag}</span>
                  </>
                ) : (
                  <>
                    Searching for <span className="font-medium text-zinc-200">“{searchQuery}”</span>
                  </>
                )}
              </span>
              <button
                type="button"
                onClick={clearFilter}
                className="font-medium text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-white/10">
          {filteredPosts.length === 0 ? (
            <div className="border-b border-white/10 py-16 text-center">
              <h2 className="text-balance text-xl font-semibold text-white">
                No posts found
              </h2>
              <p className="mt-2 text-pretty text-sm text-zinc-500">
                Try another search or clear the current filters.
              </p>
              <button
                type="button"
                onClick={clearFilter}
                className="mt-6 text-sm font-medium text-zinc-300 underline decoration-zinc-700 underline-offset-4 transition-colors hover:text-white"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <article
                key={post.id}
                itemScope
                itemType="https://schema.org/BlogPosting"
                className="border-b border-white/10 py-8 sm:py-10"
              >
                <time
                  dateTime={post.date}
                  className="block text-xs tabular-nums text-zinc-500"
                >
                  {new Date(post.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  • {post.readingTime} min read
                </time>

                <Link to={articlePath(post.id)} className="group mt-3 inline-block">
                  <h2
                    itemProp="headline"
                    className="font-blog max-w-3xl text-balance text-2xl font-semibold leading-tight text-white transition-colors group-hover:text-zinc-300 sm:text-3xl"
                  >
                    {post.title}
                  </h2>
                </Link>

                <p
                  itemProp="description"
                  className="font-blog mt-4 max-w-3xl text-pretty text-base leading-7 text-zinc-400"
                >
                  {post.excerpt}
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`${BLOG_PATH}?tag=${encodeURIComponent(tag)}`}
                        className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                          selectedTag === tag
                            ? "border-zinc-500 bg-zinc-800 text-white"
                            : "border-white/10 bg-white/[0.025] text-zinc-500 hover:border-white/20 hover:text-zinc-200"
                        }`}
                      >
                        {tag}
                      </Link>
                    ))}
                  </div>

                  <Link
                    to={articlePath(post.id)}
                    className="inline-flex items-center text-sm font-medium text-zinc-300 transition-colors hover:text-white"
                  >
                    Read article <span className="ml-1" aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}

export default BlogList;

