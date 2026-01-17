import Markdown from 'markdown-to-jsx';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AiOutlineArrowRight } from "react-icons/ai"
import { FaEye, FaRegComments } from 'react-icons/fa';

const Card = ({ post, index }) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Only navigate if clicking on the card itself, not on interactive elements
    if (e.target === e.currentTarget || e.currentTarget.contains(e.target)) {
      navigate(`/${post?.slug}/${post?._id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className='w-full bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 flex flex-col md:flex-row gap-0 md:gap-6'
      role="article"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          navigate(`/${post?.slug}/${post?._id}`);
        }
      }}
      aria-label={`Article: ${post?.title}`}
    >
      {/* Image Container */}
      <div className='w-full md:w-2/5 h-48 md:h-56 overflow-hidden'>
        <img
          src={post?.img}
          alt={post?.title}
          className='object-cover w-full h-full hover:scale-110 transition-transform duration-500'
        />
      </div>

      {/* Content Container */}
      <div className='w-full md:w-3/5 flex flex-col gap-4 p-5 md:p-6'>
        {/* Meta Information */}
        <div className='flex flex-col gap-1'>
          <span className='text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium'>
            {new Date(post?.createdAt).toDateString()}
          </span>
          <span className='text-xs md:text-sm text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wide'>
            {post?.cat}
          </span>
        </div>

        {/* Title */}
        <h3 className='text-lg md:text-2xl font-bold text-slate-900 dark:text-white leading-tight hover:text-rose-600 dark:hover:text-rose-400 transition-colors duration-200'>
          {post?.title}
        </h3>

        {/* Description/Excerpt */}
        <div className='flex-1 text-gray-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3'>
          <Markdown options={{ wrapper: "article" }}>
            {post?.desc?.slice(0, 250) + "..."}
          </Markdown>
        </div>

        {/* Read More Link */}
        <div className='flex items-center gap-2'>
          <span className='text-sm md:text-base font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors duration-200 flex items-center gap-1 group cursor-pointer'>
            Read More
            <AiOutlineArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform duration-200' />
          </span>
        </div>
        {/* Views & Comments */}
        <div className='flex items-center gap-4 mt-2'>
          <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400'>
            <FaEye className='w-4 h-4 text-gray-600 dark:text-slate-300' />
            <span className='font-medium'>{post?.engagedViews || 0}</span>
          </div>
          <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400'>
            <FaRegComments className='w-4 h-4 text-gray-600 dark:text-slate-300' />
            <span className='font-medium'>{post?.comments?.length ?? post?.commentsCount ?? post?.numComments ?? 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Card;