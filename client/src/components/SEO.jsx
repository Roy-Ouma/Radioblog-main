import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, canonical, image, author, publishedAt, updatedAt, tags = [], noIndex = false, structuredData = null }) => {
  const siteName = process.env.REACT_APP_SITE_NAME || 'Radioblog';
  const pageTitle = title ? `${title} | ${siteName}` : siteName;
  const img = image || `${process.env.REACT_APP_API_URL}/default-social.jpg`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={description || ''} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description || ''} />
      {image && <meta property="og:image" content={img} />}
      {canonical && <meta property="og:url" content={canonical} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description || ''} />
      {image && <meta name="twitter:image" content={img} />}

      {/* keywords */}
      {tags && tags.length > 0 && <meta name="keywords" content={tags.join(', ')} />}

      {/* Structured data */}
      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
};

export default SEO;
