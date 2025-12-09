import React, { useCallback, useEffect, useMemo, useState } from "react";
import Card from "../components/Card";
import Pagination from "../components/Pagination";
import PopularPost from "../components/PopularPost";
import PopularWriter from "../components/PopularWriter";
import { CATEGORIES } from "../utils/constants";
import { fetchCategories } from "../utils/apiCalls";
import { fetchPopularContent, fetchPosts } from "../utils/apiCalls";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";

const CategoriesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("cat") || "All";
  
  const initialPage = (() => {
    const parsed = Number(searchParams.get("page"));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  })();

  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popularContent, setPopularContent] = useState({ posts: [], writers: [] });

  const normalizedCategory = useMemo(() => selectedCategory.trim(), [selectedCategory]);
  const PER_PAGE = 6;
  const [categories, setCategories] = useState(CATEGORIES);

  const loadPosts = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = { page, limit: PER_PAGE };
      // Safety Check: Use optional chaining here too
      if (normalizedCategory && normalizedCategory?.toLowerCase() !== "all") {
        params.cat = normalizedCategory;
      }
      const response = await fetchPosts(params);
      if (response?.success) {
        setPosts(response.data || []);
        setTotalPages(Math.max(response.numOfPage || 1, 1));
      } else {
        setPosts([]);
        toast.error(response?.message || "Unable to load posts for this category.");
      }
    } catch (error) {
      setPosts([]);
      toast.error(error?.message || "Unable to load posts for this category.");
    } finally {
      setIsLoading(false);
    }
  }, [page, normalizedCategory]);

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
    // load dynamic categories
    fetchCategories().then((res) => {
      if (res?.success) setCategories(res.data || CATEGORIES);
    }).catch(()=>{});
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const parsed = Number(searchParams.get("page"));
    const safePage = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    setPage(safePage);
  }, [searchParams]);

  const handlePageChange = (nextPage) => {
    if (nextPage === page) return;
    const params = new URLSearchParams(searchParams);
    params.set("page", nextPage);
    setSearchParams(params);
  };

  const handleCategorySelect = (categoryLabel) => {
    const params = new URLSearchParams(searchParams);
    // Safety Check: Ensure categoryLabel exists before using toLowerCase
    if (categoryLabel?.toLowerCase() === "all") {
      params.delete("cat");
    } else {
      params.set("cat", categoryLabel);
    }
    params.delete("page");
    setSearchParams(params);
  };

  const postsToRender = posts;

  return (
    <div className="w-full px-4 md:px-10 2xl:px-20 py-8 md:py-12 2xl:py-16 space-y-8">
      {/* Header section */}
      <section className="py-6 md:py-8 space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-800 dark:text-white capitalize">
          {normalizedCategory || "All"}
        </h1>
        <p className="text-sm md:text-base text-slate-500 dark:text-slate-400">
          Explore the latest posts from your favourite categories.
        </p>
      </section>

      {/* Category filters - responsive grid */}
      <section className="space-y-4">
        <div className="flex flex-wrap gap-2 md:gap-3">
          {/* FIX APPLIED HERE:
             1. We filter out any undefined labels first (.filter(l => l))
             2. We use label?.toLowerCase() inside the map just to be safe
          */}
          {["All", ...categories.map((cat) => cat?.label).filter(l => l)].map((label) => {
            const isActive = normalizedCategory?.toLowerCase() === label?.toLowerCase();
            const categoryStyle = categories.find((cat) => cat?.label === label)?.color || "bg-gray-600";
            
            return (
              <button
                key={label}
                type="button"
                onClick={() => handleCategorySelect(label)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? `${categoryStyle} text-white shadow-md scale-105`
                    : "bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 2xl:gap-12">
        {/* Left side - posts */}
        <div className="lg:col-span-2 space-y-8">
          {isLoading ? (
            <div className="w-full flex justify-center py-16">
              <span className="text-base text-slate-500">Loading posts...</span>
            </div>
          ) : postsToRender.length === 0 ? (
            <div className="w-full h-full py-10 flex justify-center">
              <span className="text-lg text-slate-500 dark:text-slate-400">
                No posts available for this category yet.
              </span>
            </div>
          ) : (
            <>
              <div className="space-y-8">
                {postsToRender.map((post, index) => (
                  <Card key={post?._id || `${post?.slug}-${index}`} post={post} index={index} />
                ))}
              </div>
              <div className="w-full flex items-center justify-center pt-6">
                <Pagination
                  totalPages={totalPages}
                  currentPage={page}
                  onPageChange={handlePageChange}
                  isLoading={isLoading}
                />
              </div>
            </>
          )}
        </div>

        {/* Right side - sidebar */}
        <div className="lg:col-span-1 space-y-10">
          <div className="sticky top-24 space-y-10">
            <PopularPost posts={popularContent.posts} />
            <PopularWriter data={popularContent.writers} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;