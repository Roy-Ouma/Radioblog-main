import {
  Button,
  Menu,
  Pagination,
  Badge,
  Group,
  useMantineColorScheme,
} from "@mantine/core";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import useStore from "../store";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useAction, useContent, useDeletePost } from "../hooks/post-hook";
import { formatNumber, updateURL } from "../utils";
import clsx from "clsx";
import { Toaster, toast } from "sonner";
import { AiOutlineEye, AiOutlineSetting } from "react-icons/ai";
import { MdMessage, MdOutlineDeleteOutline } from "react-icons/md";
import moment from "moment";
import { BiDotsVerticalRounded } from "react-icons/bi";
import Loading from "../components/Loading";
import ConfirmDialog from "../components/ConfirmDialog";
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

  const { data, isPending, mutate } = useContent(toast, toggle, user?.token);
  const useDelete = useDeletePost(toast, user?.token);
  const useActions = useAction(toast, user?.token);

  const [selected, setSelected] = useState("");
  const [type, setType] = useState(null);
  const [status, setStatus] = useState(null);
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
              {data?.data?.length ? ` • Showing ${(data?.page - 1) * data?.data?.length + 1}-${Math.min((data?.page || 1) * data?.data?.length, data?.totalPost || 0)}` : ""}
            </p>
          </div>
        </div>

        {isPending ? (
          <div className="flex items-center justify-center py-16 section-container">
            <div className="text-slate-600 dark:text-slate-400">Loading posts...</div>
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="section-container text-center py-16">
            <p className="text-slate-600 dark:text-slate-400">No posts found.</p>
          </div>
        ) : (
          <div className="space-y-4 flex-1 overflow-y-auto">
            {data?.data?.map((post) => (
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
                      {(post.desc || post.description || "").slice(0, 150)}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                        <AiOutlineEye size={16} />
                        <span>{formatNumber(post.views?.length || 0)} views</span>
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

      {commentId && <Comments />}
    </>
  );
};

export default Contents;
