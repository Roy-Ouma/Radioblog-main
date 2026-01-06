import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";
import Button from "../components/Button";
import Profile from "../assets/profile.png";
import useStore from "../store";
import { createComment, deleteComment, fetchComments, likeComment, unlikeComment } from "../utils/apiCalls";

const PostComments = ({ postId }) => {
  const store = useStore();
  const userState = store?.user;
  const token = userState?.token;
  const userProfile = userState?.user;
  const signOut = store?.signOut;
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null); // comment id being replied to
  const [desc, setDesc] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const authUser = useMemo(() => userProfile, [userProfile]);
  const isAuthenticated = Boolean(token);

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      if (!postId) return;
      setIsLoading(true);
      const response = await fetchComments(postId);
      if (isMounted) {
        if (response?.success) {
          setComments(response.data || []);
        } else {
          toast.error(response?.message || "Unable to load comments.");
        }
        setIsLoading(false);
      }
    };

    loadComments();

    return () => {
      isMounted = false;
    };
  }, [postId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!postId || !desc.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = replyTo ? { desc, parent: replyTo } : { desc };
      const response = await createComment(postId, payload, token);
      if (response?.success) {
        // prepend new comment
        setComments((prev) => [response.data, ...prev]);
        setDesc("");
        setReplyTo(null);
        toast.success("Comment added.");
      } else {
        if (String(response?.message || "").toLowerCase().includes("invalid")) {
          signOut?.();
        }
        toast.error(response?.message || "Unable to add comment.");
      }
    } catch (error) {
      toast.error(error?.message || "Unable to add comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!postId || !commentId) return;
    try {
      const result = await deleteComment(postId, commentId, token);
      if (result?.success) {
        setComments((prev) => prev.filter((comment) => comment._id !== commentId));
        toast.success("Comment deleted.");
      } else {
        if (String(result?.message || "").toLowerCase().includes("invalid")) {
          signOut?.();
        }
        toast.error(result?.message || "Unable to delete comment.");
      }
    } catch (error) {
      toast.error(error?.message || "Unable to delete comment.");
    }
  };

  const handleLikeToggle = async (comment) => {
    if (!isAuthenticated) return toast.error('Sign in to like comments');
    try {
      const already = (comment.likes || []).some((l) => String(l) === String(authUser?._id));
      const res = already ? await unlikeComment(comment._id) : await likeComment(comment._id);
      if (res?.success) {
        setComments((prev) => prev.map((c) => (c._id === comment._id ? { ...c, likes: Array(res.data?.likesCount).fill(null) } : c)));
        // reload comments to get latest structure
        const refreshed = await fetchComments(postId);
        if (refreshed?.success) setComments(refreshed.data || []);
      } else {
        toast.error(res?.message || 'Unable to update like');
      }
    } catch (err) {
      toast.error(err?.message || 'Unable to update like');
    }
  };

  return (
    <div className="w-full py-10">
      <p className="text-lg text-slate-700 dark:text-slate-400 mb-6">Post Comments</p>

      {isAuthenticated ? (
        <form className="flex flex-col mb-6" onSubmit={handleSubmit}>
          <textarea
            name="desc"
            value={desc}
            placeholder="Add comment..."
            className="bg-transparent w-full min-h-[120px] p-3 border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded"
            onChange={(event) => setDesc(event.target.value)}
            disabled={isSubmitting}
            required
          />
          <div className="w-full flex justify-end mt-3">
            <Button
              label={isSubmitting ? "Submitting..." : "Submit"}
              type="submit"
              styles="bg-orange-600 hover:bg-orange-700 text-white py-2 px-5 rounded transition disabled:opacity-60"
            />
          </div>
        </form>
      ) : (
        <Link to="/sign-in" className="flex flex-col py-8">
          <Button
            label="Sign in to comment"
            styles="flex items-center justify-center bg-white dark:bg-transparent text-black dark:text-gray-300 px-4 py-2 rounded-full border hover:border-orange-500 transition"
          />
        </Link>
      )}

      <div className="w-full flex flex-col gap-8 2xl:gap-10 px-1">
        {isLoading ? (
          <span className="text-base text-slate-500">Loading comments...</span>
        ) : comments.length === 0 ? (
          <span className="text-base text-slate-600">No comments yet. Be the first!</span>
        ) : (
          // Render top-level comments and their replies
          (() => {
            const parentComments = comments.filter((c) => !c.parent);
            const repliesMap = comments.reduce((acc, c) => {
              if (c.parent) {
                acc[c.parent] = acc[c.parent] || [];
                acc[c.parent].push(c);
              }
              return acc;
            }, {});

            return parentComments.map((comment) => (
              <div key={comment?._id} className="w-full">
                <div className="w-full flex gap-4 items-start mb-3">
                  <img
                    src={comment?.user?.image || Profile}
                    alt={comment?.user?.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="w-full">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-slate-800 dark:text-gray-200 font-medium">
                        {comment?.user?.name || "Anonymous"}
                      </p>
                      <span className="text-xs text-slate-500">
                        {comment?.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                      {comment?.desc}
                    </p>

                    <div className="mt-3 flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => setReplyTo(replyTo === comment._id ? null : comment._id)}
                        className="text-sm text-slate-600 hover:text-slate-800 transition"
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLikeToggle(comment)}
                        className="text-sm text-slate-600 hover:text-slate-800 transition"
                      >
                        Like ({comment?.likes?.length || 0})
                      </button>
                      {authUser?._id === comment?.user?._id && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comment?._id)}
                          className="text-sm text-red-500 hover:text-red-600 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {/* Reply form */}
                    {replyTo === comment._id && isAuthenticated && (
                      <form onSubmit={handleSubmit} className="mt-3">
                        <textarea
                          name="desc"
                          value={desc}
                          placeholder={`Reply to ${comment?.user?.name || 'comment'}`}
                          className="bg-transparent w-full min-h-[80px] p-3 border border-gray-300 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 rounded"
                          onChange={(event) => setDesc(event.target.value)}
                          disabled={isSubmitting}
                          required
                        />
                        <div className="w-full flex justify-end mt-2">
                          <Button
                            label={isSubmitting ? "Replying..." : "Reply"}
                            type="submit"
                            styles="bg-orange-600 hover:bg-orange-700 text-white py-1 px-4 rounded transition disabled:opacity-60"
                          />
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {repliesMap[comment._id] && (
                  <div className="pl-14 flex flex-col gap-4">
                    {repliesMap[comment._id].map((reply) => (
                      <div key={reply._id} className="w-full flex gap-4 items-start">
                        <img
                          src={reply?.user?.image || Profile}
                          alt={reply?.user?.name}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div className="w-full">
                          <div className="flex items-center gap-2">
                            <p className="text-slate-800 dark:text-gray-200 font-medium">
                              {reply?.user?.name || "Anonymous"}
                            </p>
                            <span className="text-xs text-slate-500">
                              {reply?.createdAt ? new Date(reply.createdAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
                            {reply?.desc}
                          </p>
                          <div className="mt-2 flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleLikeToggle(reply)}
                              className="text-xs text-slate-600 hover:text-slate-800 transition"
                            >
                              Like ({reply?.likes?.length || 0})
                            </button>
                            {authUser?._id === reply?.user?._id && (
                              <button
                                type="button"
                                onClick={() => handleDeleteComment(reply?._id)}
                                className="text-xs text-red-500 hover:text-red-600 transition"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ));
          })()
        )}
      </div>

      <Toaster richColors />
    </div>
  );
};

export default PostComments;
