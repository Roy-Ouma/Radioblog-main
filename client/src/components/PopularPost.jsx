import React, { useEffect, useState } from "react"
import { CATEGORIES } from "../utils/constants";
import { Link } from 'react-router-dom';
import { fetchCategories } from "../utils/apiCalls";

const PopularPost = ({ posts = [] }) => {
  const [categories, setCategories] = useState(CATEGORIES);

  useEffect(() => {
    let mounted = true;
    fetchCategories()
      .then((res) => {
        if (!mounted) return;
        if (res?.success) {
          const serverCats = Array.isArray(res.data) ? res.data : [];
          const base = Array.isArray(CATEGORIES) ? CATEGORIES : [];
          const map = new Map();
          base.forEach((c) => c?.label && map.set(c.label, c));
          serverCats.forEach((c) => {
            if (!c || !c.label) return;
            if (!map.has(c.label)) map.set(c.label, c);
          });
          setCategories(Array.from(map.values()));
        }
      })
      .catch(() => {});
    return () => (mounted = false);
  }, []);

  const Card = ({post}) => {
    let catColor = "";
    categories.map((cat) => {
      if (cat.label === post?.cat) {
        catColor = cat?.color;
      }
      return null;
    });

        return <div className="flex gap-2 items-center">
            <img 
            src={post?.img} 
            alt={post?.title} 
            className="w-12 h-12 rounded-full object-cover"
            />

            <div className="w-full flex flex-col gap-1">
                <span className={`${catColor || "bg-gray-700"} w-fit rounded-full px-2 py-0.5
                text-white text-[12px] 2xl:text-sm`}
                >
                    {post.cat}
                    </span>
                <Link to = {`/${post?.slug}/${post?._id}`} className='text-black dark:text-slate-300
                '>
                    {post?.title}
                </Link>    

                <div className="flex gap-2 text-sm text-gray-500">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{post?.user?.name || "Anonymous"}</span>
                    <span className="">
                        {post?.createdAt ? new Date(post.createdAt).toDateString() : ""}
                    </span>

                </div>

            </div>
        </div>;
    }
    return <div className="w-full flex flex-col gap-0">
    <div className="w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-t-2xl p-6 border border-b-0 border-slate-200 dark:border-slate-700">
      <p className="text-xl font-bold text-slate-900 dark:text-slate-300 flex items-center gap-2">
        <span className="text-orange-600">⭐</span>
        Popular Posts
      </p>
    </div>

    <div className="w-full bg-white dark:bg-slate-850 rounded-b-2xl p-6 border border-t-0 border-slate-200 dark:border-slate-700 space-y-4">
      {posts.length === 0 ? (
        <span className="text-sm text-gray-500 dark:text-slate-400 block py-4">
          Popular posts will appear here soon.
        </span>
      ) : (
        <div className="space-y-4 max-h-72 md:max-h-96 overflow-y-auto pr-2">
          {posts.map((post, idx) => (
            <div key={post?._id} className="pb-4 last:pb-0 last:border-b-0 border-b border-slate-200 dark:border-slate-700">
              <Card post={post} />
            </div>
          ))}
        </div>
      )}
    </div>
    </div>;
};

export default PopularPost;