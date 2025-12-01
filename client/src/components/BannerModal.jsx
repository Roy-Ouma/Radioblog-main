import React, { useEffect, useState } from 'react';
import { fetchBanners } from '../utils/apiCalls';
import { FiX } from 'react-icons/fi';

const BannerModal = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [bannerRef, setBannerRef] = useState(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const response = await fetchBanners();
        if (response?.success && response.data?.length > 0) {
          setBanners(response.data);
          // Randomly select a banner
          setCurrentIndex(Math.floor(Math.random() * response.data.length));
        }
      } catch (err) {
        console.error('Error loading banners:', err);
      }
    };

    loadBanners();
  }, []);

  // Show modal after 3 seconds (only once per session)
  useEffect(() => {
    if (banners.length === 0 || hasShown) return;

    const timer = setTimeout(() => {
      setIsOpen(true);
      setHasShown(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [banners, hasShown]);

  // Rotate banners every 5 seconds when modal is open
  useEffect(() => {
    if (!isOpen || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isOpen, banners.length]);

  // Handle scroll to show/hide banner
  useEffect(() => {
    if (!isOpen || banners.length === 0 || !bannerRef) return;

    const handleScroll = () => {
      const rect = bannerRef.getBoundingClientRect();
      const isVisible = rect.bottom > window.innerHeight * 0.5;
      setIsInView(isVisible);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isOpen, banners.length, bannerRef]);

  if (!isOpen || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  return (
    <>
      {/* Banner - Relative Positioning Before Footer */}
      <div 
        ref={setBannerRef}
        className={`w-11/12 mx-auto md:w-full md:max-w-4xl md:mx-auto py-8 transition-all duration-300 ${
          isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}
      >
        <div className="relative h-40 md:h-48 rounded-lg overflow-hidden shadow-2xl group">
          {/* Background Image with Fade Transition */}
          <img
            src={currentBanner.image}
            alt={currentBanner.title}
            className="absolute inset-0 w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
          />

          {/* Dark Gradient Overlay - allows text readability and page visibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/60 to-black/50" />

          {/* Content Overlay */}
          <div className="relative h-full px-4 md:px-6 py-4 md:py-5 flex flex-col md:flex-row gap-3 md:gap-4 items-center justify-between">
            {/* Left: Title & Description */}
            <div className="flex-1 space-y-1 text-white min-w-0">
              <h3 className="text-base md:text-lg font-bold line-clamp-1">
                {currentBanner.title}
              </h3>
              {currentBanner.description && (
                <p className="text-xs md:text-sm text-white/80 line-clamp-1">
                  {currentBanner.description}
                </p>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {banners.length > 1 && (
                <div className="hidden sm:flex items-center gap-1">
                  <button
                    onClick={handlePrev}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded transition-all text-sm"
                    aria-label="Previous banner"
                  >
                    ◀
                  </button>
                  <span className="text-xs text-white/60 px-1.5">
                    {currentIndex + 1}/{banners.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded transition-all text-sm"
                    aria-label="Next banner"
                  >
                    ▶
                  </button>
                </div>
              )}

              {currentBanner.link && (
                <a
                  href={currentBanner.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 md:px-4 py-1.5 md:py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs md:text-sm font-semibold rounded transition-all duration-200 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  View
                </a>
              )}

              <button
                onClick={handleClose}
                className="p-1.5 text-white/70 hover:text-white hover:bg-white/20 rounded transition-all flex-shrink-0"
                aria-label="Close banner"
              >
                <FiX className="w-4 h-4 md:w-5 md:h-5" />
              </button>
            </div>
          </div>

          {/* Slideshow Indicators - Dot Navigation */}
          {banners.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentIndex
                      ? 'bg-white w-2.5 h-2.5 shadow-lg'
                      : 'bg-white/40 hover:bg-white/60 w-2 h-2'
                  }`}
                  aria-label={`Go to banner ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BannerModal;
