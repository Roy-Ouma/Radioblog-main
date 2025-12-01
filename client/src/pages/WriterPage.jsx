import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { FaUserCheck } from "react-icons/fa";
import useStore from "../store";
import { formatNumber } from "../utils";
import NoProfile from "../assets/profile.png";
import Button from "../components/Button";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import { fetchPosts, fetchWriterById, followWriter, unfollowWriter, uploadImage } from "../utils/apiCalls";
import ConfirmModal from "../components/ConfirmModal";
import { toast } from "sonner";

const WriterPage = () => {
  const store = useStore();
  const authUser = store?.user;
  const setIsLoading = store?.setIsLoading;
  const signOut = store?.signOut;
  const { id } = useParams();

  const [writer, setWriter] = useState(null);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);

  const loadWriter = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading?.(true);
      const response = await fetchWriterById(id);
      if (response?.success) {
        setWriter(response.data || response.user);
      } else {
        setWriter(null);
        toast.error(response?.message || "Unable to load writer profile.");
      }
    } catch (error) {
      setWriter(null);
      toast.error(error?.message || "Unable to load writer profile.");
    } finally {
      setIsLoading?.(false);
    }
  }, [id, setIsLoading]);

  const loadPosts = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoadingPosts(true);
      const response = await fetchPosts({ writerId: id, page, limit: 6 });
      if (response?.success) {
        setPosts(response.data || []);
        setTotalPages(Math.max(response.numOfPage || 1, 1));
      } else {
        setPosts([]);
        toast.error(response?.message || "Unable to load posts for this writer.");
      }
    } catch (error) {
      setPosts([]);
      toast.error(error?.message || "Unable to load posts for this writer.");
    } finally {
      setIsLoadingPosts(false);
    }
  }, [id, page]);

  useEffect(() => {
    loadWriter();
  }, [loadWriter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const followerIds = writer?.followers?.map((follower) => follower?.followerId) || [];
  const [isProcessingFollow, setIsProcessingFollow] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleFollow = async () => {
    if (!authUser?.token) {
      toast.error("Please sign in to follow writers.");
      return;
    }

    // optimistic update
    const myId = authUser?.user?._id;
    const currentlyFollowing = followerIds.includes(myId);

    try {
      setIsProcessingFollow(true);

      if (!currentlyFollowing) {
        // optimistically add
        setWriter((w) => ({
          ...w,
          followers: [...(w?.followers || []), { followerId: myId }],
        }));

        const res = await followWriter(id);
        if (!res?.success) {
          // revert
          setWriter((w) => ({
            ...w,
            followers: (w?.followers || []).filter((f) => f?.followerId !== myId),
          }));
          toast.error(res?.message || "Unable to follow writer.");
        } else {
          toast.success(res.message || "You are now following this writer.");
        }
      } else {
        // optimistically remove
        const prevFollowers = writer?.followers || [];
        setWriter((w) => ({
          ...w,
          followers: (w?.followers || []).filter((f) => f?.followerId !== myId),
        }));

        const res = await unfollowWriter(id);
        if (!res?.success) {
          // revert
          setWriter((w) => ({ ...w, followers: prevFollowers }));
          toast.error(res?.message || "Unable to unfollow writer.");
        } else {
          toast.success(res.message || "You have unfollowed this writer.");
        }
      }
    } catch (error) {
      toast.error(error?.message || "Unable to update follow status.");
    } finally {
      setIsProcessingFollow(false);
    }
  };

  // Profile tabs for the owner
  const [activeTab, setActiveTab] = useState("profile");
  const fileInputRef = React.useRef();

  const handleSignOut = () => {
    signOut?.();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading?.(true);
      const res = await uploadImage(file);
      if (res?.success && res?.url) {
        // update user image locally for immediate feedback
        setWriter((w) => ({ ...w, image: res.url }));
        // optionally you can call profile update endpoint to persist user image
        toast.success("Profile picture updated.");
      } else {
        toast.error(res?.message || "Image upload failed.");
      }
    } catch (err) {
      toast.error(err?.message || "Image upload failed.");
    } finally {
      setIsLoading?.(false);
    }
  };

  if (!writer) {
    return (
      <div className="w-full h-full py-16 flex items-center justify-center ">
        <span className="text-lg text-slate-500 dark:text-slate-400">Writer not found.</span>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-10 2xl:px-20 py-8 md:py-12 2xl:py-16 space-y-12">
      {/* Profile Hero Section */}
      <section className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-xl p-6 md:p-10 lg:p-12 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          {/* Profile Image */}
          <div className="flex justify-center md:justify-start">
            <img
              src={writer?.image || NoProfile}
              alt={writer?.name}
              className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-white dark:border-gray-700 shadow-lg"
            />
          </div>

          {/* Profile Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">{writer?.name}</h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-400">Content Creator</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4 space-y-1">
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(writer?.followers?.length ?? 0)}
                </p>
                <span className="text-sm text-gray-600 dark:text-gray-400">Followers</span>
              </div>
              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4 space-y-1">
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(writer?.postsCount ?? posts.length)}
                </p>
                <span className="text-sm text-gray-600 dark:text-gray-400">Posts</span>
              </div>
              <div className="bg-white dark:bg-gray-700/50 rounded-lg p-4 space-y-1">
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(writer?.totalViews ?? 0)}
                </p>
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Views</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              {authUser?.token && (
                <>
                  {!followerIds.includes(authUser?.user?._id) ? (
                    <Button
                      label="Follow Writer"
                      onClick={handleFollow}
                      styles="text-white font-semibold px-6 py-2 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg transition-shadow"
                    />
                  ) : (
                    <>
                      <button
                        onClick={() => setConfirmOpen(true)}
                        className="px-6 py-2 rounded-lg bg-gray-600 dark:bg-gray-700 text-white font-semibold hover:bg-gray-700 transition-shadow flex items-center gap-2"
                      >
                        <span>Unfollow</span>
                        <FaUserCheck />
                      </button>
                      <ConfirmModal
                        opened={confirmOpen}
                        title="Unfollow writer"
                        message={`Unfollow ${writer?.name}?`}
                        confirmLabel="Unfollow"
                        cancelLabel="Cancel"
                        onCancel={() => setConfirmOpen(false)}
                        onConfirm={async () => {
                          setConfirmOpen(false);
                          await handleFollow();
                        }}
                      />
                    </>
                  )}
                </>
              )}

              {/* Profile tabs shown when viewing your own profile */}
              {authUser?.user?._id === writer?._id && (
                <div className="flex items-center gap-2">
                  <button
                    className="px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change Picture
                  </button>
                  <button 
                    className="px-4 py-2 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold hover:bg-red-100 dark:hover:bg-red-900/50 transition"
                    onClick={handleSignOut}
                  >
                    Sign Out
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="space-y-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Published Posts</h2>
        
        {isLoadingPosts ? (
          <div className="w-full py-16 flex justify-center">
            <span className="text-base text-slate-500">Loading posts...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className="w-full py-16 flex justify-center">
            <span className="text-base text-slate-500 dark:text-slate-400">
              This writer has not published any posts yet.
            </span>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {posts.map((post, index) => (
                <Card key={post?._id || index} post={post} index={index} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="w-full flex items-center justify-center pt-8">
                <Pagination
                  totalPages={totalPages}
                  currentPage={page}
                  onPageChange={setPage}
                  isLoading={isLoadingPosts}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default WriterPage;
