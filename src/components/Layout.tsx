import { Suspense, useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { BLOG_PATH } from "../site";
import SEO from "./SEO";
import StructuredData from "./StructuredData";

const HEADER_BRAND_SCROLL_THRESHOLD = 96;

function Layout() {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const isBlogIndex =
    location.pathname === "/blog" || location.pathname === BLOG_PATH;
  const [hasScrolledPastHeroTitle, setHasScrolledPastHeroTitle] = useState(
    () => window.scrollY > HEADER_BRAND_SCROLL_THRESHOLD,
  );
  const showHeaderBrand = !isHomePage || hasScrolledPastHeroTitle;

  useEffect(() => {
    const updateHeaderBrand = () => {
      setHasScrolledPastHeroTitle(
        window.scrollY > HEADER_BRAND_SCROLL_THRESHOLD,
      );
    };

    updateHeaderBrand();
    window.addEventListener("scroll", updateHeaderBrand, { passive: true });

    return () => window.removeEventListener("scroll", updateHeaderBrand);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <SEO
        title={isBlogIndex ? "Blog" : undefined}
        description={
          isBlogIndex
            ? "Blog posts by Dhaiwat Pandya about Ethereum development and other topics."
            : undefined
        }
      />
      {isHomePage && <StructuredData type="person" />}
      {isBlogIndex && <StructuredData type="blog" />}
      
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              aria-hidden={!showHeaderBrand}
              tabIndex={showHeaderBrand ? undefined : -1}
              className={`text-base font-semibold text-white transition-opacity duration-200 hover:text-zinc-300 ${
                showHeaderBrand ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              Dhaiwat Pandya
            </Link>

            <div className="flex items-center gap-5 text-sm">
              <Link
                to="/"
                className={`font-medium transition-colors ${
                  location.pathname === "/"
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                Home
              </Link>
              <Link
                to={BLOG_PATH}
                className={`font-medium transition-colors ${
                  location.pathname.startsWith("/blog")
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-200"
                }`}
              >
                Blog
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <Suspense
          fallback={<div className="py-24 text-center text-sm text-zinc-500">Loading page…</div>}
        >
          <Outlet />
        </Suspense>
      </main>

      <footer className="mt-24 border-t border-white/10">
        <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-zinc-600 sm:px-8">
          <p>© {new Date().getFullYear()} Dhaiwat Pandya · Hosted on IPFS</p>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
