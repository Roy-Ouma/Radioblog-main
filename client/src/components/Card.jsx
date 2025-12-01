import Markdown from 'markdown-to-jsx';
import React from 'react';
import { Link } from 'react-router-dom';
import {AiOutlineArrowRight} from "react-icons/ai"
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { FaTwitter, FaFacebookF, FaWhatsapp } from 'react-icons/fa';
import { FiLink } from 'react-icons/fi';
import { toast } from 'sonner';
import { logShare, likePost, unlikePost } from '../utils/apiCalls';
import useStore from '../store';

const Card = ({post, index}) => {
    const store = useStore();
    const currentUserId = store?.user?.user?._id;
    const [liked, setLiked] = React.useState(Boolean(post?.likes?.some((l) => String(l) === String(currentUserId))));
    const [likesCount, setLikesCount] = React.useState(post?.likes?.length || 0);

    React.useEffect(() => {
      setLikesCount(post?.likes?.length || 0);
      setLiked(Boolean(post?.likes?.some((l) => String(l) === String(currentUserId))));
    }, [post, currentUserId]);
    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/${post?.slug}/${post?._id}` : `/${post?.slug}/${post?._id}`;

    const onCopyLink = async () => {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard');
        try { await logShare(post?._id, { platform: 'copy', method: 'copy-button' }); } catch {}
      } catch (err) {
        // fallback
        const el = document.createElement('input');
        document.body.appendChild(el);
        el.value = shareUrl;
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
        toast.success('Link copied to clipboard');
      }
    };

    const onNativeShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({ title: post?.title, text: post?.desc?.slice(0, 120), url: shareUrl });
          try { await logShare(post?._id, { platform: 'native', method: 'native-share' }); } catch {}
        } catch (err) {
          // user cancelled or not supported
        }
      } else {
        toast('Sharing is not available on this device');
      }
    };

    const onShareTwitter = () => {
      const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post?.title || '')}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      try { logShare(post?._id, { platform: 'twitter', method: 'button' }); } catch {}
    };

    const onShareFacebook = () => {
      const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      try { logShare(post?._id, { platform: 'facebook', method: 'button' }); } catch {}
    };

    const onShareWhatsApp = () => {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent((post?.title || '') + ' ' + shareUrl)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
      try { logShare(post?._id, { platform: 'whatsapp', method: 'button' }); } catch {}
    };

    return (
        <div className='w-full flex flex-col gap-8 items-center rounded md:flex-row'>
        
        <Link to = {`/${post?.slug}/${post._id}`} className='w-full md:w-2/4 h-64'>
         <img src={post?.img} alt={post?.title} className='object-cover w-full h-full rounded'/>
        </Link>

        <div className='w-full md:w-2/4 flex flex-col gap-3'>
          <div className='flex justify-between items-start'>
            <div className='flex flex-col'>
              <span className='text-sm text-gray-600'>{new Date (post?.createdAt).toDateString()}</span>
              <span className='text-sm text-rose-600 font-semibold'>{post?.cat}</span>
            </div>
            <div className='flex items-center gap-2 flex-wrap'>
              <button onClick={async () => {
                if (!store?.user?.token) { toast.error('Please sign in to like posts'); return; }
                // optimistic
                const prevLiked = liked;
                const prevCount = likesCount;
                setLiked(!prevLiked);
                setLikesCount(prevLiked ? Math.max(prevCount - 1, 0) : prevCount + 1);
                try {
                  if (!prevLiked) {
                    const res = await likePost(post?._id);
                    if (!res?.success) {
                      setLiked(prevLiked);
                      setLikesCount(prevCount);
                      toast.error(res?.message || 'Unable to like post');
                    }
                  } else {
                    const res = await unlikePost(post?._id);
                    if (!res?.success) {
                      setLiked(prevLiked);
                      setLikesCount(prevCount);
                      toast.error(res?.message || 'Unable to unlike post');
                    }
                  }
                } catch (err) {
                  setLiked(prevLiked);
                  setLikesCount(prevCount);
                  toast.error('Action failed');
                }
              }} aria-label='Like post' className='px-3 py-2 rounded-lg bg-pink-50 dark:bg-pink-900 text-pink-600 dark:text-pink-300 hover:bg-pink-100 dark:hover:bg-pink-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm flex items-center gap-2'>
                {liked ? <AiFillHeart className="w-4 h-4" /> : <AiOutlineHeart className="w-4 h-4" />}
                <span className='hidden sm:inline'>{likesCount}</span>
              </button>
              <button onClick={onNativeShare} aria-label='Share' className='px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm flex items-center gap-1'>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12v.01M12 12v.01M20 12v.01M4 12a8 8 0 018-8m0 0a8 8 0 018 8m-8-8v16" />
                </svg>
                <span className="hidden sm:inline">Share</span>
              </button>
              <button onClick={onShareTwitter} aria-label='Share on Twitter' className='px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm flex items-center gap-1'>
                <FaTwitter className="w-4 h-4" />
                <span className="hidden sm:inline">Twitter</span>
              </button>
              <button onClick={onShareFacebook} aria-label='Share on Facebook' className='px-3 py-2 rounded-lg bg-blue-500/10 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 dark:hover:bg-blue-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm flex items-center gap-1'>
                <FaFacebookF className="w-4 h-4" />
                <span className="hidden sm:inline">Facebook</span>
              </button>
              <button onClick={onShareWhatsApp} aria-label='Share on WhatsApp' className='px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm flex items-center gap-1'>
                <FaWhatsapp className="w-4 h-4" />
                <span className="hidden sm:inline">WhatsApp</span>
              </button>
              <button onClick={onCopyLink} aria-label='Copy link' className='px-3 py-2 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800 font-semibold transition-all duration-200 shadow-sm hover:shadow-md text-sm flex items-center gap-1'>
                <FiLink className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </button>
            </div>
          </div>

          <h6 className='text-xl 2xl:text-3xl font-serif text-black dark:text-white'>{post?.title}</h6>

          <div className='flex-1 overflow-hidden text-gray-600 dark:text-slate-500 text-sm text-justify'>
            <Markdown options={{ wrapper: "article" }}>{post?.desc?.slice(0, 250) + "...."}</Markdown>
          </div>

          <Link to={`/${post?.slug}/${post?._id}`} className='flex items-center gap-2 text-black dark:text-white'>
            <span> Read More</span>
            <AiOutlineArrowRight />
          </Link>

        </div>
        </div>
    );
};       

export default Card;