import { useState } from "react";

const Gallery = ({ images = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return (
      <div className="w-full h-72 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        Fotoğraf yok
      </div>
    );
  }

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full">
      {/* ANA FOTOĞRAF */}
      <div className="relative w-full h-80 md:h-[420px] bg-gray-100 rounded-xl overflow-hidden">
        {/* Swipe için */}
        <div
          className="w-full h-full touch-pan-x"
          onTouchStart={(e) => (this.startX = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            const endX = e.changedTouches[0].clientX;
            if (this.startX - endX > 50) goNext();
            if (endX - this.startX > 50) goPrev();
          }}
        >
          <img
            src={images[activeIndex]}
            alt=""
            className="w-full h-full object-contain transition-opacity duration-300"
            loading="lazy"
          />
        </div>

        {/* Sol–Sağ Butonlar (Desktop) */}
        <button
          onClick={goPrev}
          className="hidden md:flex absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
        >
          ‹
        </button>

        <button
          onClick={goNext}
          className="hidden md:flex absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full hover:bg-black/60"
        >
          ›
        </button>
      </div>

      {/* THUMBNAILS */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, index) => (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`border rounded-lg overflow-hidden cursor-pointer ${
                activeIndex === index ? "border-blue-600" : "border-gray-300"
              }`}
            >
              <img
                src={img}
                alt="thumb"
                className="w-full h-16 object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
