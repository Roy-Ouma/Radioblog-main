import React from 'react'
import { Link } from "react-router-dom";
import Profile from "../assets/profile.png"
import { formatNumber } from '../utils/index.js';



const PopularWriter = ({ data = [] }) => {
    return <div className='w-full flex flex-col gap-0'>
         <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-2xl p-6 border border-b-0 border-slate-200 dark:border-slate-700">
         <p className='text-xl font-bold text-slate-900 dark:text-slate-300 flex items-center gap-2'> 
          <span className="text-orange-600">👥</span>
          Popular Writers
         </p>
       </div>

       <div className="w-full bg-white dark:bg-slate-850 rounded-b-2xl p-6 border border-t-0 border-slate-200 dark:border-slate-700 space-y-4">
        {data.length === 0 ? (
          <span className="text-sm text-gray-500 dark:text-gray-400 block py-4">
            Writers with the most followers will appear here soon.
          </span>
        ) : (
          <div className="space-y-4">
            {data.map((el) => (
              <Link
                to={`/writer/${el?._id}`}
                key={el?._id}
                className="flex gap-3 items-center p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <img
                  src={el?.image || Profile}
                  alt={el?.name}
                  className="object-cover w-12 h-12 rounded-full border-2 border-slate-200 dark:border-slate-600"
                />

                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="text-base font-semibold text-slate-800 dark:text-slate-300 truncate">
                    {el?.name || "Unknown"}
                  </span>

                  <span className="text-sm font-medium">
                    <span className="text-rose-600 dark:text-rose-400">{formatNumber(el?.followers)}</span>
                    <span className="text-gray-600 dark:text-slate-400 ml-1">Followers</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
       </div>
       </div>;
};

export default PopularWriter;