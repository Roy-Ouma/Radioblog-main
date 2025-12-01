import React, { useEffect, useState } from "react";
import axios from "axios";
import useStore from "../store";
import { API_URI } from "../utils";
import { toast } from "sonner";
import { Modal, Pagination } from "@mantine/core";
import ConfirmDialog from "../components/ConfirmDialog";

const PendingPosts = () => {
  const user = useStore((s) => s.user);
  const token = user?.token;

  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [previewPost, setPreviewPost] = useState(null);
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
            <div key={post._id} className="section-container hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <img src={post.img} alt={post.title} className="w-32 h-20 object-cover rounded-md flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white break-words">{post.title}</h3>
                  <p className="text-sm muted line-clamp-2 mt-1">{post.desc?.slice(0, 180)}</p>
                  <div className="mt-3 flex gap-2 flex-wrap">
                    <button onClick={() => handleApprove(post._id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold text-sm transition-colors">
                      Approve
                    </button>
                    <button onClick={() => handleUnapprove(post._id)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-semibold text-sm transition-colors">
                      Unapprove
                    </button>
                    <button onClick={() => handlePreview(post)} className="px-4 py-2 bg-slate-600 hover:bg-slate-700 dark:bg-slate-700 text-white rounded-md font-semibold text-sm transition-colors">
                      Preview
                    </button>
                    <a href={`/${post.slug}/${post._id}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-sm transition-colors">
                      View Live
                    </a>
                  </div>
                </div>
                <div className="text-sm muted text-right flex-shrink-0">
                  <div className="font-semibold text-slate-900 dark:text-white">By: {post.user?.name}</div>
                  <div>{new Date(post.createdAt).toLocaleString()}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center section-container">
        <Pagination total={Math.max(1, Math.ceil(total / limit))} page={page} onChange={(p) => setPage(p)} />
      </div>

      <Modal opened={!!previewPost} onClose={() => setPreviewPost(null)} size="xl" title={previewPost?.title} centered>
        <div className="prose max-w-full dark:prose-invert text-slate-900 dark:text-white">
          <p>{previewPost?.desc}</p>
        </div>
      </Modal>

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
