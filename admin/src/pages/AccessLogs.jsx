import React, { useEffect, useState } from "react";
import axios from "axios";
import useStore from "../store";
import { API_URI } from "../utils";
import { toast } from "sonner";
import { Pagination, Badge, Table, Text, Loader } from "@mantine/core";

const AccessLogs = () => {
  const user = useStore((s) => s.user);
  const token = user?.token;

  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URI}/admin/logs?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res?.data?.success) {
        setLogs(res.data.data || []);
        setTotal(res.data.meta?.total || 0);
      } else {
        toast.error(res?.data?.message || "Unable to load access logs");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err.message || "Failed to load access logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, token]);

  const rows = logs.map((log) => (
    <Table.Tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
      <Table.Td className="text-sm">{new Date(log.createdAt).toLocaleString()}</Table.Td>
      <Table.Td className="text-sm">{log.userId?.name || log.userId || '—'}</Table.Td>
      <Table.Td className="text-sm font-mono">{log.method}</Table.Td>
      <Table.Td className="text-sm">{log.route}</Table.Td>
      <Table.Td className="text-sm"><Badge size="xs" color={log.success ? 'green' : 'red'}>{log.success ? 'Success' : 'Failed'}</Badge></Table.Td>
      <Table.Td className="text-sm">{log.ip || '—'}</Table.Td>
      <Table.Td className="text-sm">{log.userAgent ? log.userAgent.slice(0, 80) + (log.userAgent.length > 80 ? '…' : '') : '—'}</Table.Td>
    </Table.Tr>
  ));

  return (
    <div className="w-full h-full flex flex-col p-6">
      <h2 className="section-header">Access Logs</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Total: {total} logs {logs.length ? ` • Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)}` : ""}</p>

      {loading ? (
        <div className="flex items-center justify-center py-16 section-container"><Loader /></div>
      ) : logs.length === 0 ? (
        <div className="section-container text-center py-16"><Text className="text-slate-600 dark:text-slate-400">No access logs found.</Text></div>
      ) : (
        <div className="table-container overflow-x-auto space-y-4 flex-1">
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Time</Table.Th>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">User</Table.Th>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Method</Table.Th>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Route</Table.Th>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Status</Table.Th>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">IP</Table.Th>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">User Agent</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows}
            </Table.Tbody>
          </Table>
        </div>
      )}

      <div className="mt-6 flex items-center justify-center section-container">
        <Pagination total={Math.max(1, Math.ceil(total / limit))} page={page} onChange={(p) => setPage(p)} />
      </div>
    </div>
  );
};

export default AccessLogs;