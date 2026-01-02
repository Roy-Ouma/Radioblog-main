import React, { useState } from "react";
import { Modal, Button, Textarea, TextInput, Group, Stack, Tabs, ScrollArea, Badge, Text, Grid, Image, Paper, Loader } from "@mantine/core";
import { toast } from "sonner";
import axios from "axios";
import { API_URI } from "../utils";

const EditPostModal = ({ opened, onClose, post, token, onPostUpdated, isApproved }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(post ? {
    title: post.title || "",
    desc: post.desc || "",
    img: post.img || "",
    cat: post.cat || "",
  } : {});
  const [isSaving, setIsSaving] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    if (post) {
      // Handle both 'desc' and 'description' field names for backwards compatibility
      const description = post.desc || post.description || "";
      const imgUrl = post.img || "";
      setFormData({
        title: post.title || "",
        desc: description,
        img: imgUrl,
        cat: post.cat || "",
      });
      setImageLoaded(false);
      setImageError(false);
      console.log("Modal loaded with post:", { 
        title: post.title, 
        hasImg: !!imgUrl, 
        imgUrl, 
        hasDesc: !!description,
        descLength: description?.length 
      });
      setIsEditing(false);
    }
  }, [post]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.desc.trim()) {
      toast.error("Description is required");
      return;
    }

    setIsSaving(true);
    try {
      const res = await axios.patch(`${API_URI}/admin/posts/${post._id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res?.data?.success) {
        toast.success("Post updated successfully");
        onPostUpdated(res.data.data);
        setIsEditing(false);
      } else {
        toast.error(res?.data?.message || "Failed to update post");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err?.response?.data?.message || err.message || "Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  if (!post) return null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title={<span className="text-lg font-bold">Post Details</span>}
      centered
      scrollAreaComponent={ScrollArea.Autosize}
      classNames={{
        header: "bg-slate-50 dark:bg-slate-800",
        content: "bg-white dark:bg-slate-900"
      }}
    >
      <Tabs defaultValue="preview" orientation="vertical" className="h-full">
        <Tabs.List>
          <Tabs.Tab value="preview" label="Preview" />
          {!isEditing && <Tabs.Tab value="edit" label="Edit" onClick={() => setIsEditing(true)} />}
        </Tabs.List>

        <Tabs.Panel value="preview" className="flex-1">
          <ScrollArea className="h-full">
            <div className="pr-4 space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <Badge 
                  size="lg"
                  variant="light"
                  color={isApproved ? "green" : "yellow"}
                >
                  {isApproved ? "✓ Approved" : "⏳ Pending Review"}
                </Badge>
              </div>

              {/* Cover Image */}
              {formData.img ? (
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  {!imageLoaded && !imageError && (
                    <div className="h-64 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                      <Loader size="sm" />
                    </div>
                  )}
                  {!imageError ? (
                    <Image
                      src={formData.img}
                      alt={formData.title || "Post"}
                      height={imageLoaded ? 300 : 0}
                      fit="cover"
                      radius="md"
                      onLoad={() => setImageLoaded(true)}
                      onError={(e) => {
                        console.log("Image load error:", e);
                        setImageError(true);
                        toast.error("Unable to load image from Supabase. Please verify the image URL exists in your storage.");
                      }}
                    />
                  ) : null}
                  {imageError && (
                    <div className="h-64 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-700">
                      <Text className="text-red-600 dark:text-red-400 text-center mb-2">
                        Failed to load image
                      </Text>
                      <Text className="text-xs text-slate-500 dark:text-slate-400 text-center px-4 max-w-sm break-all">
                        {formData.img}
                      </Text>
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-700 h-64 flex items-center justify-center">
                  <Text className="text-slate-500 dark:text-slate-400">No cover image</Text>
                </div>
              )}

              {/* Title */}
              <div>
                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Title
                </Text>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {formData.title}
                </h2>
              </div>

              {/* Category */}
              {formData.cat && (
                <div>
                  <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                    Category
                  </Text>
                  <Badge variant="filled" size="md" className="bg-indigo-500">
                    {formData.cat}
                  </Badge>
                </div>
              )}

              {/* Metadata */}
              <Paper className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <Grid gutter="sm">
                  <Grid.Col span={6}>
                    <div>
                      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Created By
                      </Text>
                      <Text className="font-medium text-slate-900 dark:text-white">
                        {post.user?.name || "Unknown"}
                      </Text>
                    </div>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <div>
                      <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Created Date
                      </Text>
                      <Text className="font-medium text-slate-900 dark:text-white">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </Text>
                    </div>
                  </Grid.Col>
                  {isApproved && post.approvedBy && (
                    <>
                      <Grid.Col span={6}>
                        <div>
                          <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                            Approved By
                          </Text>
                          <Text className="font-medium text-slate-900 dark:text-white">
                            {post.approvedBy?.name || "Admin"}
                          </Text>
                        </div>
                      </Grid.Col>
                      <Grid.Col span={6}>
                        <div>
                          <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                            Approved Date
                          </Text>
                          <Text className="font-medium text-slate-900 dark:text-white">
                            {post.approvedAt ? new Date(post.approvedAt).toLocaleDateString() : "N/A"}
                          </Text>
                        </div>
                      </Grid.Col>
                    </>
                  )}
                </Grid>
              </Paper>

              {/* Description */}
              <div>
                <Text className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Content
                </Text>
                {formData.desc && formData.desc.trim() ? (
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap min-h-32 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      {formData.desc}
                    </div>
                  </div>
                ) : (
                  <div className="min-h-32 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex items-center justify-center">
                    <div className="text-center">
                      <Text className="text-yellow-700 dark:text-yellow-400 font-semibold mb-1">
                        ⚠️ No content available
                      </Text>
                      <Text className="text-xs text-yellow-600 dark:text-yellow-500">
                        The post description appears to be empty. Please edit the post to add content.
                      </Text>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </Tabs.Panel>

        <Tabs.Panel value="edit" className="flex-1">
          {isEditing ? (
            <ScrollArea className="h-full">
              <Stack gap="md" className="pr-4">
                <div>
                  <label className="text-sm font-semibold text-slate-900 dark:text-white block mb-2">
                    Title
                  </label>
                  <TextInput
                    placeholder="Post title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 dark:text-white block mb-2">
                    Category
                  </label>
                  <TextInput
                    placeholder="e.g., Technology, News, Entertainment"
                    value={formData.cat}
                    onChange={(e) => handleInputChange("cat", e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 dark:text-white block mb-2">
                    Cover Image URL
                  </label>
                  <TextInput
                    placeholder="https://example.com/image.jpg"
                    value={formData.img}
                    onChange={(e) => handleInputChange("img", e.target.value)}
                    className="w-full"
                  />
                  {formData.img && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                      <Image
                        src={formData.img}
                        alt="Preview"
                        height={200}
                        fit="cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-900 dark:text-white block mb-2">
                    Content
                  </label>
                  <Textarea
                    placeholder="Post content..."
                    value={formData.desc}
                    onChange={(e) => handleInputChange("desc", e.target.value)}
                    rows={12}
                    className="w-full"
                    classNames={{
                      input: "font-mono text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    }}
                  />
                </div>

                <Group justify="flex-end" gap="sm">
                  <Button
                    variant="default"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={isSaving}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Save Changes
                  </Button>
                </Group>
              </Stack>
            </ScrollArea>
          ) : (
            <div className="flex items-center justify-center py-12">
              <Button
                onClick={() => setIsEditing(true)}
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Edit Post
              </Button>
            </div>
          )}
        </Tabs.Panel>
      </Tabs>
    </Modal>
  );
};

export default EditPostModal;
