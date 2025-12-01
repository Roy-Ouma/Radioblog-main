import React, { useEffect, useState } from 'react';
import { fetchBanners } from '../utils/apiCalls';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const BannerCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await fetchBanners();
        if (response?.success && response.data?.length > 0) {
          setBanners(response.data);
          setCurrentIndex(0);
        }
      } catch (err) {
        console.error('Error loading banners:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  // Auto-rotate banners every 6 seconds
  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [banners.length]);

  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <div className="w-full mb-8">
      <div className="relative w-full h-72 md:h-96 lg:h-[520px] rounded-lg overflow-hidden shadow-lg group">
        {/* Banner Image */}
        <div className="relative w-full h-full">
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        {/* Banner Content */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-2 line-clamp-2">
            {currentBanner.title}
          </h2>
          {currentBanner.description && (
            <p className="text-sm md:text-base mb-4 line-clamp-2 opacity-90">
              {currentBanner.description}
            </p>
          )}

          {currentBanner.link && (
            <a
              href={currentBanner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-fit px-6 py-2 bg-rose-600 hover:bg-rose-700 transition-colors rounded-md font-semibold text-sm md:text-base"
            >
              Learn More
            </a>
          )}
        </div>

        {/* Previous Button */}
        {banners.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 transition-colors rounded-full p-2 opacity-0 group-hover:opacity-100 duration-200"
            aria-label="Previous banner"
          >
            <FiChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Next Button */}
        {banners.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 transition-colors rounded-full p-2 opacity-0 group-hover:opacity-100 duration-200"
            aria-label="Next banner"
          >
            <FiChevronRight className="w-6 h-6 text-white" />
          </button>
        )}
      </div>

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-rose-600 w-8'
                  : 'bg-gray-400 hover:bg-gray-500 w-2'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerCarousel;
