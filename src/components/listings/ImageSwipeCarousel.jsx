import { useEffect, useMemo, useState } from "react";
import noImage from "../../assets/no-image.png";

export default function ImageSwipeCarousel({ images = [] }) {
  const normalized = useMemo(() => {
    if (!Array.isArray(images)) return [];
    return images
      .filter(Boolean)
      .map((x) => (typeof x === "string" ? x.trim() : ""))
      .filter(Boolean);
  }, [images]);

  const [index, setIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const hasImages = normalized.length > 0;
  const currentSrc = hasImages
    ? normalized[Math.min(index, normalized.length - 1)]
    : noImage;

  const prev = () => {
    if (!hasImages) return;
    setIndex((i) => (i - 1 + normalized.length) % normalized.length);
  };

  const next = () => {
    if (!hasImages) return;
    setIndex((i) => (i + 1) % normalized.length);
  };

  useEffect(() => {
    if (!isFullscreen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsFullscreen(false);
      } else if (event.key === "ArrowLeft") {
        prev();
      } else if (event.key === "ArrowRight") {
        next();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, normalized.length]);

  return (
    <>
      <div className="relative w-full overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="w-full h-[340px] sm:h-[460px] bg-slate-100 flex items-center justify-center">
        <img
          src={currentSrc}
          alt="listing"
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = noImage;
          }}
        />
      </div>

      {hasImages && normalized.length > 1 && (
        <div className="absolute left-4 top-4 rounded-full bg-slate-950/72 px-3 py-1.5 text-xs font-semibold tracking-wide text-white">
          {index + 1} / {normalized.length}
        </div>
      )}

      {hasImages && (
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="absolute right-4 top-4 flex h-11 min-w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 px-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          aria-label="Tam ekran aç"
        >
          ⛶
        </button>
      )}

      {hasImages && normalized.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-xl text-slate-700 shadow-sm transition hover:bg-white"
            aria-label="Önceki"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white/90 text-xl text-slate-700 shadow-sm transition hover:bg-white"
            aria-label="Sonraki"
          >
            ›
          </button>
        </>
      )}

      {hasImages && normalized.length > 1 && (
        <div className="flex gap-2 overflow-x-auto border-t border-slate-100 bg-slate-50/80 p-3">
          {normalized.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-16 w-20 shrink-0 overflow-hidden rounded-2xl border bg-white transition ${
                i === index ? "border-slate-900 ring-2 ring-slate-900/10" : "border-slate-200 opacity-70"
              }`}
              aria-label={`Görsel ${i + 1}`}
            >
              <img
                src={src}
                alt={`thumb-${i}`}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = noImage;
                }}
              />
            </button>
          ))}
        </div>
      )}
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4" role="dialog" aria-modal="true">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xl text-white transition hover:bg-white/20"
            aria-label="Tam ekran kapat"
          >
            ✕
          </button>

          {hasImages && normalized.length > 1 && (
            <div className="absolute left-5 top-5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-white">
              {index + 1} / {normalized.length}
            </div>
          )}

          <div className="relative flex h-full w-full max-w-6xl items-center justify-center">
            <img
              src={currentSrc}
              alt="listing fullscreen"
              className="max-h-full max-w-full rounded-2xl object-contain"
              onError={(e) => {
                e.currentTarget.src = noImage;
              }}
            />

            {hasImages && normalized.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:left-4"
                  aria-label="Önceki görsel"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-0 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/10 text-2xl text-white transition hover:bg-white/20 sm:right-4"
                  aria-label="Sonraki görsel"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
