import React from "react";

const Loading = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 dark:bg-black/50 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center justify-center gap-6">
        {/* Animated Logo */}
        <div className="text-3xl md:text-5xl font-bold flex items-center gap-1 animate-pulse">
          <span className="text-gray-900 dark:text-white">Maseno</span>
          <span className="text-orange-500">Radio</span>
        </div>

        {/* Loading Bars Animation */}
        <div className="flex gap-1.5 md:gap-2 justify-center items-end h-12 md:h-16">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-sm bg-gradient-to-t from-orange-500 to-orange-400 transition-all duration-300"
              style={{
                width: i === 2 ? '6px' : '4px',
                height: i === 2 ? '48px' : '32px',
                animation: `bounce 1.4s ease-in-out infinite`,
                animationDelay: `${i * 0.12}s`,
              }}
            />
          ))}
        </div>

        {/* Optional Loading Text */}
        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium tracking-wide">
          Loading...
        </p>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scaleY(0.5);
            opacity: 0.6;
          }
          40% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Loading;
