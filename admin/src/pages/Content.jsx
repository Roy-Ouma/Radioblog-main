import {
  Button,
  Menu,
  Pagination,
  Table,
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
        <h2 className='section-header'>
          Contents ({" "}
          <span>
            {data?.data?.length * data?.page +
              " of " +
              data?.totalPost +
              " records"}
          </span>
          )
        </h2>

        <div className='table-container overflow-x-auto flex-1 mb-4'>
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className='bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'>Post Title</Table.Th>
                <Table.Th className='bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'>Approved</Table.Th>
                <Table.Th className='bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'>Category</Table.Th>
                <Table.Th className='bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'>Views</Table.Th>
                <Table.Th className='bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'>Comments</Table.Th>
                <Table.Th className='bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'>Post Date</Table.Th>
                <Table.Th className='bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'>Status</Table.Th>
                <Table.Th className='bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {data?.data?.length > 0 &&
                data.data.map((el) => (
                  <Table.Tr
                    key={el._id}
                    className='hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700'
                  >
                    <Table.Td className='flex gap-2 items-center text-slate-900 dark:text-white'>
                      <img
                        src={el?.img}
                        alt={el?.title}
                        className='w-10 h-10 rounded-full object-cover'
                      />

                      <p className='text-base'>{el?.title}</p>
                    </Table.Td>

                    <Table.Td className='text-slate-900 dark:text-white'>
                      {el?.approved ? (
                        <div className="text-sm">
                          <div>By: {el?.approvedBy?.name || "—"}</div>
                          <div className='muted'>
                            {el?.approvedAt
                              ? new Date(el.approvedAt).toLocaleString()
                              : ""}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold">Pending</span>
                      )}
                    </Table.Td>

                    <Table.Td className='text-slate-900 dark:text-white'>{el?.cat}</Table.Td>

                    <Table.Td className='text-slate-900 dark:text-white'>
                      <div className='flex gap-1 items-center'>
                        <AiOutlineEye size={18} />
                        {formatNumber(el?.views?.length)}
                      </div>
                    </Table.Td>

                    <Table.Td
                      onClick={() => handleComment(el?._id, el?.comments?.length)}
                      className='text-slate-900 dark:text-white cursor-pointer hover:text-orange-600 dark:hover:text-orange-400'
                    >
                      <div className='flex gap-1 items-center'>
                        <MdMessage size={18} className='text-slate-500 dark:text-slate-400' />
                        {formatNumber(el?.comments?.length)}
                      </div>
                    </Table.Td>

                    <Table.Td className='text-slate-900 dark:text-white'>{moment(el?.createdAt).fromNow()}</Table.Td>

                    <Table.Td>
                      <span
                        className={`${
                          el?.status
                            ? "bg-green-600 dark:bg-green-700 text-white"
                            : "bg-red-600 dark:bg-red-700 text-white"
                        } rounded-full font-semibold px-4 py-1.5 text-sm`}
                      >
                        {el?.status === true ? "Active" : "Disabled"}
                      </span>
                    </Table.Td>

                    <Table.Td width={5}>
                      <Menu
                        transitionProps={{
                          transition: "rotate-right",
                          duration: 150,
                        }}
                        shadow='lg'
                        width={200}
                      >
                        <Menu.Target>
                          <Button className='dark:text-white'>
                            <BiDotsVerticalRounded
                              className='text-lg'
                            />
                          </Button>
                        </Menu.Target>

                        <Menu.Dropdown>
                          <Menu.Item
                            leftSection={<AiOutlineSetting />}
                            onClick={() =>
                              handlePerformAction("status", el?._id, !el?.status)
                            }
                          >
                            {el?.status ? "Disable" : "Enable"}
                          </Menu.Item>

                          <Menu.Divider />

                          <Menu.Label>Danger zone</Menu.Label>

                          <Menu.Item
                            color='red'
                            leftSection={<MdOutlineDeleteOutline />}
                            onClick={() => handlePerformAction("delete", el?._id)}
                          >
                            Delete Post
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </div>

        <div className='w-full flex items-center justify-center section-container'>
          <Pagination
            total={data?.numOfPage}
            siblings={1}
            defaultValue={data?.page}
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
