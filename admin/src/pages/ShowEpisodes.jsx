import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, TextInput, Textarea } from '@mantine/core';
import useStore from '../store';
import { useParams } from 'react-router-dom';

const ShowEpisodes = () => {
  const { id: showId } = useParams();
  const token = useStore((s) => s.user?.token);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({ thumbnail: 0, audio: 0 });
  const [isUploading, setIsUploading] = useState(false);

  const fetchEpisodes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/podcasts/${showId}/episodes`);
      setEpisodes(res?.data?.data || res?.data || []);
    } catch (err) {
      console.error(err);
      alert('Unable to load episodes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEpisodes(); }, [showId]);

  const uploadFile = async (file, type = 'audio') => {
    const form = new FormData();
    form.append('file', file);
    try {
      setIsUploading(true);
      const res = await axios.post('/api/storage/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.lengthComputable) return;
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress((p) => ({ ...p, [type]: percent }));
        },
      });
      return res?.data?.url;
    } finally {
      setIsUploading(false);
      // leave progress at 100 for a short while then reset
      setTimeout(() => setUploadProgress({ thumbnail: 0, audio: 0 }), 800);
    }
  };

  const openCreate = () => setEditing({ title: '', description: '', thumbnail: '', audioUrl: '', duration: 0, publishDate: new Date() });

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing) return;
    setIsSaving(true);
    try {
      let thumbUrl = editing.thumbnail;
      let audioUrl = editing.audioUrl;
      if (thumbnailFile) thumbUrl = await uploadFile(thumbnailFile, 'thumbnail');
      if (audioFile) audioUrl = await uploadFile(audioFile, 'audio');

      const payload = {
        title: editing.title,
        description: editing.description,
        thumbnail: thumbUrl,
        audioUrl,
        duration: editing.duration,
        publishDate: editing.publishDate,
        tags: editing.tags || [],
      };

      if (editing._id) {
        await axios.patch(`/api/admin/episodes/${editing._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`/api/admin/shows/${showId}/episodes`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }

      setEditing(null);
      setThumbnailFile(null);
      setAudioFile(null);
      fetchEpisodes();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (epId) => {
    if (!window.confirm('Delete episode?')) return;
    try {
      await axios.delete(`/api/admin/episodes/${epId}`, { headers: { Authorization: `Bearer ${token}` } });
      setEpisodes((s) => s.filter((e) => e._id !== epId));
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  };

  const openEdit = (ep) => {
    setEditing({ ...ep, publishDate: ep.publishDate ? new Date(ep.publishDate) : new Date() });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Manage Episodes</h2>
        <Button onClick={openCreate}>Create Episode</Button>
      </div>

      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {episodes.length === 0 && <div className="text-gray-500">No episodes yet for this show.</div>}
          {episodes.map((ep) => (
            <div key={ep._id} className="flex items-center gap-4 border rounded p-3">
              <div className="w-20 h-20 overflow-hidden rounded">
                <img src={ep.thumbnail} alt={ep.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{ep.title}</div>
                <div className="text-sm text-slate-500">{new Date(ep.publishDate).toLocaleString()}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => openEdit(ep)}>Edit</Button>
                <Button size="sm" color="red" onClick={() => handleDelete(ep._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal opened={!!editing} onClose={() => setEditing(null)} title={editing?.title || 'New Episode'} size="lg">
        {editing && (
          <form onSubmit={handleSave} className="space-y-3">
            <TextInput label="Title" value={editing.title || ''} onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))} required />
            <Textarea label="Description" value={editing.description || ''} onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))} />
            <TextInput label="Duration (seconds)" value={editing.duration || 0} onChange={(e) => setEditing((s) => ({ ...s, duration: Number(e.target.value || 0) }))} />
            <div>
              <label className="block mb-1">Publish Date</label>
              <input
                type="datetime-local"
                className="w-full p-2 border rounded"
                value={editing.publishDate ? new Date(editing.publishDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => setEditing((s) => ({ ...s, publishDate: e.target.value ? new Date(e.target.value) : null }))}
              />
            </div>
            <TextInput label="Tags (comma separated)" value={(editing.tags && Array.isArray(editing.tags)) ? editing.tags.join(', ') : (editing.tags || '')} onChange={(e) => setEditing((s) => ({ ...s, tags: e.target.value }))} />

            <div>
              <label className="block mb-1">Thumbnail (optional)</label>
              {editing.thumbnail ? (
                <div className="mb-2">
                  <img src={editing.thumbnail} alt="current" className="w-32 h-32 object-cover rounded" />
                  <div className="text-sm text-slate-500">Current thumbnail (choose a file below to replace)</div>
                </div>
              ) : null}
              <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
              {uploadProgress.thumbnail > 0 && (
                <div className="w-full bg-gray-200 rounded h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded" style={{ width: `${uploadProgress.thumbnail}%` }} />
                </div>
              )}
            </div>

            <div>
              <label className="block mb-1">Audio File</label>
              {editing.audioUrl ? (
                <div className="mb-2">
                  <audio src={editing.audioUrl} controls className="w-full" />
                  <div className="text-sm text-slate-500">Current audio (choose a file below to replace)</div>
                </div>
              ) : null}
              <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
              {uploadProgress.audio > 0 && (
                <div className="w-full bg-gray-200 rounded h-2 mt-2">
                  <div className="bg-green-500 h-2 rounded" style={{ width: `${uploadProgress.audio}%` }} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="submit" loading={isSaving || isUploading} disabled={isUploading}>{isUploading ? 'Uploading...' : 'Save'}</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default ShowEpisodes;
