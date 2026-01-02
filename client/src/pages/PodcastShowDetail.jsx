import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchShowById } from '../utils/apiCalls';

const PodcastShowDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      const res = await fetchShowById(id);
      if (!mounted) return;
      if (res?.success) setData(res.data);
      setLoading(false);
    };
    load();
    return () => (mounted = false);
  }, [id]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Show not found</div>;

  const { show, episodes } = data;

  return (
    <div className="w-full px-4 md:px-10 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-6 items-start">
          <div className="w-48 h-48 bg-gray-200 rounded overflow-hidden">
            {show.thumbnail ? <img src={show.thumbnail} alt={show.title} className="w-full h-full object-cover" /> : null}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{show.title}</h1>
            <p className="text-gray-600 mt-2">{show.description}</p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Episodes</h2>
          {episodes.length === 0 ? (
            <div className="text-gray-500">This podcast has no episodes yet.</div>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {episodes.map((ep) => (
                <div key={ep._id} className="flex items-center gap-4 border p-3 rounded hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/podcast/${ep._id}`)}>
                  <div className="w-20 h-20 bg-gray-200 overflow-hidden rounded">
                    <img src={ep.thumbnail || show.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold">{ep.title}</div>
                    <div className="text-sm text-gray-500">{ep.description?.slice(0, 140)}</div>
                  </div>
                  <div className="text-sm text-gray-400">{new Date(ep.publishDate).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PodcastShowDetail;
