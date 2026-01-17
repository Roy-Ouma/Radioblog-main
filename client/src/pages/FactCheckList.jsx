import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchPosts, fetchPopularContent } from "../utils/apiCalls";
import { formatNumber } from "../utils";
import moment from "moment";

const FactCheckList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [latestPosts, setLatestPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [sidebarLoading, setSidebarLoading] = useState(true);

  // Function to parse verdicts from post content
  const parseVerdicts = (content) => {
    if (!content) return ['UNPROVEN'];
    
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('correct')) return ['CORRECT'];
    if (lowerContent.includes('misleading')) return ['MISLEADING'];
    if (lowerContent.includes('false') || lowerContent.includes('incorrect')) return ['FALSE'];
    
    return ['UNPROVEN'];
  };

  // Function to get verdict color
  const getVerdictColor = (verdict) => {
    switch (verdict.toUpperCase()) {
      case 'CORRECT':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800';
      case 'MISLEADING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800';
      case 'FALSE':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-800';
    }
  };

  useEffect(() => {
    const loadFactChecks = async () => {
      setLoading(true);
      try {
        const response = await fetchPosts({ page, limit: 20, cat: "fact-check" });
        if (response?.success) {
          setPosts(response.data || []);
          setTotalPages(Math.ceil((response.totalPost || 0) / 20));
        }
      } catch (error) {
        console.error("Failed to load fact checks:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFactChecks();
  }, [page]);

  useEffect(() => {
    const loadSidebarContent = async () => {
      setSidebarLoading(true);
      try {
        // Load latest fact-check posts
        const latestResponse = await fetchPosts({ page: 1, limit: 5, cat: "fact-check" });
        if (latestResponse?.success) {
          setLatestPosts(latestResponse.data || []);
        }

        // Load trending fact-check posts (from popular content, filtered by category)
        const popularResponse = await fetchPopularContent();
        if (popularResponse?.success) {
          const factCheckTrending = (popularResponse.data || []).filter(post => 
            post.cat?.toLowerCase() === 'fact-check' || post.cat?.toLowerCase() === 'factcheck'
          );
          setTrendingPosts(factCheckTrending.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to load sidebar content:", error);
      } finally {
        setSidebarLoading(false);
      }
    };

    loadSidebarContent();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading fact checks...</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Fact Check</h1>

        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No fact checks available yet.</p>
            </div>
          ) : (
            posts.map((post) => {
              const verdicts = parseVerdicts(post.desc);
              
              return (
                <article key={post._id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                  <Link to={`/fact-check/${post.slug}/${post._id}`} className="block">
                    <div className="flex flex-col md:flex-row">
                      {post.img && (
                        <div className="md:w-48 h-48 md:h-auto flex-shrink-0">
                          <img
                            src={post.img}
                            alt={post.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {verdicts.map((verdict, index) => (
                            <span
                              key={index}
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVerdictColor(verdict)}`}
                            >
                              {verdict}
                            </span>
                          ))}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {post.title}
                        </h2>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span>By {post.user?.name || "Anonymous"}</span>
                          <span className="mx-2">•</span>
                          <span>{moment(post.createdAt).fromNow()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex gap-2">
              {page > 1 && (
                <button
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Previous
                </button>
              )}

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, page - 2) + i;
                if (pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      pageNum === page
                        ? "bg-blue-600 text-white"
                        : "text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {page < totalPages && (
                <button
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 space-y-6">
            {/* Latest Fact Checks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Latest Fact Checks</h3>
              {sidebarLoading ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
              ) : latestPosts.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">No recent fact checks</div>
              ) : (
                <div className="space-y-3">
                  {latestPosts.slice(0, 5).map((post) => (
                    <Link
                      key={post._id}
                      to={`/fact-check/${post.slug}/${post._id}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        {post.img && (
                          <img
                            src={post.img}
                            alt={post.title}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                            {post.title}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {moment(post.createdAt).fromNow()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Trending Fact Checks */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Trending Fact Checks</h3>
              {sidebarLoading ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
              ) : trendingPosts.length === 0 ? (
                <div className="text-sm text-gray-600 dark:text-gray-400">No trending fact checks</div>
              ) : (
                <div className="space-y-3">
                  {trendingPosts.map((post, index) => (
                    <Link
                      key={post._id}
                      to={`/fact-check/${post.slug}/${post._id}`}
                      className="block group"
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-6 text-center">
                          <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
                            {index + 1}
                          </span>
                        </div>
                        {post.img && (
                          <img
                            src={post.img}
                            alt={post.title}
                            className="w-12 h-12 object-cover rounded flex-shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 line-clamp-2">
                            {post.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <span>{formatNumber(post.engagedViews || 0)} views</span>
                            <span>•</span>
                            <span>{moment(post.createdAt).fromNow()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactCheckList;