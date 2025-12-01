import React from "react";

const ShareButtons = ({ url, title }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    alert("Link copied!");
  };

  return (
    <div className="flex gap-3 mt-4 items-center">
      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-500 text-white px-3 py-2 rounded-lg text-sm"
      >
        WhatsApp
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white px-3 py-2 rounded-lg text-sm"
      >
        Share on X
      </a>

      {/* Facebook */}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm"
      >
        Facebook
      </a>

      {/* LinkedIn */}
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
      >
        LinkedIn
      </a>

      {/* Copy Link */}
      <button
        onClick={handleCopy}
        className="bg-gray-700 text-white px-3 py-2 rounded-lg text-sm"
      >
        Copy Link
      </button>
    </div>
  );
};

export default ShareButtons;
