import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPostById } from "../utils/apiCalls";
import moment from "moment";

const FactCheckDetail = () => {
  const { slug, id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      setLoading(true);
      try {
        const response = await fetchPostById(id);
        if (response?.success) {
          setPost(response.data);
        }
      } catch (error) {
        console.error("Failed to load fact check:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadPost();
    }
  }, [id]);

  // Function to extract single verdict from content
  const extractVerdict = (content) => {
    if (!content) return 'UNPROVEN';
    
    const lowerContent = content.toLowerCase();
    if (lowerContent.includes('correct')) return 'CORRECT';
    if (lowerContent.includes('misleading') || lowerContent.includes('misleading')) return 'MISLEADING';
    if (lowerContent.includes('false') || lowerContent.includes('incorrect')) return 'FALSE';
    
    return 'UNPROVEN';
  };

  // Function to clean content by removing HTML tags and verdict mentions
  const cleanContent = (content) => {
    if (!content) return '';
    
    // Remove HTML tags
    let cleaned = content.replace(/<[^>]*>/g, '');
    
    // Remove verdict mentions from content
    cleaned = cleaned.replace(/\b(correct|incorrect|misleading|false|unproven)\b/gi, '');
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n\s*\n/g, '\n\n').trim();
    
    return cleaned;
  };

  const getVerdictColor = (verdict) => {
    switch (verdict) {
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

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading fact check...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600 dark:text-gray-400">Fact check not found.</div>
      </div>
    );
  }

  const verdict = extractVerdict(post.content);
  const cleanedContent = cleanContent(post.content);

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <article className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Featured Image */}
          {post.img && (
            <div className="w-full h-64 md:h-80 overflow-hidden">
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

          {/* Header */}
          <header className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {post.title}
            </h1>

            {/* Verdict Badge - Prominently displayed at top */}
            <div className="mb-4">
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-bold border-2 ${getVerdictColor(verdict)}`}>
                {verdict}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-4">
                <span>By {post.user?.name || "Anonymous"}</span>
                <span>{moment(post.createdAt).format("MMMM D, YYYY")}</span>
              </div>
              {post.updatedAt && post.updatedAt !== post.createdAt && (
                <span>Updated {moment(post.updatedAt).format("MMMM D, YYYY")}</span>
              )}
            </div>
          </header>

          {/* TL;DR Summary */}
          {post.desc && (
            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">TL;DR</h2>
              <p className="text-blue-800 dark:text-blue-200">{post.desc}</p>
            </div>
          )}

          {/* Content */}
          {cleanedContent && (
            <div className="p-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                {cleanedContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </article>
      </div>
    </div>
  );
};

export default FactCheckDetail;