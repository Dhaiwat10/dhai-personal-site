import { lazy, Suspense } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { BLOG_PATH } from "../site";
import { blogPosts } from "../data/blog-posts";
import { staticAssetUrl } from "../utils/static-asset";
import SEO from "./SEO";
import StructuredData from "./StructuredData";
import PageTransition from "./PageTransition";

const CodeBlock = lazy(() => import("./CodeBlock"));

function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const post = blogPosts.find((p) => p.id === id);

  if (!post) {
    return <Navigate to={BLOG_PATH} replace />;
  }

  const publishedDate = new Date(post.date).toISOString();

  return (
    <PageTransition>
      <article className="max-w-4xl mx-auto">
      <SEO
        title={post.title}
        description={post.excerpt}
        type="article"
        publishedTime={publishedDate}
        modifiedTime={publishedDate}
        tags={post.tags}
      />
      <StructuredData type="article" article={post} />
      
      <Link 
        to={BLOG_PATH}
        className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors"
      >
        ← Back to Blog
      </Link>
      
      <header className="mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">
          {post.title}
        </h1>
        
        {post.excerpt && (
          <p className="text-lg text-gray-400 mb-4">{post.excerpt}</p>
        )}
        
        <time dateTime={publishedDate} className="text-gray-500">
          {new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} • {post.readingTime} min read
        </time>
        
        <div className="flex flex-wrap gap-2 mt-4">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              to={`${BLOG_PATH}?tag=${encodeURIComponent(tag)}`}
              className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-md border border-gray-700 hover:bg-gray-700 hover:text-white transition-all"
            >
              {tag}
            </Link>
          ))}
        </div>
      </header>

      <div className="prose prose-lg max-w-none break-words">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            code({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) {
              const match = /language-(\w+)/.exec(className || "");
              const language = match ? match[1] : "";
              const source = String(children).replace(/\n$/, "");
              
              return !inline && language ? (
                <Suspense
                  fallback={
                    <pre className="my-6 overflow-x-auto rounded-lg bg-[#282c34] p-5 text-sm leading-relaxed">
                      <code>{source}</code>
                    </pre>
                  }
                >
                  <CodeBlock language={language}>{source}</CodeBlock>
                </Suspense>
              ) : (
                <code className="bg-gray-800 text-gray-300 px-1.5 py-0.5 rounded text-sm font-mono border border-gray-700" {...props}>
                  {children}
                </code>
              );
            },
            h1: ({ children }) => (
              <h1 className="text-3xl font-bold text-white mt-8 mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-2xl font-bold text-white mt-6 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-xl font-bold text-white mt-4 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-300 mb-4 leading-relaxed">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside mb-4 space-y-2 text-gray-300">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-300">
                {children}
              </ol>
            ),
            li: ({ children, id, ...props }) => (
              <li id={id} className="ml-4" {...props}>
                {children}
              </li>
            ),
            a: ({ href, children }) => {
              // Anchor links (footnotes) - use JS scroll to avoid breaking hash router
              const isAnchor = href?.startsWith('#');
              if (isAnchor && href) {
                const handleClick = (e: React.MouseEvent) => {
                  e.preventDefault();
                  // Try to find the specific element first, fallback to footnotes section
                  const targetId = href.slice(1);
                  let element = document.getElementById(targetId);
                  if (!element) {
                    // Fallback: scroll to the footnotes section
                    element = document.querySelector('.footnotes');
                  }
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                };
                return (
                  <a 
                    href={href}
                    onClick={handleClick}
                    className="text-gray-300 hover:text-white underline underline-offset-4 decoration-gray-600 hover:decoration-white transition-colors cursor-pointer"
                  >
                    {children}
                  </a>
                );
              }
              return (
                <a 
                  href={href}
                  className="text-gray-300 hover:text-white underline underline-offset-4 decoration-gray-600 hover:decoration-white transition-colors break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              );
            },
            img: ({ src, alt, loading, decoding, ...props }) => (
              <img
                src={src?.startsWith("/") ? staticAssetUrl(src) : src}
                alt={alt ?? ""}
                loading={loading ?? "lazy"}
                decoding={decoding ?? "async"}
                {...props}
              />
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-600 pl-4 italic text-gray-400 my-4">
                {children}
              </blockquote>
            ),
            // Footnote reference (the superscript number in the text)
            sup: ({ children, id, ...props }) => (
              <sup id={id} className="text-xs text-gray-400 ml-0.5" {...props}>
                {children}
              </sup>
            ),
            // Footnotes section container
            section: ({ children, className, ...props }) => {
              if (className === 'footnotes') {
                return (
                  <section className="footnotes mt-8 pt-6 border-t border-gray-700" {...props}>
                    {children}
                  </section>
                );
              }
              return <section className={className} {...props}>{children}</section>;
            },
          }}
        >
          {post.content}
        </ReactMarkdown>
      </div>
    </article>
    </PageTransition>
  );
}

export default BlogPost;

