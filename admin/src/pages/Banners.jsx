import React, { useEffect, useState } from 'react';
import { Button, Modal, TextInput, Textarea, Switch, NumberInput, useMantineColorScheme } from '@mantine/core';
import { modals } from '@mantine/modals';
import useStore from '../store';
import { toast } from 'sonner';
import { uploadFile } from '../utils';

const Banners = () => {
  const token = useStore((s) => s.user?.token);
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === 'dark';

  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    link: '',
    isActive: true,
    order: 0,
  });

  const API_URL = process.env.REACT_APP_API_URL || '/api';

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/admin/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const j = await res.json();
      if (j.success) {
        setBanners(j.data || []);
      }
    } catch (err) {
      console.error('Error fetching banners', err);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageUpload = async (file) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      setFormData((prev) => ({ ...prev, image: url }));
      toast.success('Image uploaded');
    } catch (err) {
      console.error('Image upload failed', err);
      toast.error('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.image) {
      toast.error('Title and image are required');
      return;
    }

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `${API_URL}/admin/banners/${editingId}`
        : `${API_URL}/admin/banners`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const j = await res.json();
      if (j.success) {
        toast.success(editingId ? 'Banner updated' : 'Banner created');
        setModalOpen(false);
        setEditingId(null);
        setFormData({
          title: '',
          description: '',
          image: '',
          link: '',
          isActive: true,
          order: 0,
        });
        fetchBanners();
      } else {
        toast.error(j.message || 'Failed to save banner');
      }
    } catch (err) {
      console.error('Error saving banner', err);
      toast.error('Failed to save banner');
    }
  };

  const handleEdit = (banner) => {
    setFormData(banner);
    setEditingId(banner._id);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    modals.openConfirmModal({
      title: 'Delete banner',
      children: <div>Are you sure you want to delete this banner?</div>,
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          const res = await fetch(`${API_URL}/admin/banners/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });

          const j = await res.json();
          if (j.success) {
            toast.success('Banner deleted');
            fetchBanners();
          } else {
            toast.error(j.message || 'Failed to delete banner');
          }
        } catch (err) {
          console.error('Error deleting banner', err);
          toast.error('Failed to delete banner');
        }
      },
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      link: '',
      isActive: true,
      order: 0,
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className='mb-8'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='text-3xl font-bold text-slate-900 dark:text-white'>Banner Management</h2>
            <p className='text-sm text-slate-500 dark:text-slate-400 mt-1'>Create and manage promotional banners</p>
          </div>
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            Add Banner
          </Button>
        </div>
      </div>

      {loading ? (
        <div className='text-center py-12 text-slate-500 dark:text-slate-400'>Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className='bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-12 text-center'>
          <p className='text-slate-500 dark:text-slate-400'>No banners yet. Create one to get started!</p>
        </div>
      ) : (
        <div className='bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700'>
                <tr>
                  <th className='px-6 py-4 text-slate-900 dark:text-white font-semibold'>Title</th>
                  <th className='px-6 py-4 text-slate-900 dark:text-white font-semibold'>Image</th>
                  <th className='px-6 py-4 text-slate-900 dark:text-white font-semibold'>Link</th>
                  <th className='px-6 py-4 text-slate-900 dark:text-white font-semibold'>Status</th>
                  <th className='px-6 py-4 text-slate-900 dark:text-white font-semibold'>Order</th>
                  <th className='px-6 py-4 text-slate-900 dark:text-white font-semibold'>Actions</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200 dark:divide-slate-700'>
                {banners.map((banner) => (
                  <tr key={banner._id} className='hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors'>
                    <td className='px-6 py-4 text-slate-900 dark:text-white font-medium'>{banner.title}</td>
                    <td className='px-6 py-4'>
                      <img
                        src={banner.image}
                        alt={banner.title}
                        className='h-12 w-12 object-cover rounded-lg border border-slate-200 dark:border-slate-600'
                      />
                    </td>
                    <td className='px-6 py-4'>
                      {banner.link ? (
                        <a
                          href={banner.link}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-blue-600 dark:text-blue-400 hover:underline text-sm truncate max-w-xs'
                        >
                          {banner.link}
                        </a>
                      ) : (
                        <span className='text-slate-400'>—</span>
                      )}
                    </td>
                    <td className='px-6 py-4'>
                      {banner.isActive ? (
                        <span className='inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full'>✓ Active</span>
                      ) : (
                        <span className='inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded-full'>✗ Inactive</span>
                      )}
                    </td>
                    <td className='px-6 py-4 text-slate-900 dark:text-white'>{banner.order}</td>
                    <td className='px-6 py-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleEdit(banner)}
                          className='px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className='px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors'
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        opened={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Banner' : 'Create New Banner'}
        centered
        size="lg"
      >
        <div className='space-y-5'>
          <TextInput
            label='Title'
            placeholder='Enter banner title'
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            className='dark:text-white'
          />

          <Textarea
            label='Description'
            placeholder='Enter banner description'
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />

          <div className='bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-700'>
            <label className='block text-sm font-semibold text-slate-900 dark:text-white mb-3'>Banner Image</label>
            {formData.image && (
              <div className='mb-4'>
                <img
                  src={formData.image}
                  alt='Preview'
                  className='h-32 w-full object-cover rounded-lg border border-slate-200 dark:border-slate-600'
                />
              </div>
            )}
            <input
              type='file'
              accept='image/*'
              onChange={(e) => handleImageUpload(e.target.files?.[0])}
              disabled={isUploading}
              className='block w-full text-sm text-slate-500 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700'
            />
            {isUploading && <span className='text-sm text-slate-500 dark:text-slate-400 mt-2 block'>Uploading...</span>}
          </div>

          <TextInput
            label='Link (optional)'
            placeholder='https://example.com'
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />

          <NumberInput
            label='Display Order'
            value={formData.order}
            onChange={(val) => setFormData({ ...formData, order: val || 0 })}
            min={0}
          />

          <Switch
            label='Active'
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.currentTarget.checked })}
          />

          <div className='flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700'>
            <Button onClick={handleSave} className='flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold'>
              {editingId ? 'Update Banner' : 'Create Banner'}
            </Button>
            <Button onClick={closeModal} variant='outline' className='flex-1'>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Banners;
