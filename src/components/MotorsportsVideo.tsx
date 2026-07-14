import { useEffect, useState } from "react";
import { staticAssetUrl } from "../utils/static-asset";

const posterUrl = staticAssetUrl("images/motorsports-poster.jpg");
const videoUrl = staticAssetUrl("vroom.mp4");

function MotorsportsVideo() {
  const initialReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const [reduceMotion, setReduceMotion] = useState(initialReducedMotion);
  const [isVideoMounted, setIsVideoMounted] = useState(
    !initialReducedMotion,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      const prefersReducedMotion = mediaQuery.matches;
      setReduceMotion(prefersReducedMotion);

      if (!prefersReducedMotion) {
        setIsVideoMounted(true);
      }
    };

    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return (
    <div className="overflow-hidden rounded-xl border border-gray-800 bg-black aspect-video">
      {isVideoMounted ? (
        <video
          className="w-full h-full object-cover"
          src={videoUrl}
          poster={posterUrl}
          autoPlay={!reduceMotion}
          muted
          loop
          playsInline
          controls
          preload="metadata"
        />
      ) : (
        <button
          type="button"
          className="group relative w-full h-full overflow-hidden"
          onClick={() => setIsVideoMounted(true)}
          aria-label="Play motorsports video"
        >
          <img
            src={posterUrl}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
          <span className="absolute inset-0 bg-black/35 transition-colors group-hover:bg-black/20" />
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full border border-white/70 bg-black/70 px-5 py-3 text-sm font-semibold text-white shadow-lg transition-colors group-hover:bg-black">
              Play clip
            </span>
          </span>
        </button>
      )}
    </div>
  );
}

export default MotorsportsVideo;
