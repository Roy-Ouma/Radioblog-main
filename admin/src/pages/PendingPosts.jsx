import React, { useEffect, useState } from "react";
import axios from "axios";
import useStore from "../store";
import { API_URI } from "../utils";
import { toast } from "sonner";
import { Pagination, Button, Group, Badge } from "@mantine/core";
import ConfirmDialog from "../components/ConfirmDialog";
import EditPostModal from "../components/EditPostModal";

const PendingPosts = () => {
  const user = useStore((s) => s.user);
  const token = user?.token;

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [previewPost, setPreviewPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchPending = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URI}/admin/posts/pending?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res?.data?.success) {
        setPosts(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
      } else {
        toast.error(res?.data?.message || "Unable to load pending posts");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "Failed to load pending posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token]);

  const handleApprove = async (id) => {
    try {
      const res = await axios.post(`${API_URI}/admin/posts/${id}/approve`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res?.data?.success) {
        toast.success(res.data.message || "Post approved");
        setPosts((p) => p.filter((x) => x._id !== id));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        toast.error(res?.data?.message || "Unable to approve");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "Approve failed");
    }
  };

  const handleUnapproveConfirmed = async (id) => {
    try {
      const res = await axios.post(`${API_URI}/admin/posts/${id}/unapprove`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res?.data?.success) {
        toast.success(res.data.message || "Post unapproved");
        setPosts((p) => p.filter((x) => x._id !== id));
        setTotal((t) => Math.max(0, t - 1));
      } else {
        toast.error(res?.data?.message || "Unable to unapprove");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "Unapprove failed");
    }
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmTarget(null);
  };

  const handleUnapprove = (id) => {
    setConfirmAction('unapprove');
    setConfirmTarget(id);
    setConfirmOpen(true);
  };

  const handlePreview = (post) => {
    setPreviewPost(post);
    setEditingPost(null);
  };

  const handlePostUpdated = (updatedPost) => {
    // Update the post in the list
    setPosts((list) => list.map((p) => p._id === updatedPost._id ? { ...p, ...updatedPost } : p));
    setPreviewPost(updatedPost);
  };

  const handleConfirm = () => {
    if (confirmAction === 'unapprove' && confirmTarget) {
      handleUnapproveConfirmed(confirmTarget);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <h2 className="section-header">Pending Posts for Review</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-16 section-container">
          <div className="text-slate-600 dark:text-slate-400">Loading pending posts...</div>
        </div>
      ) : posts.length === 0 ? (
        <div className="section-container text-center py-16">
          <p className="muted">No pending posts to review.</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto">
          {posts.map((post) => (
            <div key={post._id} className="section-container group hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-32 h-20 flex-shrink-0">
                  <img 
                    src={post.img} 
                    alt={post.title} 
                    className="w-full h-full object-cover rounded-md" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white break-words flex-1">
                      {post.title}
                    </h3>
                    <Badge size="sm" variant="light" color="yellow">
                      ⏳ Pending
                    </Badge>
                  </div>
                  <p className="text-sm muted line-clamp-2 mb-3">
                    {(post.desc || post.description || "")?.slice(0, 180)}
                  </p>
                  <Group gap="xs" wrap="wrap">
                    <Button 
                      onClick={() => handleApprove(post._id)} 
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      ✓ Approve
                    </Button>
                    <Button 
                      onClick={() => handleUnapprove(post._id)} 
                      size="sm"
                      variant="light"
                      color="yellow"
                    >
                      ↺ Unapprove
                    </Button>
                    <Button 
                      onClick={() => handlePreview(post)} 
                      size="sm"
                      variant="light"
                      color="indigo"
                    >
                      👁️ Preview / Edit
                    </Button>
                  </Group>
                </div>
                <div className="text-sm muted text-right flex-shrink-0 min-w-max">
                  <div className="font-semibold text-slate-900 dark:text-white">
                    By: {post.user?.name}
                  </div>
                  <div className="text-xs mt-1">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center section-container">
        <Pagination 
          total={Math.max(1, Math.ceil(total / limit))} 
          page={page} 
          onChange={(p) => setPage(p)} 
        />
      </div>

      <EditPostModal
        opened={!!previewPost}
        onClose={() => setPreviewPost(null)}
        post={previewPost}
        token={token}
        onPostUpdated={handlePostUpdated}
        isApproved={previewPost?.approved}
      />

      <ConfirmDialog
        message={`Are you sure you want to ${confirmAction || 'perform this action'}?`}
        opened={confirmOpen}
        close={() => setConfirmOpen(false)}
        handleClick={handleConfirm}
      />
    </div>
  );
};

export default PendingPosts;
