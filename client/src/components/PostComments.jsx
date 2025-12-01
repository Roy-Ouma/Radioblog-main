import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast, Toaster } from "sonner";
import Button from "../components/Button";
import Profile from "../assets/profile.png";
import useStore from "../store";
import { createComment, deleteComment, fetchComments } from "../utils/apiCalls";

const PostComments = ({ postId }) => {
  const store = useStore();
  const userState = store?.user;
  const token = userState?.token;
  const userProfile = userState?.user;
  const signOut = store?.signOut;
  const [comments, setComments] = useState([]);
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
      const response = await createComment(postId, { desc }, token);
      if (response?.success) {
        setComments((prev) => [response.data, ...prev]);
        setDesc("");
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
          comments.map((comment) => (
            <div key={comment?._id} className="w-full flex gap-4 items-start">
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
                {authUser?._id === comment?.user?._id && (
                  <button
                    type="button"
                    onClick={() => handleDeleteComment(comment?._id)}
                    className="mt-3 text-sm text-red-500 hover:text-red-600 transition"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <Toaster richColors />
    </div>
  );
};

export default PostComments;
