import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Markdown from "markdown-to-jsx";
import { toast } from "sonner";
import useStore from "../store";
import { fetchPopularContent, fetchPostById, fetchWriterById, followWriter, unfollowWriter, logShare } from "../utils/apiCalls";
import PopularPost from "../components/PopularPost";
import PopularWriter from "../components/PopularWriter";
import PostComments from "../components/PostComments";
import ConfirmModal from "../components/ConfirmModal";
import { FaTwitter, FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { FiLink } from 'react-icons/fi';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { likePost, unlikePost } from '../utils/apiCalls';
import { CATEGORIES } from '../utils/constants';

const BlogDetails = () => {
  const store = useStore();
  const setIsLoading = store?.setIsLoading;
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [popularContent, setPopularContent] = useState({ posts: [], writers: [] });
  const [authorWriter, setAuthorWriter] = useState(null);
  const [authorConfirmOpen, setAuthorConfirmOpen] = useState(false);
  const currentUserId = store?.user?.user?._id;
  const [liked, setLiked] = useState(Boolean(store?.user && post?.likes?.some((l) => String(l) === String(currentUserId))));
  const [likesCount, setLikesCount] = useState(post?.likes?.length || 0);
  const [isProcessingAuthorFollow, setIsProcessingAuthorFollow] = useState(false);
  const [isFetchingPost, setIsFetchingPost] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    const loadPost = async () => {
      try {
        setIsFetchingPost(true);
        setIsLoading?.(true);
        const response = await fetchPostById(id);
        if (!isMounted) return;

        if (response?.success) {
          setPost(response.data);
          setLikesCount(response.data?.likes?.length || 0);
          setLiked(Boolean(response.data?.likes?.some((l) => String(l) === String(currentUserId))));
          // fetch writer details (followers) for follow/unfollow state
          try {
            const writerId = response.data?.user?._id;
            if (writerId) {
              const writerResp = await fetchWriterById(writerId);
              if (writerResp?.success) setAuthorWriter(writerResp.data || writerResp.user || null);
              else console.warn('fetchWriterById: server returned failure', writerResp?.message);
            } else {
              console.warn('fetchWriterById: missing writer id on post', { postId: response.data?._id });
            }
          } catch (e) {
            console.error('fetchWriterById error', e?.message || e);
          }
        } else {
          setPost(null);
          toast.error(response?.message || "Unable to load this post.");
        }
      } catch (error) {
        if (isMounted) {
          setPost(null);
          toast.error(error?.message || "Unable to load this post.");
        }
      } finally {
        setIsFetchingPost(false);
        setIsLoading?.(false);
      }
    };

    loadPost();
    return () => {
      isMounted = false;
    };
  }, [id, setIsLoading]);

  const authorFollowerIds = (authorWriter?.followers || []).map((f) => f?.followerId);
  const isFollowingAuthor = authorFollowerIds.includes(store?.user?.user?._id);

  const handleAuthorFollow = async () => {
    if (!store?.user?.token) {
      toast.error('Please sign in to follow writers.');
      return;
    }

    if (!post?.user?._id) {
      toast.error('Writer information not available.');
      return;
    }

    try {
      setIsProcessingAuthorFollow(true);
      if (!isFollowingAuthor) {
        // optimistic
        setAuthorWriter((w) => ({ ...w, followers: [...(w?.followers || []), { followerId: store.user.user._id }] }));
        const res = await followWriter(post?.user?._id);
        if (!res?.success) {
          setAuthorWriter((w) => ({ ...w, followers: (w?.followers || []).filter((f) => f?.followerId !== store.user.user._id) }));
          toast.error(res?.message || 'Unable to follow writer.');
        } else {
          toast.success(res.message || 'You are now following this writer.');
        }
      } else {
        const prev = authorWriter?.followers || [];
        setAuthorWriter((w) => ({ ...w, followers: (w?.followers || []).filter((f) => f?.followerId !== store.user.user._id) }));
        const res = await unfollowWriter(post?.user?._id);
        if (!res?.success) {
          setAuthorWriter((w) => ({ ...w, followers: prev }));
          toast.error(res?.message || 'Unable to unfollow writer.');
        } else {
          toast.success(res.message || 'You have unfollowed this writer.');
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.message || 'Unable to update follow status.');
    } finally {
      setIsProcessingAuthorFollow(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const loadPopular = async () => {
      const response = await fetchPopularContent();
      if (!isMounted || !response?.success) return;
      setPopularContent({
        posts: response.data?.posts || [],
        writers: response.data?.writers || [],
      });
    };
    loadPopular();
    return () => {
      isMounted = false;
    };
  }, []);

  // categories are sourced from shared constants to match site-wide styling
  const categories = CATEGORIES;

  if (isFetchingPost && !post) {
    return (
      <div className="w-full h-full py-8 flex items-center justify-center">
        <span className="text-xl text-slate-500">Loading...</span>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full h-full py-16 flex items-center justify-center">
        <span className="text-lg text-slate-500 dark:text-slate-400">
          Post not found or has been removed.
        </span>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-10 2xl:px-20 py-8 md:py-12 2xl:py-16 space-y-12">
      {/* Hero Section - Article Header */}
      <section className="space-y-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col justify-center gap-6 order-2 md:order-1">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white leading-tight">
            {post?.title}
          </h1>
            <div className="flex items-center gap-2 flex-wrap">
            <button title="Share" onClick={async () => {
              const url = window.location.href;
              if (navigator.share) {
                try { await navigator.share({ title: post?.title, url }); await logShare(post?._id, { platform: 'native', method: 'native-share' }); } catch(e) {}
              } else {
                toast('Sharing not available on this device');
              }
            }} className="px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition-all duration-200 shadow-sm hover:shadow-md" aria-label="Share post">Share</button>
            <button title="Share on Twitter" onClick={() => { const url = window.location.href; const tw = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post?.title||'')}`; window.open(tw,'_blank','noopener'); try { logShare(post?._id, { platform: 'twitter', method: 'button' }); } catch{} }} className="px-4 py-2.5 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" aria-label="Share on Twitter"><FaTwitter className="w-4 h-4" /><span className="hidden sm:inline">Twitter</span></button>
            <button title="Share on Facebook" onClick={() => { const url = window.location.href; const fb = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; window.open(fb,'_blank','noopener'); try { logShare(post?._id, { platform: 'facebook', method: 'button' }); } catch{} }} className="px-4 py-2.5 rounded-lg bg-blue-500/10 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 dark:hover:bg-blue-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" aria-label="Share on Facebook"><FaFacebookF className="w-4 h-4" /><span className="hidden sm:inline">Facebook</span></button>
            <button title="Share on WhatsApp" onClick={() => { const url = window.location.href; const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent((post?.title||'') + ' ' + url)}`; window.open(wa,'_blank','noopener'); try { logShare(post?._id, { platform: 'whatsapp', method: 'button' }); } catch{} }} className="px-4 py-2.5 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" aria-label="Share on WhatsApp"><FaWhatsapp className="w-4 h-4" /><span className="hidden sm:inline">WhatsApp</span></button>
            <button title="Copy link" onClick={async () => { try { await navigator.clipboard.writeText(window.location.href); toast.success('Link copied to clipboard'); await logShare(post?._id, { platform: 'copy', method: 'copy-button' }); } catch(e) { const el = document.createElement('input'); el.value = window.location.href; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); toast.success('Link copied to clipboard'); try { await logShare(post?._id, { platform: 'copy', method: 'copy-button' }); } catch{} } }} className="px-4 py-2.5 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" aria-label="Copy post link"><FiLink className="w-4 h-4" /><span className="hidden sm:inline">Copy</span></button>
            <button title={liked ? 'Unlike' : 'Like'} onClick={async () => {
              if (!store?.user?.token) { toast.error('Please sign in to like posts'); return; }
              const prev = liked;
              const prevCount = likesCount;
              setLiked(!prev);
              setLikesCount(prev ? Math.max(prevCount - 1, 0) : prevCount + 1);
              try {
                if (!prev) {
                  const res = await likePost(post?._id);
                  if (!res?.success) {
                    setLiked(prev);
                    setLikesCount(prevCount);
                    toast.error(res?.message || 'Unable to like post');
                  }
                } else {
                  const res = await unlikePost(post?._id);
                  if (!res?.success) {
                    setLiked(prev);
                    setLikesCount(prevCount);
                    toast.error(res?.message || 'Unable to unlike post');
                  }
                }
              } catch (err) {
                setLiked(prev);
                setLikesCount(prevCount);
                toast.error('Action failed');
              }
            }} className="px-4 py-2.5 rounded-lg bg-pink-50 dark:bg-pink-900 text-pink-600 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2" aria-label="Like post">
              {liked ? <AiFillHeart className="w-4 h-4" /> : <AiOutlineHeart className="w-4 h-4" />}
              <span className="hidden sm:inline">{likesCount}</span>
            </button>
          </div>
          <div className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm md:text-base">
            <span className="text-rose-600 dark:text-rose-500 font-semibold px-3 py-1 bg-rose-50 dark:bg-rose-950 rounded-full">
              {post?.cat}
            </span>
            <span className="flex items-baseline gap-1 text-slate-700 dark:text-gray-300">
              <span className="text-lg md:text-2xl font-bold text-slate-900 dark:text-white">{post?.views?.length || 0}</span>
              <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400">views</span>
            </span>
          </div>
            <div className="flex gap-4 items-center group hover:opacity-80 transition-opacity w-fit">
            <img
              src={post?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(post?.user?.name || 'Unknown')}&background=ddd&color=333`}
              alt={post?.user?.name || 'Unknown author'}
              className="object-cover w-14 h-14 rounded-full border-2 border-slate-200 dark:border-slate-700 group-hover:border-rose-500 transition-colors"
            />
            <div>
              <p className="text-slate-800 dark:text-white font-semibold">{post?.user?.name || 'Unknown author'}</p>
              <span className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                {post?.createdAt ? new Date(post.createdAt).toDateString() : ""}
              </span>
            </div>
              <div className="ml-4 flex items-center gap-3">
                {post?.user?._id ? (
                  <a href={`/writer/${post.user._id}`} className="text-sm text-slate-600 dark:text-slate-400 hover:underline">View profile</a>
                ) : (
                  <span className="text-sm text-slate-500">Profile unavailable</span>
                )}
                {store?.user?.token && (
                  <>
                    {!isFollowingAuthor ? (
                      <button
                        onClick={handleAuthorFollow}
                        disabled={isProcessingAuthorFollow}
                        className="px-3 py-1.5 rounded bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-semibold"
                      >
                        Follow
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => setAuthorConfirmOpen(true)}
                          disabled={isProcessingAuthorFollow}
                          className="px-3 py-1.5 rounded bg-gray-600 dark:bg-gray-700 text-white text-sm font-semibold"
                        >
                          Unfollow
                        </button>
                        <ConfirmModal
                          opened={authorConfirmOpen}
                          title="Unfollow writer"
                          message={`Unfollow ${post?.user?.name}?`}
                          confirmLabel="Unfollow"
                          cancelLabel="Cancel"
                          onCancel={() => setAuthorConfirmOpen(false)}
                          onConfirm={async () => {
                            setAuthorConfirmOpen(false);
                            await handleAuthorFollow();
                          }}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
        </div>
        <img
          src={post?.img}
          alt={post?.title}
          className="w-full rounded-xl object-cover h-auto md:h-[360px] 2xl:h-[460px] shadow-lg order-1 md:order-2"
        />
      </section>

      {/* Content Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 2xl:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <article className="prose dark:prose-invert max-w-none">
            {post?.desc && (
              <Markdown
                options={{ wrapper: "article" }}
                className="leading-relaxed text-base md:text-lg 2xl:text-xl text-slate-700 dark:text-gray-300 space-y-4"
              >
                {post.desc}
              </Markdown>
            )}
          </article>

          <div className="w-full pt-8 border-t border-slate-200 dark:border-slate-700">
            <PostComments postId={id} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-10">
          <div className="sticky top-24 space-y-10">
              {/* Categories - always visible */}
              <div className="bg-white dark:bg-[#071020] shadow-sm rounded-lg p-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-3">Categories</h3>
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((cat) => (
                    <Link
                      key={cat.label}
                      to={`/category?cat=${encodeURIComponent(cat.label)}`}
                      className={`${cat.color} text-white font-semibold text-xs md:text-sm px-3 py-2.5 rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-105 flex items-center gap-2 text-center`}
                      aria-label={`Open ${cat.label} category`}
                    >
                      <span className="text-lg">{cat.icon}</span>
                      <span className="truncate hidden sm:inline">{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            <PopularPost posts={popularContent.posts} />
            <PopularWriter data={popularContent.writers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
