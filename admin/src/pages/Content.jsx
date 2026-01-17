import {
  Button,
  Menu,
  Pagination,
  Badge,
  Group,
  useMantineColorScheme,
  Select,
} from "@mantine/core";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useStore from "../store";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useAction, useContent, useDeletePost } from "../hooks/post-hook";
import { formatNumber, updateURL, stripHtml } from "../utils";
import clsx from "clsx";
import { Toaster, toast } from "sonner";
import { AiOutlineEye, AiOutlineSetting } from "react-icons/ai";
import { MdMessage, MdOutlineDeleteOutline } from "react-icons/md";
import moment from "moment";
import { BiDotsVerticalRounded } from "react-icons/bi";
import Loading from "../components/Loading";
import ConfirmDialog from "../components/ConfirmDialog";
import EditPostModal from "../components/EditPostModal";
import useCommentStore from "../store/commentStore";
import Comments from "../components/Comments";

const Contents = () => {
  const { colorScheme } = useMantineColorScheme();

  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [visible, { toggle }] = useDisclosure(false);
  const [opened, { open, close }] = useDisclosure(false);

  const { user } = useStore();
  const { setOpen, commentId, setCommentId } = useCommentStore();

  const { data, isPending, mutate } = useContent(toast, toggle, user?.token, (result) => {
    let fetchedPosts = result?.data || [];
    // Apply current sort
    fetchedPosts = fetchedPosts.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'views':
          return (b.engagedViews || b.views?.length || 0) - (a.engagedViews || a.views?.length || 0);
        default:
          return 0;
      }
    });
    setPosts(fetchedPosts);
  });
  const useDelete = useDeletePost(toast, user?.token);
  const useActions = useAction(toast, user?.token);

  const [selected, setSelected] = useState("");
  const [type, setType] = useState(null);
  const [status, setStatus] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(searchParams.get("page") || 1);

  const theme = colorScheme === "dark";

  const fetchContent = async () => {
    updateURL({ page, navigate, location });
    mutate(page);
  };

  const handleComment = (id, size) => {
    if (size > 0) {
      setCommentId(id);
      setOpen(true);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
  };

  const handlePostUpdated = (updatedPost) => {
    // Update the post in the list
    setPosts((list) => list.map((p) => p._id === updatedPost._id ? { ...p, ...updatedPost } : p));
    setEditingPost(null);
  };

  const handlePerformAction = (val, id, status) => {
    setSelected(id);

    setType(val);
    setStatus(status);

    open();
  };

  const handleActions = () => {
    switch (type) {
      case "delete":
        useDelete.mutate(selected);
        break;
      case "status":
        useActions.mutate({ id: selected, status });
        break;
    }

    fetchContent();
    close();
  };

  useEffect(() => {
    fetchContent();
  }, [page]);

  return (
    <>
      <div className='w-full h-full flex flex-col p-6'>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className='section-header'>
              All Posts
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Total: {data?.totalPost || 0} posts
              {posts?.length ? ` • Showing ${(data?.page - 1) * posts?.length + 1}-${Math.min((data?.page || 1) * posts?.length, data?.totalPost || 0)}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select
              label="Sort by"
              placeholder="Select sort order"
              data={[
                { value: 'newest', label: 'Newest First' },
                { value: 'oldest', label: 'Oldest First' },
                { value: 'title', label: 'Title A-Z' },
                { value: 'views', label: 'Top Engaged' },
              ]}
              value={sortBy}
              onChange={(value) => {
                setSortBy(value);
                // Sort the current posts
                const sorted = [...posts].sort((a, b) => {
                  switch (value) {
                    case 'newest':
                      return new Date(b.createdAt) - new Date(a.createdAt);
                    case 'oldest':
                      return new Date(a.createdAt) - new Date(b.createdAt);
                    case 'title':
                      return a.title.localeCompare(b.title);
                    case 'views':
                      return (b.engagedViews || b.views?.length || 0) - (a.engagedViews || a.views?.length || 0);
                    default:
                      return 0;
                  }
                });
                setPosts(sorted);
              }}
              size="sm"
              style={{ minWidth: 150 }}
            />
          </div>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-16 section-container">
            <div className="text-slate-600 dark:text-slate-400">Loading posts...</div>
          </div>
        ) : posts?.length === 0 ? (
          <div className="section-container text-center py-16">
            <p className="text-slate-600 dark:text-slate-400">No posts found.</p>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto">
            {posts?.map((post) => (
              <div
                key={post._id}
                className="section-container group hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-32 h-20 flex-shrink-0">
                    <img
                      src={post.img}
                      alt={post.title}
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white break-words">
                        {post.title}
                      </h3>
                      <Badge
                        size="sm"
                        variant="light"
                        color={post.approved ? "green" : "yellow"}
                      >
                        {post.approved ? "✓ Approved" : "⏳ Pending"}
                      </Badge>
                      <Badge size="sm" variant="filled" color="indigo">
                        {post.cat || "Uncategorized"}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
                      {stripHtml((post.desc || post.description || "")).slice(0, 150)}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <AiOutlineEye size={16} />
                        <span>{formatNumber(post.engagedViews ?? post.views?.length ?? 0)} engaged</span>
                      </div>
                      <div
                        onClick={() => handleComment(post._id, post.comments?.length || 0)}
                        className="flex items-center gap-1 text-slate-600 dark:text-slate-400 cursor-pointer hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                      >
                        <MdMessage size={16} />
                        <span>{formatNumber(post.comments?.length || 0)} comments</span>
                      </div>
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <span>{moment(post.createdAt).fromNow()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 min-w-max">
                    <div className="mb-3">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {post.user?.name || "Unknown"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {post.user?.email}
                      </div>
                      {post.approved && post.approvedBy && (
                        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                          Approved by: {post.approvedBy?.name || "Unknown"}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                          post.status
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        }`}
                      >
                        {post.status ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <Menu
                      transitionProps={{
                        transition: "rotate-right",
                        duration: 150,
                      }}
                      shadow="lg"
                      position="bottom-end"
                    >
                      <Menu.Target>
                        <Button
                          size="sm"
                          variant="light"
                          className="dark:text-white"
                        >
                          <BiDotsVerticalRounded className="text-lg" />
                        </Button>
                      </Menu.Target>

                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<AiOutlineSetting size={16} />}
                          onClick={() => handleEdit(post)}
                        >
                          Edit Post
                        </Menu.Item>
                        <Menu.Item
                          leftSection={<AiOutlineSetting size={16} />}
                          onClick={() =>
                            handlePerformAction("status", post._id, !post.status)
                          }
                        >
                          {post.status ? "Disable Post" : "Enable Post"}
                        </Menu.Item>

                        <Menu.Divider />

                        <Menu.Label>Danger zone</Menu.Label>

                        <Menu.Item
                          color="red"
                          leftSection={<MdOutlineDeleteOutline size={16} />}
                          onClick={() =>
                            handlePerformAction("delete", post._id)
                          }
                        >
                          Delete Post
                        </Menu.Item>
                      </Menu.Dropdown>
                    </Menu>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className='w-full flex items-center justify-center section-container mt-6'>
          <Pagination
            total={data?.numOfPage || 1}
            siblings={1}
            value={parseInt(page)}
            withEdges
            onChange={(value) => setPage(value)}
          />
        </div>

        <Loading visible={isPending} />
        <Toaster richColors />
      </div>

      <ConfirmDialog
        message='Are you sure you want to perform this action?'
        opened={opened}
        close={close}
        handleClick={handleActions}
      />

      <EditPostModal
        opened={!!editingPost}
        onClose={() => setEditingPost(null)}
        post={editingPost}
        token={user?.token}
        onPostUpdated={handlePostUpdated}
        isApproved={editingPost?.approved}
      />

      {commentId && <Comments />}
    </>
  );
};

export default Contents;
