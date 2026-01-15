import React, { useEffect, useState } from "react";
import axios from "axios";
import useStore from "../store";
import { API_URI } from "../utils";
import { toast } from "sonner";
import { Pagination, Badge } from "@mantine/core";

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

  return (
    <div className="w-full h-full flex flex-col p-6">
      <h2 className="section-header">Access Logs</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
        Total: {total} logs
        {logs.length ? ` • Showing ${(page - 1) * limit + 1}-${Math.min(page * limit, total)}` : ""}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16 section-container">
          <div className="text-slate-600 dark:text-slate-400">Loading access logs...</div>
        </div>
      ) : logs.length === 0 ? (
        <div className="section-container text-center py-16">
          <p className="muted">No access logs found.</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 overflow-y-auto">
          {logs.map((log) => (
            <div key={log._id} className="section-container group hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-mono text-slate-900 dark:text-white">
                      {log.method} {log.route}
                    </span>
                    <Badge
                      size="sm"
                      variant="light"
                      color={log.success ? "green" : "red"}
                    >
                      {log.success ? "Success" : "Failed"}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                    IP: {log.ip || "Unknown"} • User-Agent: {log.userAgent ? log.userAgent.slice(0, 100) : "Unknown"}
                  </div>
                  {log.userId && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      User: {log.userId?.name || log.userId} ({log.userId?.email || ""})
                    </div>
                  )}
                  {log.meta && Object.keys(log.meta).length > 0 && (
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Meta: {JSON.stringify(log.meta)}
                    </div>
                  )}
                </div>
                <div className="text-sm muted text-right flex-shrink-0 min-w-max">
                  <div className="text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-center section-container">
        <Pagination
          total={Math.max(1, Math.ceil(total / limit))}
          page={page}
          onChange={(p) => setPage(p)}
        />
      </div>
    </div>
  );
};

export default AccessLogs;