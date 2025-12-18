import React, { useState } from 'react';
import { Button, TextInput, Textarea } from '@mantine/core';
import axios from 'axios';
import useStore from '../store';

const CreatePodcast = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = useStore((s) => s.user?.token);

  const uploadFile = async (file) => {
    const form = new FormData();
    form.append('file', file);
    const res = await axios.post('/api/storage/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res?.data?.url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let thumbnailUrl = '';
      let audioUrl = '';
      if (thumbnailFile) thumbnailUrl = await uploadFile(thumbnailFile);
      if (audioFile) audioUrl = await uploadFile(audioFile);

      const payload = {
        title,
        description,
        category,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        thumbnail: thumbnailUrl,
        audioUrl,
      };

      await axios.post('/api/admin/podcasts', payload, { headers: { Authorization: `Bearer ${token}` } });
      alert('Podcast created');
      setTitle(''); setDescription(''); setCategory(''); setTags(''); setThumbnailFile(null); setAudioFile(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create Podcast</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <TextInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        <TextInput label="Category" value={category} onChange={(e) => setCategory(e.target.value)} />
        <TextInput label="Tags (comma separated)" value={tags} onChange={(e) => setTags(e.target.value)} />

        <div>
          <label className="block mb-1">Thumbnail</label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
        </div>

        <div>
          <label className="block mb-1">Audio File</label>
          <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files?.[0] || null)} />
        </div>

        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Uploading...' : 'Create Podcast'}</Button>
      </form>
    </div>
  );
};

export default CreatePodcast;
