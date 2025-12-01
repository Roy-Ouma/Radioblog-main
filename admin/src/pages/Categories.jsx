import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URI } from "../utils";
import useStore from "../store";
import { toast } from "sonner";
import Loading from "../components/Loading";
import { modals } from "@mantine/modals";

const Categories = () => {
  const { user } = useStore();
  const token = user?.token;

  const [categories, setCategories] = useState([]);
  const [label, setLabel] = useState("");
  const [color, setColor] = useState("bg-gray-600");
  const [loading, setLoading] = useState(false);

  const fetchCats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URI}/admin/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Unable to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCats();
  }, []);

  const handleCreate = async () => {
    if (!label.trim()) return toast.error("Label is required");
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URI}/admin/categories`,
        { label: label.trim(), color, icon: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.success) {
        toast.success("Category created");
        setLabel("");
        setColor("bg-gray-600");
        fetchCats();
      } else {
        toast.error(res.data?.message || "Create failed");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    modals.openConfirmModal({
      title: "Delete category",
      children: <div>Are you sure you want to delete this category?</div>,
      labels: { confirm: "Delete", cancel: "Cancel" },
      confirmProps: { color: "red" },
      onConfirm: async () => {
        try {
          setLoading(true);
          const res = await axios.delete(`${API_URI}/admin/categories/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data?.success) {
            toast.success("Category deleted");
            fetchCats();
          } else {
            toast.error(res.data?.message || "Delete failed");
          }
        } catch (err) {
          console.error(err);
          toast.error(err?.response?.data?.message || "Delete failed");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Manage Categories</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Create and manage content categories</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Label</label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g., Technology" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">Color Class</label>
          <input value={color} onChange={(e) => setColor(e.target.value)} placeholder="e.g., bg-blue-600" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-orange-500" />
          <button onClick={handleCreate} className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors">Create Category</button>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          {loading ? (
            <div className="py-16 flex justify-center"><Loading visible={true} /></div>
          ) : (
            <div className="space-y-3">
              {categories.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-slate-500 dark:text-slate-400">No categories yet. Create one to get started!</p>
                </div>
              ) : (
                categories.map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className={`${c.color} w-10 h-10 rounded-lg shadow-sm`} />
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{c.label}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{c.color}</div>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(c._id)} className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">Delete</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Categories;
