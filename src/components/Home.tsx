import { lazy, Suspense } from "react";
import { Link } from "react-router-dom";
import { BLOG_PATH, articlePath } from "../site";
import { blogPosts } from "../data/blog-posts";
import DeferredContent from "./DeferredContent";
import PageTransition from "./PageTransition";

const GitHubStats = lazy(() =>
  import("./GitHubStats").then(({ GitHubStats: Component }) => ({
    default: Component,
  })),
);
const LetterboxdRecent = lazy(() =>
  import("./LetterboxdRecent").then(({ LetterboxdRecent: Component }) => ({
    default: Component,
  })),
);
const MotorsportsVideo = lazy(() => import("./MotorsportsVideo"));
const TravelMap = lazy(() => import("./TravelMap"));

function Home() {

  const latestPosts = [...blogPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  return (
    <PageTransition>
      <div>
      <section className="mb-24 pt-6 sm:mb-32 sm:pt-12">
        <h1 className="max-w-4xl text-balance text-5xl font-semibold text-white sm:text-7xl">
          Dhaiwat Pandya
        </h1>
        <p className="mt-5 max-w-2xl text-pretty text-lg leading-8 text-zinc-400 sm:text-xl">
          Chasing my curiosities. Spiraling upwards.
        </p>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <a
            href="https://x.com/dhaiwat10"
            className="font-medium text-zinc-500 transition-colors hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <a
            href="https://github.com/dhaiwat10"
            className="font-medium text-zinc-500 transition-colors hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://hackmd.io/@dhaiwat10/ByA1tWTgee"
            className="font-medium text-zinc-500 transition-colors hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            CV
          </a>
          <a
            href="https://farcaster.xyz/~/profiles/3339"
            className="font-medium text-zinc-500 transition-colors hover:text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Farcaster
          </a>
        </div>
      </section>

      <section>
        <div className="mb-7 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
          <h2 className="text-balance text-2xl font-semibold text-white">Latest posts</h2>
          <Link
            to={BLOG_PATH}
            className="shrink-0 text-sm font-medium text-zinc-500 transition-colors hover:text-white"
          >
            View all <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post) => (
            <article
              key={post.id}
              className="rounded-xl border border-white/10 bg-white/[0.025] p-6 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
            >
              <Link to={articlePath(post.id)}>
                <h3 className="font-blog text-balance text-lg font-semibold leading-snug text-white transition-colors hover:text-zinc-300">
                  {post.title}
                </h3>
              </Link>

              <time dateTime={post.date} className="mt-3 block text-xs tabular-nums text-zinc-500">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} • {post.readingTime} min read
              </time>

              <p className="font-blog mt-4 mb-6 line-clamp-3 text-pretty text-sm leading-6 text-zinc-400">
                {post.excerpt}
              </p>

              <Link
                to={articlePath(post.id)}
                className="inline-flex items-center text-sm font-medium text-zinc-300 transition-colors hover:text-white"
              >
                Read article <span className="ml-1" aria-hidden="true">→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-24 sm:mt-32">
        <div className="mb-7">
          <div className="mb-3 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <h2 className="text-balance text-2xl font-semibold text-white">GitHub activity</h2>
            <a
              href="https://github.com/dhaiwat10"
              className="shrink-0 text-sm font-medium text-zinc-500 transition-colors hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              View profile <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="max-w-2xl text-pretty leading-7 text-zinc-400">
            I am always experimenting with problems I find interesting. I post a lot of these experiments on GitHub.
          </p>
        </div>

        <DeferredContent
          rootMargin="240px"
          fallback={<div className="h-48 animate-pulse rounded-xl border border-white/10 bg-white/[0.025]" />}
        >
          <Suspense
            fallback={<div className="h-48 animate-pulse rounded-xl border border-white/10 bg-white/[0.025]" />}
          >
            <GitHubStats username="dhaiwat10" />
          </Suspense>
        </DeferredContent>
      </section>

      <section className="mt-24 sm:mt-32">
        <div className="mb-7">
          <div className="mb-3 border-b border-white/10 pb-4">
            <h2 className="text-balance text-2xl font-semibold text-white">Motorsports</h2>
          </div>
          <p className="max-w-2xl text-pretty leading-7 text-zinc-400">
            Racetracks and racecars. There's nowhere I feel more free.
          </p>
        </div>

        <DeferredContent
          rootMargin="160px"
          fallback={<div className="aspect-video rounded-xl border border-white/10 bg-white/[0.025]" />}
        >
          <Suspense
            fallback={<div className="aspect-video rounded-xl border border-white/10 bg-white/[0.025]" />}
          >
            <MotorsportsVideo />
          </Suspense>
        </DeferredContent>
      </section>

      <section className="mt-24 sm:mt-32">
        <div className="mb-7">
          <div className="mb-3 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
            <h2 className="text-balance text-2xl font-semibold text-white">Recent films</h2>
            <a
              href="https://letterboxd.com/dhaiwat10"
              className="shrink-0 text-sm font-medium text-zinc-500 transition-colors hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              View all <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="max-w-2xl text-pretty leading-7 text-zinc-400">
            Movies are my favourite art form. Here are a few that I watched most recently on Letterboxd.
          </p>
        </div>

        <DeferredContent
          rootMargin="240px"
          fallback={<div className="h-72 animate-pulse rounded-xl border border-white/10 bg-white/[0.025]" />}
        >
          <Suspense
            fallback={<div className="h-72 animate-pulse rounded-xl border border-white/10 bg-white/[0.025]" />}
          >
            <LetterboxdRecent username="Dhaiwat" limit={6} />
          </Suspense>
        </DeferredContent>
      </section>

      <section id="travels" className="mt-24 sm:mt-32">
        <div className="mb-7">
          <h2 className="mb-3 border-b border-white/10 pb-4 text-balance text-2xl font-semibold text-white">Travels</h2>
          <p className="max-w-2xl text-pretty leading-7 text-zinc-400">
            Ever since I was a kid, I was fascinated with maps and travel. These are some of the places I've been fortunate enough to visit.
          </p>
        </div>

        <DeferredContent
          rootMargin="160px"
          fallback={<div className="h-[360px] rounded-xl border border-white/10 bg-white/[0.025] sm:h-[440px] lg:h-[520px]" />}
        >
          <Suspense
            fallback={<div className="h-[360px] rounded-xl border border-white/10 bg-white/[0.025] sm:h-[440px] lg:h-[520px]" />}
          >
            <TravelMap />
          </Suspense>
        </DeferredContent>
      </section>
    </div>
    </PageTransition>
  );
}

export default Home;