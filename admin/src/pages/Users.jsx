import React, { useEffect, useState } from "react";
import { Table, Button, Text, Loader, Modal, TextInput, FileInput, Group } from "@mantine/core";
import axios from "axios";
import { API_URI } from "../utils";
import useStore from "../store";
import { Toaster, toast } from "sonner";
import { uploadFile } from "../utils";

const Users = () => {
  const { user } = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URI}/users/get-user`);
      if (data?.success) setUsers(data.users || []);
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (id, current) => {
    const newRole = current === "Writer" ? "User" : "Writer";
    try {
      const { data } = await axios.patch(
        `${API_URI}/users/update-role/${id}`,
        { accountType: newRole },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      if (data?.success) {
        toast.success(data.message || "Updated");
        setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to update role");
    }
  };

  const promoteAdmin = async (id, isGeneralAdmin) => {
    try {
      const { data } = await axios.post(
        `${API_URI}/admin/users/${id}/role`,
        { accountType: 'Admin', isGeneralAdmin: !isGeneralAdmin },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      if (data?.success) {
        toast.success(data.message || 'Updated');
        setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update role');
    }
  };

  const handleAdminReset = async (id) => {
    try {
      const { data } = await axios.post(`${API_URI}/admin/users/${id}/reset-password`, {}, { headers: { Authorization: `Bearer ${user?.token}` } });
      if (data?.message) {
        toast.success(data.message || 'Password reset initiated');
      } else {
        toast.error(data?.message || 'Failed to initiate password reset');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to initiate password reset');
    }
  };

  const togglePosting = async (id, currentCanPost) => {
    try {
      const { data } = await axios.post(
        `${API_URI}/admin/users/${id}/toggle-posting`,
        { enable: !currentCanPost },
        { headers: { Authorization: `Bearer ${user?.token}` } }
      );
      if (data?.success) {
        toast.success(data.message || 'Updated');
        setUsers((prev) => prev.map((u) => (u._id === id ? data.user : u)));
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to toggle posting');
    }
  };

  // Admin edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState(null);
  const [editPreview, setEditPreview] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (u) => {
    setEditingUser(u);
    setEditName(u.name || "");
    setEditPreview(u.image || "");
    setEditFile(null);
    setEditOpen(true);
  };

  const handleFileChange = (f) => {
    setEditFile(f);
    if (f) {
      setEditPreview(URL.createObjectURL(f));
    } else {
      setEditPreview(editingUser?.image || "");
    }
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      let imageUrl = editingUser.image;
      if (editFile) {
        imageUrl = await uploadFile(editFile);
      }

      const payload = { name: editName?.trim(), image: imageUrl };
      const { data } = await axios.patch(`${API_URI}/users/update/${editingUser._id}`, payload, { headers: { Authorization: `Bearer ${user?.token}` } });
      if (data?.success) {
        toast.success(data.message || 'User updated');
        setUsers((prev) => prev.map((u) => (u._id === editingUser._id ? data.user : u)));
        setEditOpen(false);
        setEditingUser(null);
      } else {
        toast.error(data?.message || 'Update failed');
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setSavingEdit(false);
    }
  };
  
  // Admin reset confirmation modal state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmUser, setConfirmUser] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const openConfirm = (u) => {
    setConfirmUser(u);
    setConfirmOpen(true);
  };

  const doConfirmReset = async () => {
    if (!confirmUser) return;
    setConfirmLoading(true);
    try {
      await handleAdminReset(confirmUser._id);
      setConfirmOpen(false);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-6">
      <h2 className="section-header">User Management</h2>

      {loading ? (
        <div className="flex items-center justify-center py-16 section-container"><Loader /></div>
      ) : (
        <div className="table-container overflow-x-auto">
          <Table highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Name</Table.Th>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Email</Table.Th>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Account Type</Table.Th>
                <Table.Th className="bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white">Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {users?.length === 0 && (
                <tr><td colSpan={4}><Text className="text-center text-slate-600 dark:text-slate-400">No users found</Text></td></tr>
              )}
              {users?.map((u) => (
                <Table.Tr key={u._id} className="hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  <Table.Td className="text-slate-900 dark:text-white">{u.name}</Table.Td>
                  <Table.Td className="text-slate-900 dark:text-white">{u.email}</Table.Td>
                  <Table.Td className="text-slate-900 dark:text-white">
                    <div className="flex flex-col gap-1">
                      <div className="font-semibold">{u.accountType}</div>
                      <div className="text-xs muted">Posting: {u.canPost ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </Table.Td>
                  <Table.Td>
                    <div className="flex gap-2 flex-wrap">
                      <Button size="xs" variant="outline" onClick={() => openEdit(u)} className="dark:text-white dark:border-slate-600">Edit</Button>
                      <Button size="xs" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700" onClick={() => toggleRole(u._id, u.accountType)}>
                        {u.accountType === "Writer" ? "Make User" : "Make Writer"}
                      </Button>
                      <Button size="xs" variant="outline" onClick={() => openConfirm(u)} className='dark:text-white dark:border-slate-600'>Reset</Button>
                      <Button size="xs" color={u.isGeneralAdmin ? 'red' : 'blue'} onClick={() => promoteAdmin(u._id, u.isGeneralAdmin)}>
                        {u.isGeneralAdmin ? 'Demote Admin' : 'Promote Admin'}
                      </Button>
                      <Button size="xs" color={u.canPost ? 'red' : 'green'} onClick={() => togglePosting(u._id, u.canPost)}>
                        {u.canPost ? 'Disable Posting' : 'Enable Posting'}
                      </Button>
                    </div>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}

      <Toaster richColors />
      <Modal opened={editOpen} onClose={() => setEditOpen(false)} title="Edit user">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              {editPreview ? (
                // eslint-disable-next-line jsx-a11y/img-redundant-alt
                <img src={editPreview} alt="preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">?</div>
              )}
            </div>
            <div>
              <TextInput label="Full name" value={editName} onChange={(e) => setEditName(e.target.value)} />
              <FileInput placeholder="Upload image" accept="image/*" onChange={handleFileChange} />
            </div>
          </div>
          <Group position="right">
            <Button variant="default" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={saveEdit} loading={savingEdit}>Save</Button>
          </Group>
        </div>
      </Modal>
      <Modal opened={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm password reset">
        <div className="space-y-4">
          <div>Are you sure you want to send a password reset email to <strong>{confirmUser?.email}</strong>?</div>
          <Group position="right">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button color="red" onClick={doConfirmReset} loading={confirmLoading}>Send reset</Button>
          </Group>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
