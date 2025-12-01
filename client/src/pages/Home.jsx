import React, { useCallback, useEffect, useMemo, useState } from "react";
import { CATEGORIES } from "../utils/constants";
import Banner from "../components/Banner";
import BannerModal from "../components/BannerModal";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import PopularPost from "../components/PopularPost";
import PopularWriter from "../components/PopularWriter";
import { fetchPopularContent, fetchPosts } from "../utils/apiCalls";
import { toast } from "sonner";

const Home = () => {
  const PER_PAGE = 6;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [popularContent, setPopularContent] = useState({ posts: [], writers: [] });

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetchPosts({ page, limit: PER_PAGE });
      if (response?.success) {
        setPosts(response.data || []);
        setTotalPages(Math.max(response.numOfPage || 1, 1));
      } else {
        setPosts([]);
        toast.error(response?.message || "Unable to load posts.");
      }
    } catch (error) {
      setPosts([]);
      toast.error(error?.message || "Unable to load posts.");
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    let isMounted = true;
    const loadPopular = async () => {
      const response = await fetchPopularContent();
      if (!isMounted) return;
      if (response?.success) {
        setPopularContent({
          posts: response.data?.posts || [],
          writers: response.data?.writers || [],
        });
      }
    };

    loadPopular();
    return () => {
      isMounted = false;
    };
  }, []);

  const highlightedPost = useMemo(() => {
    if (page !== 1 || posts.length === 0) return null;
    return posts[0] || null;
  }, [page, posts]);

  const remainingPosts = useMemo(() => {
    if (!posts.length) return [];
    if (page === 1) return posts.slice(1);
    return posts;
  }, [posts, page]);

  const handlePageChange = (nextPage) => {
    if (nextPage === page) return;
    setPage(nextPage);
  };

  return (
    <React.Fragment>
      <div className="w-full px-4 md:px-10 2xl:px-20 py-8 md:py-12 2xl:py-16 space-y-12">
        {/* Featured Post Banner */}
        {highlightedPost && <Banner post={highlightedPost} />}

        {/* Main Content Section */}
        <div className="space-y-10">
          {/* categories - professional grid */}
          <section className="space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-600 dark:text-white">Popular Categories</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {CATEGORIES.map((cat) => (
                <Link
                  to={`/category?cat=${cat.label}`}
                  key={cat.id || cat.label}
                  className={`${cat.color} text-white font-semibold text-xs md:text-sm px-3 py-2.5 rounded-lg hover:shadow-md transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-1.5 text-center`}
                >
                  {cat.icon}
                  <span className="hidden sm:inline">{cat.label}</span>
                </Link>
              ))}
            </div>
          </section>

          {/* posts grid layout */}
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 2xl:gap-12">
            {/* Left side - main posts */}
            <div className="lg:col-span-2 space-y-8">
              {isLoading ? (
                <div className="w-full flex justify-center py-16">
                  <span className="text-base text-slate-500">Loading posts...</span>
                </div>
              ) : remainingPosts.length === 0 ? (
                <div className="w-full flex justify-center py-12">
                  <span className="text-base text-slate-500 dark:text-slate-400">
                    More stories coming soon.
                  </span>
                </div>
              ) : (
                <div className="space-y-8">
                  {remainingPosts.map((post, index) => (
                    <Card key={post?._id || `${post?.slug}-${index}`} post={post} index={index} />
                  ))}
                </div>
              )}
              <div className="w-full flex items-center justify-center pt-6">
                <Pagination 
                  totalPages={totalPages}
                  currentPage={page}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </div>
            </div>
            
            {/* Right Side - sidebar */}
            <div className="lg:col-span-1 space-y-10">
              <div className="sticky top-24 space-y-10">
                <PopularPost posts={popularContent.posts} />
                <PopularWriter data={popularContent.writers} />
              </div>
            </div>
          </div>

          {/* Banner - Displayed Before Footer */}
          <BannerModal />
        </div>
      </div>
    </React.Fragment>
  );
};

export default Home;
