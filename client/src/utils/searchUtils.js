/**
 * Search utilities for case-insensitive, partial keyword matching
 * Searches posts by title, category, and content excerpt
 * Returns results sorted by relevance
 */

/**
 * Normalizes a string for case-insensitive comparison
 * @param {string} str - The string to normalize
 * @returns {string} - Lowercased, trimmed string
 */
const normalizeStr = (str) => {
  if (typeof str !== "string") return "";
  return str.toLowerCase().trim();
};

/**
 * Calculates relevance score for a post match
 * Higher score = better match
 * Scoring: title match (3x) > category match (2x) > content match (1x)
 * @param {object} post - The post object
 * @param {string} searchTerm - The normalized search term
 * @returns {number} - Relevance score (0 if no match)
 */
const calculateRelevance = (post, searchTerm) => {
  const normalizedTitle = normalizeStr(post.title || "");
  const normalizedCategory = normalizeStr(post.category?.name || post.category || "");
  const normalizedContent = normalizeStr(post.content || post.excerpt || post.description || "");

  let score = 0;

  // Title match (highest priority)
  if (normalizedTitle.includes(searchTerm)) {
    score += 3;
    // Bonus for exact word match in title
    if (normalizedTitle.split(/\s+/).some((word) => word.includes(searchTerm))) {
      score += 2;
    }
  }

  // Category match (medium priority)
  if (normalizedCategory.includes(searchTerm)) {
    score += 2;
  }

  // Content/excerpt match (lowest priority)
  if (normalizedContent.includes(searchTerm)) {
    score += 1;
  }

  return score;
};

/**
 * Searches an array of posts for matches
 * Performs case-insensitive, partial keyword matching across multiple fields
 * @param {array} posts - Array of post objects
 * @param {string} searchTerm - The search term (will be normalized)
 * @returns {array} - Matching posts sorted by relevance (descending)
 */
export const searchPosts = (posts = [], searchTerm = "") => {
  const normalizedTerm = normalizeStr(searchTerm);

  if (!normalizedTerm || !Array.isArray(posts) || posts.length === 0) {
    return [];
  }

  // Calculate relevance for each post
  const postsWithScore = posts
    .map((post) => ({
      ...post,
      _relevanceScore: calculateRelevance(post, normalizedTerm),
    }))
    .filter((post) => post._relevanceScore > 0); // Only include matches

  // Sort by relevance score (descending)
  return postsWithScore.sort((a, b) => b._relevanceScore - a._relevanceScore);
};

/**
 * Highlights search term in text by wrapping matches in a marker
 * Case-insensitive highlighting
 * @param {string} text - The text to highlight
 * @param {string} searchTerm - The term to highlight
 * @param {string} marker - The marker to wrap matches (default: ':::')
 * @returns {string} - Text with matches marked
 */
export const highlightMatches = (text = "", searchTerm = "", marker = ":::") => {
  if (!text || !searchTerm) return text;

  const normalizedTerm = normalizeStr(searchTerm);
  const normalizedText = normalizeStr(text);

  if (!normalizedText.includes(normalizedTerm)) return text;

  // Find all matches and replace (case-insensitive)
  const regex = new RegExp(`(${normalizedTerm})`, "gi");
  return text.replace(regex, `${marker}$1${marker}`);
};

/**
 * Extracts and truncates a preview from post content
 * Tries to find the search term context if present
 * @param {string} content - Full post content/excerpt
 * @param {string} searchTerm - The search term to find context around
 * @param {number} maxLength - Max length of preview (default: 150)
 * @returns {string} - Preview text
 */
export const getPreviewWithContext = (content = "", searchTerm = "", maxLength = 150) => {
  if (!content) return "";

  const normalizedContent = normalizeStr(content);
  const normalizedTerm = normalizeStr(searchTerm);

  // Find the first occurrence of the search term
  const termIndex = normalizedContent.indexOf(normalizedTerm);

  if (termIndex === -1) {
    // No term found, return simple preview
    return content.slice(0, maxLength).trim() + (content.length > maxLength ? "..." : "");
  }

  // Calculate context window around the term
  const contextStart = Math.max(0, termIndex - 40);
  const contextEnd = Math.min(content.length, termIndex + normalizedTerm.length + 80);

  let preview = content.slice(contextStart, contextEnd).trim();

  // Add ellipsis if truncated
  if (contextStart > 0) preview = "..." + preview;
  if (contextEnd < content.length) preview = preview + "...";

  return preview;
};

/**
 * Validates if a search term is valid for searching
 * @param {string} term - The search term to validate
 * @returns {boolean} - True if valid (non-empty after normalization)
 */
export const isValidSearchTerm = (term = "") => {
  return normalizeStr(term).length > 0;
};
