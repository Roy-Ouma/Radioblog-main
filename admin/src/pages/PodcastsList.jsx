import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Modal, TextInput, Textarea } from '@mantine/core';
import useStore from '../store';
import { useNavigate } from 'react-router-dom';

const PodcastsList = () => {
  const token = useStore((s) => s.user?.token);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [total, setTotal] = useState(0);
  const [numOfPage, setNumOfPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [editing, setEditing] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchList = async (p = page) => {
    setLoading(true);
    try {
      const res = await axios.get('/api/admin/shows', {
        params: { page: p, limit, search },
        headers: { Authorization: `Bearer ${token}` },
      });
      setPodcasts(res?.data?.data || []);
      setTotal(res?.data?.total || 0);
      setNumOfPage(res?.data?.numOfPage || 1);
    } catch (err) {
      console.error(err);
      alert('Unable to fetch podcasts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(page); }, [page, search]);

  const navigate = useNavigate();

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this show?')) return;
    try {
      await axios.delete(`/api/admin/shows/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setPodcasts((p) => p.filter((x) => x._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete');
    }
  };

  const openEdit = (pod) => {
    setEditing({ ...pod });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editing?._id) return;
    setIsSaving(true);
    try {
      const payload = {
        title: editing.title,
        description: editing.description,
        category: editing.category,
        tags: (editing.tags && Array.isArray(editing.tags)) ? editing.tags : (editing.tags ? String(editing.tags).split(',').map(t => t.trim()) : []),
        thumbnail: editing.thumbnail,
      };
      const res = await axios.patch(`/api/admin/shows/${editing._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      // update local list
      setPodcasts((list) => list.map((p) => (p._id === editing._id ? res.data.data : p)));
      setEditing(null);
    } catch (err) {
      console.error(err);
      alert('Failed to update');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Podcasts</h2>
        <div className="flex items-center gap-2">
          <TextInput placeholder="Search title, description or tags" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
          <Button onClick={() => { setPage(1); setSearch(searchInput); }}>Search</Button>
          <Button component="a" href="/podcasts/create">Create Podcast</Button>
          <div>
            <Button component="a" href="/podcasts/create-show">Create Show</Button>
          </div>
        </div>
      </div>
      {loading ? <p>Loading...</p> : (
        <div className="space-y-3">
          {podcasts.length === 0 && <p>No shows yet.</p>}
          {podcasts.map((p) => (
            <div key={p._id} className="border rounded p-3 hover:shadow">
              <div className="w-full h-48 bg-gray-200 mb-3">
                {p.thumbnail ? <img src={p.thumbnail} alt={p.title} className="w-full h-full object-cover rounded" /> : null}
              </div>
              <div className="font-semibold text-lg">{p.title}</div>
              <div className="text-sm text-gray-500">{p.description?.slice(0, 120)}</div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" onClick={() => navigate(`/podcasts/${p._id}/episodes`)}>Manage Episodes</Button>
                <Button size="sm" onClick={() => navigate(`/podcasts/${p._id}`)}>View Public</Button>
                <Button size="sm" onClick={() => openEdit(p)}>Edit</Button>
                <Button size="sm" color="red" onClick={() => handleDelete(p._id)}>Delete</Button>
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between mt-4">
            <div>Showing page {page} of {numOfPage} — {total} total</div>
            <div className="flex items-center gap-2">
              <Button disabled={page <= 1} onClick={() => setPage((s) => Math.max(1, s - 1))}>Prev</Button>
              <Button disabled={page >= numOfPage} onClick={() => setPage((s) => Math.min(numOfPage, s + 1))}>Next</Button>
            </div>
          </div>
        </div>
      )}

      <Modal opened={!!editing} onClose={() => setEditing(null)} title={editing?.title || 'Edit Show'} size="lg">
        {editing && (
          <form onSubmit={handleSave} className="space-y-3">
            <TextInput label="Title" value={editing.title || ''} onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))} required />
            <Textarea label="Description" value={editing.description || ''} onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))} />
            <TextInput label="Category" value={editing.category || ''} onChange={(e) => setEditing((s) => ({ ...s, category: e.target.value }))} />
            <TextInput label="Tags (comma separated)" value={(editing.tags && editing.tags.join ? editing.tags.join(', ') : (editing.tags || ''))} onChange={(e) => setEditing((s) => ({ ...s, tags: e.target.value }))} />
            <TextInput label="Thumbnail URL" value={editing.thumbnail || ''} onChange={(e) => setEditing((s) => ({ ...s, thumbnail: e.target.value }))} />
            

            <div className="flex items-center gap-2">
              <Button type="submit" loading={isSaving}>Save</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PodcastsList;
