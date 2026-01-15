import React, { useEffect, useState } from "react";
import axios from "axios";
import useStore from "../store";
import { API_URI } from "../utils";
import { toast } from "sonner";
import { Button, Select, TextInput, Group, Badge, Card, Text, Loader, Pagination } from "@mantine/core";

const FeaturedBanner = () => {
  const user = useStore((s) => s.user);
  const token = user?.token;

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentFeatured, setCurrentFeatured] = useState(null);
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");

  const PER_PAGE = 10;

  const fetchPosts = async (p = 1) => {
    setLoading(true);
    try {
      const params = { page: p, limit: PER_PAGE, status: true, approved: true };
      if (filterCategory) params.cat = filterCategory;
      if (search) params.search = search;

      const res = await axios.get(`${API_URI}/posts`, { params });
      if (res?.data?.success) {
        setPosts(res.data.data || []);
        setTotalPages(res.data.numOfPage || 1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentFeatured = async () => {
    try {
      const res = await axios.get(`${API_URI}/posts/featured`);
      if (res?.data?.success && res.data.data?.length > 0) {
        setCurrentFeatured(res.data.data[0]);
      } else {
        setCurrentFeatured(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPosts(page);
    fetchCurrentFeatured();
  }, [page, filterCategory, search]);

  const handleSetFeatured = async () => {
    if (!selectedPost) {
      toast.error("Please select a post");
      return;
    }

    try {
      const res = await axios.post(
        `${API_URI}/posts/featured`,
        { postId: selectedPost._id },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res?.data?.success) {
        toast.success("Featured post updated successfully");
        setCurrentFeatured(selectedPost);
        setSelectedPost(null);
        fetchPosts(page); // Refresh to update featured status
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to set featured post");
    }
  };

  const handleRemoveFeatured = async () => {
    try {
      const res = await axios.delete(`${API_URI}/posts/featured`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res?.data?.success) {
        toast.success("Featured post removed successfully");
        setCurrentFeatured(null);
        fetchPosts(page);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove featured post");
    }
  };

  const categories = [
    "NEWS", "SPORTS", "CODING", "EDUCATION", "FASHION", "TRAVEL", "FOOD",
    "LIFESTYLE", "HEALTH", "SCIENCE", "POLITICS", "FEATURES", "TECHNOLOGY",
    "BUSINESS", "ENTERTAINMENT", "OPINION", "CULTURE", "ART"
  ];

  return (
    <div className="w-full h-full flex flex-col p-6">
      <h2 className="section-header mb-6">Featured Banner Management</h2>

      {/* Current Featured Post */}
      {currentFeatured && (
        <Card withBorder className="mb-6">
          <Text size="lg" fw={500} className="mb-2">Current Featured Post</Text>
          <div className="flex items-center justify-between">
            <div>
              <Text>{currentFeatured.title}</Text>
              <Text size="sm" c="dimmed">by {currentFeatured.user?.name}</Text>
            </div>
            <Button color="red" onClick={handleRemoveFeatured}>
              Remove Featured
            </Button>
          </div>
        </Card>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <TextInput
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select
          placeholder="Filter by category"
          data={categories.map(cat => ({ value: cat, label: cat }))}
          value={filterCategory}
          onChange={setFilterCategory}
          clearable
        />
        <Button onClick={() => fetchPosts(1)}>Search</Button>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post._id} withBorder className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Text fw={500}>{post.title}</Text>
                  <Text size="sm" c="dimmed">by {post.user?.name} • {post.cat}</Text>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge size="sm">{post.cat}</Badge>
                    {post.featured && <Badge color="yellow">Featured</Badge>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={selectedPost?._id === post._id ? "filled" : "outline"}
                    onClick={() => setSelectedPost(post)}
                    disabled={post.featured}
                  >
                    {selectedPost?._id === post._id ? "Selected" : "Select"}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            total={totalPages}
            value={page}
            onChange={setPage}
          />
        </div>
      )}

      {/* Set Featured Button */}
      {selectedPost && (
        <div className="fixed bottom-6 right-6">
          <Button size="lg" onClick={handleSetFeatured}>
            Set as Featured Post
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeaturedBanner;