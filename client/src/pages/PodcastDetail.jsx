import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchPodcastById } from '../utils/apiCalls';
import { FaPlay, FaPause, FaForward, FaBackward } from 'react-icons/fa';

const PodcastDetail = () => {
  const { id } = useParams();
  const [podcast, setPodcast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const res = await fetchPodcastById(id);
      if (!mounted) return;
      if (res?.success) setPodcast(res.data);
      setIsLoading(false);
    };
    load();
    return () => (mounted = false);
  }, [id]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const toggle = async () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      await audioRef.current.play();
      setPlaying(true);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!podcast) return <div className="p-6">Podcast not found</div>;

  return (
    <div className="w-full px-4 md:px-10 py-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-lg shadow p-6">
        <div className="w-full h-64 bg-gray-200 dark:bg-gray-700 mb-4">
          {podcast.thumbnail ? <img src={podcast.thumbnail} alt={podcast.title} className="w-full h-full object-cover rounded" /> : null}
        </div>
        <h1 className="text-2xl font-bold mb-2">{podcast.title}</h1>
        <div className="text-sm text-gray-500 mb-4">{podcast.category} • {podcast.duration ? `${Math.round(podcast.duration/60)}m` : ''} • {new Date(podcast.createdAt).toDateString()}</div>
        <p className="text-gray-700 dark:text-gray-200 mb-6">{podcast.description}</p>

        <div className="flex items-center gap-4">
          <audio ref={audioRef} src={podcast.audioUrl} preload="metadata" />
          <button onClick={toggle} className="px-4 py-2 bg-black text-white rounded">{playing ? <FaPause /> : <FaPlay />}</button>
          <div className="flex items-center gap-2">
            <label className="text-sm">Volume</label>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
          </div>
        </div>

        <div className="mt-6">
          <strong>Share:</strong>
          <div className="flex gap-2 mt-2">
            <a target="_blank" rel="noreferrer" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(podcast.title)}&url=${encodeURIComponent(window.location.href)}`} className="px-3 py-2 bg-blue-500 text-white rounded">Twitter</a>
            <a target="_blank" rel="noreferrer" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} className="px-3 py-2 bg-blue-700 text-white rounded">Facebook</a>
            <button onClick={() => { navigator.clipboard?.writeText(window.location.href); alert('Link copied'); }} className="px-3 py-2 bg-gray-200 rounded">Copy link</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PodcastDetail;
