import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { fetchEpisodeById, fetchEpisodesByShow, fetchEpisodeComments, postEpisodeComment } from '../utils/apiCalls';
import { FaPlay, FaPause, FaForward, FaBackward } from 'react-icons/fa';

const PodcastDetail = () => {
  const { id } = useParams();
  const [podcast, setPodcast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playlist, setPlaylist] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setIsLoading(true);
      const res = await fetchEpisodeById(id);
      if (!mounted) return;
      if (res?.success) {
        setPodcast(res.data);
        // fetch playlist for same show
        if (res.data.show) {
          const listRes = await fetchEpisodesByShow(res.data.show);
          if (listRes?.success) setPlaylist(listRes.data || listRes?.data || []);
        }
        // fetch comments
        const cRes = await fetchEpisodeComments(id);
        if (cRes?.success) setComments(cRes.data || cRes?.data || []);
      }
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

  const playEpisodeById = (epId) => {
    // navigate to same route but different id
    window.location.href = `/podcast/${epId}`;
  };

  const handleNextPrev = (direction) => {
    if (!playlist || !podcast) return;
    const idx = playlist.findIndex((p) => String(p._id) === String(podcast._id));
    if (idx === -1) return;
    const nextIdx = direction === 'next' ? idx + 1 : idx - 1;
    if (nextIdx < 0 || nextIdx >= playlist.length) return;
    playEpisodeById(playlist[nextIdx]._id);
  };

  const submitComment = async (e) => {
    e.preventDefault();
    try {
      const token = JSON.parse(localStorage.getItem('masenoAuthState') || '{}')?.token || JSON.parse(localStorage.getItem('userInfo') || '{}')?.token;
      const res = await postEpisodeComment(id, { desc: commentText }, token);
      if (res?.success) {
        setComments((c) => [res.data, ...c]);
        setCommentText('');
      } else {
        alert(res.message || 'Failed to post comment');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to post comment');
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
          <button onClick={() => handleNextPrev('prev')} className="px-3 py-2 bg-gray-200 rounded"> <FaBackward /> </button>
          <button onClick={() => handleNextPrev('next')} className="px-3 py-2 bg-gray-200 rounded"> <FaForward /> </button>
          <div className="flex items-center gap-2">
            <label className="text-sm">Volume</label>
            <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => setVolume(Number(e.target.value))} />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold">Comments</h3>
          <form onSubmit={submitComment} className="mt-2">
            <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)} className="w-full p-2 border rounded" rows={3} placeholder="Add a comment"></textarea>
            <div className="mt-2"><button type="submit" className="px-4 py-2 bg-black text-white rounded">Post comment</button></div>
          </form>

          <div className="mt-4 space-y-3">
            {comments.length === 0 ? <div className="text-gray-500">No comments yet.</div> : comments.map((c) => (
              <div key={c._id} className="border rounded p-3">
                <div className="font-semibold">{c.user?.name || 'Anonymous'}</div>
                <div className="text-sm text-gray-600">{c.desc}</div>
                <div className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</div>
              </div>
            ))}
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
