import React, { useEffect, useState } from 'react';
import { fetchPodcasts } from '../utils/apiCalls';
import PodcastCard from '../components/PodcastCard';

const Podcasts = () => {
  const [podcasts, setPodcasts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const res = await fetchPodcasts({ limit: 24 });
      if (!mounted) return;
      if (res?.success) setPodcasts(res.data || res?.data || []);
      setIsLoading(false);
    };
    load();
    return () => (mounted = false);
  }, []);

  return (
    <div className="w-full px-4 md:px-10 py-8">
      <h1 className="text-3xl font-bold mb-4">Podcasts</h1>
      {isLoading ? (
        <div>Loading podcasts...</div>
      ) : podcasts.length === 0 ? (
        <div className="text-center text-gray-500">No podcasts available yet, check back soon!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {podcasts.map((p) => (
            <PodcastCard key={p._id} podcast={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Podcasts;
