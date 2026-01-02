import React, { useEffect, useState } from 'react';
import { fetchShows } from '../utils/apiCalls';
import { useNavigate } from 'react-router-dom';

const Podcasts = () => {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const res = await fetchShows({ limit: 24 });
      if (!mounted) return;
      if (res?.success) setShows(res.data || res?.data || []);
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
      ) : shows.length === 0 ? (
        <div className="text-center text-gray-500">No podcasts available yet, check back soon!</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {shows.map((s) => (
            <div key={s._id} className="border rounded p-3 cursor-pointer hover:shadow" onClick={() => navigate(`/podcasts/${s._id}`)}>
              <div className="w-full h-48 bg-gray-200 mb-3">
                {s.thumbnail ? <img src={s.thumbnail} alt={s.title} className="w-full h-full object-cover rounded" /> : null}
              </div>
              <div className="font-semibold text-lg">{s.title}</div>
              <div className="text-sm text-gray-500">{s.description?.slice(0, 120)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Podcasts;
