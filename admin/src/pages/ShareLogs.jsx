import React, { useEffect, useState, useMemo } from "react";
import useStore from "../store";
import { API_URI } from "../utils";
import { TextInput, Select, Button, Badge, Group, Table, Pagination, Text, Loader, ActionIcon } from "@mantine/core";
import { IconExternalLink, IconDownload, IconCopy } from '@tabler/icons-react';

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch (e) {
    return iso;
  }
};

const ShareLogs = () => {
  const token = useStore((s) => s.user?.token);
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [platform, setPlatform] = useState("");
  const [postFilter, setPostFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const buildQuery = (p = 1) => {
    const parts = [`page=${p}`, `limit=${limit}`];
    if (platform) parts.push(`platform=${encodeURIComponent(platform)}`);
    if (postFilter) parts.push(`post=${encodeURIComponent(postFilter)}`);
    if (startDate) parts.push(`startDate=${encodeURIComponent(startDate)}`);
    if (endDate) parts.push(`endDate=${encodeURIComponent(endDate)}`);
    return parts.join('&');
  };

  const copyPostLink = (post) => {
    try {
      const url = `${window.location.origin}/${post.slug || post._id}`;
      navigator.clipboard.writeText(url);
    } catch (e) {
      // ignore
    }
  };

  const exportCSV = () => {
    if (!logs || logs.length === 0) return;
    const header = ['Date','Post','Platform','Method','User','IP'];
    const rows = logs.map(l => [formatDate(l.createdAt), l.post?.title || l.post?.slug || '', l.platform || '', l.method || '', l.user?.email || l.user?.name || '', l.ip || '']);
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `share-logs-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const qs = buildQuery(p);
      const res = await fetch(`${API_URI}/admin/share-logs?${qs}`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      const j = await res.json();
      if (j.success) {
        setLogs(j.data || []);
        setTotal(j.meta?.total || 0);
        setPage(j.meta?.page || p);
      } else {
        setLogs([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('fetch share logs error', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full h-full flex flex-col p-6">
      <h2 className='section-header'>Share Logs Analytics</h2>

      <div className='mb-6 section-container'>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Filters</h3>
        <div className='flex gap-3 items-end flex-wrap'>
          <Select
            data={[{ value: '', label: 'Any' }, { value: 'twitter', label: 'Twitter' }, { value: 'facebook', label: 'Facebook' }, { value: 'whatsapp', label: 'WhatsApp' }, { value: 'native', label: 'Native' }, { value: 'copy', label: 'Copy' }, { value: 'unknown', label: 'Unknown' }]}
            value={platform}
            onChange={(v) => setPlatform(v || '')}
            label="Platform"
            placeholder="Any"
            style={{ minWidth: 180 }}
          />

          <TextInput value={postFilter} onChange={(e) => setPostFilter(e.target.value)} placeholder='Post ID, slug or title' label='Post' style={{ minWidth: 260 }} />

          <TextInput type='date' value={startDate} onChange={(e) => setStartDate(e.target.value)} label='Start Date' style={{ minWidth: 180 }} />

          <TextInput type='date' value={endDate} onChange={(e) => setEndDate(e.target.value)} label='End Date' style={{ minWidth: 180 }} />

          <Group>
            <Button onClick={() => fetchLogs(1)}>Apply</Button>
            <Button variant="default" onClick={() => { setPlatform(''); setPostFilter(''); setStartDate(''); setEndDate(''); fetchLogs(1); }}>Reset</Button>
          </Group>
          <Group className='ml-auto'>
            <Button leftIcon={<IconDownload size={16} />} variant="outline" onClick={exportCSV}>Export CSV</Button>
          </Group>
        </div>
      </div>

      <div className='table-container overflow-x-auto flex-1 mb-4'>
        {loading ? (
          <div className='w-full h-40 flex items-center justify-center'><Loader /></div>
        ) : logs.length === 0 ? (
          <div className='section-container text-center py-16'>
            <Text className='text-slate-600 dark:text-slate-400'>No share logs found</Text>
          </div>
        ) : (
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Date</Table.Th>
                <Table.Th>Post</Table.Th>
                <Table.Th>Platform</Table.Th>
                <Table.Th>Method</Table.Th>
                <Table.Th>User</Table.Th>
                <Table.Th>IP</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {logs.map((log) => (
                <Table.Tr key={log._id}>
                  <Table.Td>{formatDate(log.createdAt)}</Table.Td>
                  <Table.Td>
                    {log.post ? (
                      <Group spacing={6} position='apart'>
                        <a href={`/${log.post.slug || log.post._id}`} target='_blank' rel='noreferrer' className='font-semibold text-blue-600 dark:text-blue-400'>{log.post.title || log.post.slug}</a>
                        <ActionIcon size='xs' onClick={() => copyPostLink(log.post)} title='Copy link'><IconCopy size={14} /></ActionIcon>
                      </Group>
                    ) : (
                      <Text size='sm' color='dimmed'>—</Text>
                    )}
                  </Table.Td>
                  <Table.Td><Badge color='gray' variant='light'>{log.platform || 'unknown'}</Badge></Table.Td>
                  <Table.Td>{log.method || 'copy'}</Table.Td>
                  <Table.Td>{log.user ? (log.user.name || log.user.email) : <Text color='dimmed'>anonymous</Text>}</Table.Td>
                  <Table.Td style={{ fontFamily: 'monospace' }}>{log.ip || '—'}</Table.Td>
                  <Table.Td>
                    <Group spacing={6}>
                      {log.post && <ActionIcon component='a' href={`/${log.post.slug || log.post._id}`} target='_blank' rel='noreferrer'><IconExternalLink size={16} /></ActionIcon>}
                      {log.post && <ActionIcon onClick={() => copyPostLink(log.post)}><IconCopy size={16} /></ActionIcon>}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </div>

      <div className='section-container flex items-center justify-between'>
        <div className='muted font-semibold'>Total: <span className='text-slate-900 dark:text-white'>{total}</span> logs</div>
        <Pagination total={Math.max(1, Math.ceil(total / limit))} page={page} onChange={(p) => { setPage(p); fetchLogs(p); }} />
      </div>
    </div>
  );
};

export default ShareLogs;
