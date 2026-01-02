import React, { useState } from 'react';
import { Button, TextInput, Textarea } from '@mantine/core';
import axios from 'axios';
import useStore from '../store';

const CreateShow = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
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
      if (thumbnailFile) thumbnailUrl = await uploadFile(thumbnailFile);

      const payload = { title, description, thumbnail: thumbnailUrl };
      await axios.post('/api/admin/shows', payload, { headers: { Authorization: `Bearer ${token}` } });
      alert('Show created');
      setTitle(''); setDescription(''); setThumbnailFile(null);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err.message || 'Failed');
    } finally { setIsSubmitting(false); }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Create Podcast Show</h2>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        <TextInput label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Textarea label="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />

        <div>
          <label className="block mb-1">Cover Image</label>
          <input type="file" accept="image/*" onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)} />
        </div>

        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Uploading...' : 'Create Show'}</Button>
      </form>
    </div>
  );
};

export default CreateShow;
