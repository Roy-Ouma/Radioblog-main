import React from 'react';

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
