import React, { useState } from "react";
import useStore from "../store";
import { uploadImage, updateUser, requestPasswordReset } from "../utils/apiCalls";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const store = useStore();
  const userState = store?.user;
  const signIn = store?.signIn;
  const navigate = useNavigate();

  const [name, setName] = useState(userState?.user?.name || "");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(userState?.user?.image || "");
  const [submitting, setSubmitting] = useState(false);

  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imageUrl = userState?.user?.image;
      if (file) {
        const res = await uploadImage(file);
        if (!res || !res.url) {
          toast.error("Image upload failed. Try again.");
          setSubmitting(false);
          return;
        }
        imageUrl = res.url;
      }

      const payload = { name: name?.trim(), image: imageUrl };
      const resp = await updateUser(payload);
      if (!resp || !resp.success) {
        toast.error(resp?.message || "Update failed");
        setSubmitting(false);
        return;
      }

      // Refresh local auth state with returned token/user
      if (resp.token && resp.user) {
        signIn({ token: resp.token, user: resp.user });
      }

      toast.success(resp?.message || "Profile updated");
      setSubmitting(false);
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error("Unable to update profile. Try again.");
      setSubmitting(false);
    }
  };

    const handleRequestReset = async () => {
      try {
        const resp = await requestPasswordReset();
        if (resp?.message) {
          toast.success(resp.message || 'Password reset email sent');
        } else {
          toast.error(resp?.message || 'Unable to request password reset');
        }
      } catch (err) {
        console.error(err);
        toast.error('Unable to request password reset');
      }
    };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <h2 className="text-2xl font-semibold mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded shadow">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100">
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl text-gray-400">?</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Profile image</label>
            <input type="file" accept="image/*" onChange={onFileChange} />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded border bg-gray-50 dark:bg-gray-900"
            placeholder="Your full name"
          />
        </div>

        <div className="flex items-center gap-3">
          <button disabled={submitting} type="submit" className="px-4 py-2 bg-slate-900 text-white rounded">
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
            <button type="button" onClick={handleRequestReset} className="px-4 py-2 rounded border">
              Reset password
            </button>
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 rounded border">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
