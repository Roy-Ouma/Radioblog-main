import React from 'react'
import { Link } from "react-router-dom";

const RecommendedTopics = ({ data = [] }) => {
  return (
    <div className='w-full flex flex-col gap-0'>
      <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-2xl p-6 border border-b-0 border-slate-200 dark:border-slate-700">
        <p className='text-xl font-bold text-slate-900 dark:text-slate-300 flex items-center gap-2'> 
          <span className="text-orange-600"></span>
          Recommended Topics
        </p>
      </div>

      <div className="w-full bg-white dark:bg-slate-850 rounded-b-2xl p-6 border border-t-0 border-slate-200 dark:border-slate-700 space-y-4">
        {(!data || data.length === 0) ? (
          <span className="text-sm text-gray-500 dark:text-gray-400 block py-4">
            Topics with recent posts will appear here soon.
          </span>
        ) : (
          <div className="space-y-3">
            {data.map((topic) => (
              <Link
                to={`/category?cat=${encodeURIComponent(topic?.label || topic?.name || '')}`}
                key={topic?._id || topic?.label || topic?.name}
                className="flex gap-3 items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div className="flex-0 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {String((topic?.label || topic?.name || '').charAt(0)).toUpperCase()}
                </div>

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-300 truncate">
                    {topic?.label || topic?.name}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-slate-400">Explore posts under this topic</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedTopics;
