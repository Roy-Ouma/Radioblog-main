import React from 'react';
import { Link } from 'react-router-dom';

const PodcastCard = ({ podcast }) => {
  const thumb = podcast.thumbnail || podcast.img || '';
  const short = (podcast.description || '').slice(0, 140) + (podcast.description && podcast.description.length > 140 ? '...' : '');

  return (
    <Link to={`/podcast/${podcast._id}`} className="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700">
        {thumb ? <img src={thumb} alt={podcast.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold">{podcast.title}</h3>
        <p className="text-sm text-gray-500 mt-2">{short}</p>
      </div>
    </Link>
  );
};

export default PodcastCard;
