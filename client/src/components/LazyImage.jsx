import React from 'react';

// Simple lazy-loading image wrapper that falls back to native lazy loading.
const LazyImage = ({ src, alt = '', className = '', style = {}, onError, ...props }) => {
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading="lazy"
      decoding="async"
      onError={onError}
      {...props}
    />
  );
};

export default LazyImage;
