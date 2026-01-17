import React from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaRegComments } from "react-icons/fa";
import { getPreviewWithContext, highlightMatches } from "../utils/searchUtils";

/**
 * SearchResults component
 * Displays a list of search results in a dropdown/panel format
 * Each result is clickable and navigates to the post detail page
 */
const SearchResults = ({
  results = [],
  searchTerm = "",
  isLoading = false,
  onResultClick = () => {},
}) => {
  const navigate = useNavigate();

  const handleResultClick = (postId) => {
    onResultClick();
    navigate(`/blog/${postId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
        Searching...
      </div>
    );
  }

  // No results state
  if (!results || results.length === 0) {
    if (!searchTerm) {
      return (
        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
          Type to search posts
        </div>
      );
    }
    return (
      <div className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 text-center">
        <p className="font-medium">No posts found</p>
        <p className="text-xs mt-1">Try a different keyword</p>
      </div>
    );
  }

  return (
    <div className="max-h-96 overflow-y-auto">
      {results.map((post, index) => {
        const preview = getPreviewWithContext(
          post.excerpt || post.content || post.description || "",
          searchTerm,
          120
        );

        return (
          <div
            key={`${post._id || post.id || index}`}
            onClick={() => handleResultClick(post._id || post.id)}
            className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors last:border-b-0"
          >
            {/* Title with search term highlighted */}
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
              {post.title}
            </h3>

            {/* Category badge */}
            {post.category && (
              <div className="mb-1">
                <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-full bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200">
                  {typeof post.category === "object"
                    ? post.category.name
                    : post.category}
                </span>
              </div>
            )}

            {/* Preview/excerpt */}
            {preview && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {preview}
              </p>
            )}

            {/* Stats: views and comments */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <FaEye className="w-3 h-3" />
                <span>{post?.engagedViews || 0}</span>
              </div>
              <div className="flex items-center gap-1">
                <FaRegComments className="w-3 h-3" />
                <span>
                  {post?.comments?.length ?? post?.commentsCount ?? 0}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SearchResults;
