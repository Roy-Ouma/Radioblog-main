import Markdown from "markdown-to-jsx";
import { Link } from "react-router-dom";
import Profile from "../assets/profile.png";

const Banner = ({ post }) => {
  if (!post) {
    return null;
  }

  const descriptionPreview = post?.desc ? `${post.desc.slice(0, 150)}...` : "";
  const titlePreview = post?.title ? `${post.title.slice(0, 60)}...` : "Featured Story";

  return (
    <div className="w-full mb-10">
      <div className="relative w-full h-[480px] md:h-[540px] 2xl:h-[600px] flex px-0 lg:px-12">
        <Link to={`/${post?.slug}/${post?._id}`} className="w-full">
          <img
            src={post?.img}
            alt={post?.title || "Banner Image"}
            className="w-full md:w-3/4 h-80 md:h-full rounded-lg object-cover"
          />
        </Link>
        <div className="absolute flex flex-col md:right-8 bottom-8 md:bottom-4 w-full md:w-2/4 lg:w-1/3 xl:w-[420px] bg-white dark:bg-[#05132b] shadow-xl rounded-lg gap-3 p-5">
          <Link to={`/${post?.slug}/${post?._id}`}>
            <h1 className="font-semibold text-2xl text-black dark:text-white">{titlePreview}</h1>
          </Link>

          {descriptionPreview && (
            <div className="flex overflow-hidden text-gray-600 dark:text-slate-400 text-sm text-justify">
              <Markdown options={{ wrapper: "article" }}>{descriptionPreview}</Markdown>
            </div>
          )}

          <Link
            to={`/${post?.slug}/${post?._id}`}
            className="w-fit bg-rose-600 bg-opacity-20 text-rose-700 px-4 py-1 rounded-full text-sm cursor-pointer"
          >
            Read More...
          </Link>

          {post?.user && (
            <Link to={`/writer/${post?.user?._id}`} className="flex gap-3 mt-4 items-center">
              <img
                src={post?.user?.image || Profile}
                alt={post?.user?.name}
                className="object-cover w-10 h-10 rounded-full"
              />
              <span className="font-medium text-gray-700 dark:text-slate-200">
                {post?.user?.name}
              </span>

              <span className="text-gray-500 dark:text-gray-400">
                {post?.createdAt ? new Date(post.createdAt).toDateString() : ""}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Banner;