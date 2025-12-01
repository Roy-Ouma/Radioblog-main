import { Pagination, Table, useMantineColorScheme } from "@mantine/core";
import useStore from "../store";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useDisclosure } from "@mantine/hooks";
import { useEffect, useState } from "react";
import { useFollowers } from "../hooks/followers-hook";
import { toast, Toaster } from "sonner";
import { formatNumber, getInitials, updateURL } from "../utils";
import Loading from "../components/Loading";
import moment from "moment";
import axios from "axios";
import { API_URI } from "../utils";
import { modals } from "@mantine/modals";

const Followers = () => {
  const { colorScheme } = useMantineColorScheme();

  const { user } = useStore();
  const token = user?.token;
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [visible, { toggle }] = useDisclosure(false);
  const { data, isPending, mutate } = useFollowers(toast, toggle, user?.token);
  const [page, setPage] = useState(searchParams.get("page") || 1);

  const theme = colorScheme === "dark";

  useEffect(() => {
    const fetchFollowers = () => {
      updateURL({ page, navigate, location });
      mutate(page);
    };

    fetchFollowers();
  }, [page]);

  return (
    <div className='w-full h-full flex flex-col p-6'>
      <h2 className="section-header">Followers Management</h2>

      <div className="table-container overflow-x-auto flex-1 mb-4">
        <Table highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Name</Table.Th>
              <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Account</Table.Th>
              <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Followers</Table.Th>
              <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Joined Date</Table.Th>
              <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Action</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {data?.data?.map(({ _id, followerId, createdAt }) => (
              <Table.Tr
                key={_id}
                className='hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700'
              >
                <Table.Td className='flex gap-2 items-center text-slate-900 dark:text-white'>
                  {followerId.image ? (
                    <img
                      src={followerId.image}
                      alt={followerId.name}
                      className='w-10 h-10 rounded-full object-cover'
                    />
                  ) : (
                    <p className='w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 dark:bg-indigo-700 text-white font-semibold'>
                      {getInitials(followerId.name)}
                    </p>
                  )}
                  <span>{followerId.name}</span>
                </Table.Td>

                <Table.Td>
                  <span
                    className={`${
                      followerId?.accountType === "User"
                        ? "bg-rose-600 dark:bg-rose-700"
                        : "bg-blue-600 dark:bg-blue-700"
                    } text-white font-semibold px-4 py-1 rounded-full w-fit text-sm`}
                  >
                    {followerId?.accountType}
                  </span>
                </Table.Td>

                <Table.Td className='text-slate-900 dark:text-white font-semibold'>
                  {formatNumber(followerId?.followers.length ?? 0)}
                </Table.Td>

                <Table.Td className='text-slate-900 dark:text-white'>{moment(createdAt).fromNow()}</Table.Td>
                <Table.Td>
                  <button
                    onClick={() => {
                      modals.openConfirmModal({
                        title: 'Unfollow',
                        children: <div>Are you sure you want to remove this follower?</div>,
                        labels: { confirm: 'Unfollow', cancel: 'Cancel' },
                        confirmProps: { color: 'red' },
                        onConfirm: async () => {
                          try {
                            const res = await axios.delete(`${API_URI}/admin/followers/${_id}`, {
                              headers: { Authorization: `Bearer ${token}` },
                            });
                            if (res.data?.success) {
                              toast.success('Follower removed');
                              // refresh current page
                              mutate(page);
                            } else {
                              toast.error(res.data?.message || 'Unable to remove follower');
                            }
                          } catch (err) {
                            console.error(err);
                            toast.error(err?.response?.data?.message || 'Unable to remove follower');
                          }
                        },
                      });
                    }}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Unfollow
                  </button>
                </Table.Td>
              </Table.Tr>
            ))}

            {data?.data?.length < 1 && (
              <Table.Tr>
                <Table.Td colSpan={4} className="text-center muted py-8">No followers found</Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </div>

      <div className='w-full flex items-center justify-center section-container'>
        <Pagination
          total={data?.numOfPages}
          siblings={1}
          defaultValue={data?.page}
          withEdges
          onChange={(value) => setPage(value)}
        />
      </div>

      <Loading visible={isPending} />
      <Toaster richColors />
    </div>
  );
};

export default Followers;
