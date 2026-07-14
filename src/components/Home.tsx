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
      <section className="mb-16">
        <h1 className="text-5xl font-bold text-white mb-4">dhai.eth</h1>
        <h2 className="text-3xl text-gray-300 mb-6">Dhaiwat Pandya</h2>
        <p className="text-xl text-gray-400 max-w-2xl">
          Chasing my curiosities. Spiraling upwards.
        </p>

        <div className="flex flex-row gap-4 mt-4">
          <a
            href="https://x.com/dhaiwat10"
            className="text-gray-400 hover:text-white font-medium transition-colors underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter
          </a>
          <a
            href="https://github.com/dhaiwat10"
            className="text-gray-400 hover:text-white font-medium transition-colors underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
          <a
            href="https://hackmd.io/@dhaiwat10/ByA1tWTgee"
            className="text-gray-400 hover:text-white font-medium transition-colors underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            CV
          </a>
          <a
            href="https://farcaster.xyz/dhai.eth"
            className="text-gray-400 hover:text-white font-medium transition-colors underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Farcaster
          </a>
        </div>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-white">Latest Posts</h3>
          <Link
            to={BLOG_PATH}
            className="text-gray-400 hover:text-white font-medium transition-colors"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {latestPosts.map((post, index) => (
            <article
              key={post.id}
              style={{ animationDelay: `${index * 0.1}s` }}
              className="animate-slide-up rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-all bg-gray-900/50"
            >
              <Link to={articlePath(post.id)}>
                <h4 className="text-xl font-bold text-white mb-2 hover:text-gray-300 transition-colors">
                  {post.title}
                </h4>
              </Link>

              <time dateTime={post.date} className="text-sm text-gray-500">
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })} • {post.readingTime} min read
              </time>

              <p className="text-gray-400 mt-3 mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              <Link
                to={articlePath(post.id)}
                className="text-gray-400 hover:text-white font-medium text-sm transition-colors inline-flex items-center"
              >
                Read more →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-2xl font-bold text-white">GitHub Activity</h3>
            <a
              href="https://github.com/dhaiwat10"
              className="text-gray-400 hover:text-white font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View profile →
            </a>
          </div>
          <p className="text-gray-400 max-w-2xl">
            I am always experimenting with problems I find interesting. I post a lot of these experiments on my GitHub.
          </p>
        </div>

        <DeferredContent
          rootMargin="240px"
          fallback={<div className="h-48 rounded-lg border border-gray-800 bg-gray-900/50 animate-pulse" />}
        >
          <Suspense
            fallback={<div className="h-48 rounded-lg border border-gray-800 bg-gray-900/50 animate-pulse" />}
          >
            <GitHubStats username="dhaiwat10" />
          </Suspense>
        </DeferredContent>
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-2xl font-bold text-white">Motorsports</h3>
          </div>
          <p className="text-gray-400 max-w-2xl mb-4">
            Racetracks and racecars. There's nowhere I feel more free.
          </p>
        </div>

        <DeferredContent
          rootMargin="160px"
          fallback={<div className="aspect-video rounded-xl border border-gray-800 bg-gray-900/50" />}
        >
          <Suspense
            fallback={<div className="aspect-video rounded-xl border border-gray-800 bg-gray-900/50" />}
          >
            <MotorsportsVideo />
          </Suspense>
        </DeferredContent>
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-2xl font-bold text-white">Recent Films</h3>
            <a
              href="https://letterboxd.com/dhaiwat10"
              className="text-gray-400 hover:text-white font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              View all →
            </a>
          </div>
          <p className="text-gray-400 max-w-2xl">
            Movies are my favourite art form. Here are a few that I watched the most recently from my Letterboxd profile.
          </p>
        </div>

        <DeferredContent
          rootMargin="240px"
          fallback={<div className="h-72 rounded-lg border border-gray-800 bg-gray-900/50 animate-pulse" />}
        >
          <Suspense
            fallback={<div className="h-72 rounded-lg border border-gray-800 bg-gray-900/50 animate-pulse" />}
          >
            <LetterboxdRecent username="Dhaiwat" limit={6} />
          </Suspense>
        </DeferredContent>
      </section>

      <section id="travels" className="mt-16">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-white mb-3">Travels</h3>
          <p className="text-gray-400 max-w-2xl">
            Ever since I was a kid, I was fascinated with maps and travel. These are some of the places I've been fortunate enough to visit.
          </p>
        </div>

        <DeferredContent
          rootMargin="160px"
          fallback={<div className="h-[400px] md:h-[500px] lg:h-[600px] rounded-xl border border-gray-800 bg-gray-900/50" />}
        >
          <Suspense
            fallback={<div className="h-[400px] md:h-[500px] lg:h-[600px] rounded-xl border border-gray-800 bg-gray-900/50" />}
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