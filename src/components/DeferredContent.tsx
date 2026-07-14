import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

interface DeferredContentProps {
  children: ReactNode;
  fallback: ReactNode;
  rootMargin?: string;
}

function DeferredContent({
  children,
  fallback,
  rootMargin = "320px",
}: DeferredContentProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || isVisible) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(container);

    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return <div ref={containerRef}>{isVisible ? children : fallback}</div>;
}

export default DeferredContent;
