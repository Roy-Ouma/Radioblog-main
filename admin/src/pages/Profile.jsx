import React, { useState, useEffect } from "react";
import {
  Button,
  TextInput,
  Stack,
  Group,
  useMantineColorScheme,
  Avatar,
  Paper,
  Divider,
  Text,
  Modal,
} from "@mantine/core";
import { Toaster, toast } from "sonner";
import axios from "axios";
import clsx from "clsx";
import useStore from "../store/index";
import { API_URI } from "../utils";

const Profile = () => {
  const { colorScheme } = useMantineColorScheme();
  const theme = colorScheme === "dark";
  const { user, signIn, signOut } = useStore();

  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    author_name: "",
    author_avatar_url: "",
  });
  const [previewUrl, setPreviewUrl] = useState("");

  // Display name logic: author_name if set, else Google name
  const displayName = formData.author_name || user?.name || "User";
  // Avatar logic: author_avatar_url if set, else Google image
  const avatarUrl = formData.author_avatar_url || user?.image || "";

  useEffect(() => {
    if (user) {
      setFormData({
        author_name: user.author_name || "",
        author_avatar_url: user.author_avatar_url || "",
      });
      setPreviewUrl(user.author_avatar_url || user.image || "");
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Please upload a JPG, PNG, or WebP image");
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setFormData((prev) => ({
        ...prev,
        author_avatar_url: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(user?.image || "");
    setFormData((prev) => ({
      ...prev,
      author_avatar_url: null,
    }));
  };

  const handleSave = async () => {
    if (!formData.author_name.trim()) {
      toast.error("Author name is required");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        author_name: formData.author_name.trim() || null,
        author_avatar_url: formData.author_avatar_url || null,
      };

      const { data } = await axios.patch(
        `${API_URI}/users/update`,
        payload,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      if (data?.success) {
        // Update store with new user data
        localStorage.setItem("user", JSON.stringify(data.user));
        signIn(data);
        toast.success("Profile updated successfully");
      } else {
        toast.error(data?.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRevert = () => {
    if (user) {
      setFormData({
        author_name: user.author_name || "",
        author_avatar_url: user.author_avatar_url || "",
      });
      setPreviewUrl(user.author_avatar_url || user.image || "");
      toast.info("Changes reverted");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const { data } = await axios.delete(
        `${API_URI}/users/delete-account`,
        {
          headers: { Authorization: `Bearer ${user?.token}` },
        }
      );

      if (data?.success) {
        toast.success("Account deleted successfully");
        // Clear user data and redirect to login
        localStorage.removeItem("user");
        signOut();
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1500);
      } else {
        toast.error(data?.message || "Failed to delete account");
      }
    } catch (err) {
      console.error("Delete account error:", err);
      toast.error(err?.response?.data?.message || "Failed to delete account");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  return (
    <div className='w-full max-w-2xl mx-auto'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className={clsx(
          'text-3xl font-bold mb-2',
          theme ? 'text-white' : 'text-slate-900'
        )}>
          Profile Settings
        </h1>
        <p className={clsx(
          'text-sm font-medium',
          theme ? 'text-slate-400' : 'text-slate-600'
        )}>
          Customize your author identity and profile information
        </p>
      </div>

      {/* Current Profile Overview */}
      <Paper className={clsx(
        'p-6 rounded-lg mb-8 border',
        theme
          ? 'bg-slate-800 border-slate-700'
          : 'bg-slate-50 border-slate-200'
      )}>
        <h2 className={clsx(
          'text-lg font-semibold mb-4',
          theme ? 'text-white' : 'text-slate-900'
        )}>
          Current Profile
        </h2>
        <div className='flex items-center gap-4'>
          <Avatar
            src={previewUrl}
            size={100}
            radius='md'
            name={displayName}
          />
          <div>
            <p className={clsx(
              'font-semibold mb-1',
              theme ? 'text-white' : 'text-slate-900'
            )}>
              {displayName}
            </p>
            <p className={clsx(
              'text-xs mb-2',
              theme ? 'text-slate-400' : 'text-slate-600'
            )}>
              Google Account: {user?.name}
            </p>
            <p className={clsx(
              'text-sm',
              theme ? 'text-slate-400' : 'text-slate-600'
            )}>
              {user?.email}
            </p>
            <p className={clsx(
              'text-xs mt-2',
              theme ? 'text-slate-500' : 'text-slate-500'
            )}>
              Account Type: {user?.accountType}
            </p>
          </div>
        </div>
      </Paper>

      <Divider my='lg' />

      {/* Profile Customization Form */}
      <div className={clsx(
        'p-6 rounded-lg border',
        theme
          ? 'bg-slate-800 border-slate-700'
          : 'bg-white border-slate-200'
      )}>
        <h2 className={clsx(
          'text-lg font-semibold mb-6',
          theme ? 'text-white' : 'text-slate-900'
        )}>
          Customize Your Author Identity
        </h2>

        <Stack gap='xl'>
          {/* Author Name Input */}
          <div>
            <label className={clsx(
              'block text-sm font-semibold mb-2',
              theme ? 'text-slate-100' : 'text-slate-900'
            )}>
              Author Display Name *
            </label>
            <TextInput
              placeholder='Your preferred author name'
              value={formData.author_name}
              onChange={(e) => handleInputChange("author_name", e.target.value)}
              styles={{
                input: {
                  borderRadius: '0.5rem',
                  height: '2.75rem',
                  fontSize: '0.95rem',
                  backgroundColor: theme ? '#1e293b' : '#f8fafc',
                  borderColor: theme ? '#475569' : '#e2e8f0',
                  color: theme ? '#f1f5f9' : '#1e293b',
                  paddingLeft: '1rem',
                  paddingRight: '1rem',
                },
              }}
              description={formData.author_name
                ? `This name will appear as the author on your published articles`
                : 'Leave empty to use your Google account name'
              }
            />
          </div>

          {/* Avatar Upload */}
          <div>
            <label className={clsx(
              'block text-sm font-semibold mb-3',
              theme ? 'text-slate-100' : 'text-slate-900'
            )}>
              Author Profile Picture
            </label>

            {/* Preview */}
            <div className='mb-4 flex justify-center'>
              <Avatar
                src={previewUrl}
                size={100}
                radius='md'
                name={displayName}
              />
            </div>

            {/* Upload Input */}
            <div className={clsx(
              'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
              theme
                ? 'border-slate-600 hover:border-blue-500 bg-slate-700/30'
                : 'border-slate-300 hover:border-blue-500 bg-slate-50'
            )}>
              <input
                type='file'
                id='avatar-upload'
                onChange={handleImageUpload}
                accept='image/jpeg,image/png,image/webp'
                className='hidden'
              />
              <label
                htmlFor='avatar-upload'
                className={clsx(
                  'cursor-pointer font-medium transition-colors',
                  theme
                    ? 'text-slate-200 hover:text-blue-400'
                    : 'text-slate-700 hover:text-blue-600'
                )}
              >
                Click to upload or drag and drop
              </label>
              <p className={clsx(
                'text-xs mt-2',
                theme ? 'text-slate-400' : 'text-slate-600'
              )}>
                JPG, PNG or WebP • Max 5MB
              </p>
            </div>

            {/* Image Actions */}
            {formData.author_avatar_url && (
              <div className='mt-4'>
                <Button
                  variant='subtle'
                  size='sm'
                  onClick={handleRemoveImage}
                  className={clsx(
                    theme
                      ? 'text-red-400 hover:bg-red-900/20'
                      : 'text-red-600 hover:bg-red-50'
                  )}
                >
                  Remove Custom Image
                </Button>
              </div>
            )}

            <p className={clsx(
              'text-xs mt-2',
              theme ? 'text-slate-400' : 'text-slate-600'
            )}>
              {formData.author_avatar_url
                ? 'Custom avatar is set. Clear to use your Google profile picture.'
                : 'Using your Google profile picture.'}
            </p>
          </div>

          {/* Info Box */}
          <Paper className={clsx(
            'p-4 rounded-lg',
            theme
              ? 'bg-blue-900/20 border border-blue-700/30'
              : 'bg-blue-50 border border-blue-200'
          )}>
            <Text size='sm' className={theme ? 'text-blue-100' : 'text-blue-900'}>
              <strong>ℹ️ How this works:</strong>
              <ul className='mt-2 ml-4 space-y-1 list-disc'>
                <li>Your author name appears on all your published articles</li>
                <li>Your profile picture is shown on author cards and your profile page</li>
                <li>Leave empty to use your Google account information</li>
              </ul>
            </Text>
          </Paper>

          {/* Action Buttons */}
          <Group justify='flex-end' gap='sm'>
            <Button
              variant='default'
              onClick={handleRevert}
              disabled={isSaving}
            >
              Revert Changes
            </Button>
            <Button
              onClick={handleSave}
              loading={isSaving}
              className='bg-blue-600 hover:bg-blue-700'
            >
              Save Profile
            </Button>
          </Group>
        </Stack>
      </div>

      <Divider my='lg' />

      {/* Delete Account Section */}
      <div className={clsx(
        'p-6 rounded-lg border',
        theme
          ? 'bg-red-900/10 border-red-700/30'
          : 'bg-red-50 border-red-200'
      )}>
        <h2 className={clsx(
          'text-lg font-semibold mb-2',
          theme ? 'text-red-100' : 'text-red-900'
        )}>
          Danger Zone
        </h2>
        <p className={clsx(
          'text-sm mb-4',
          theme ? 'text-red-100/70' : 'text-red-700/70'
        )}>
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button
          color='red'
          variant='filled'
          onClick={() => setDeleteModalOpen(true)}
          disabled={isDeleting}
        >
          Delete Account Permanently
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title='Delete Account Permanently?'
        centered
        classNames={{
          header: clsx(theme ? 'bg-slate-800' : 'bg-white'),
          content: clsx(theme ? 'bg-slate-800' : 'bg-white'),
        }}
      >
        <Stack gap='md'>
          <Text className={theme ? 'text-slate-200' : 'text-slate-800'}>
            This action cannot be undone. Your account and all associated data will be permanently deleted, including:
          </Text>
          <ul className={clsx(
            'ml-4 space-y-1 list-disc',
            theme ? 'text-slate-300' : 'text-slate-700'
          )}>
            <li>Your profile and account information</li>
            <li>All your published articles and posts</li>
            <li>Your followers and following list</li>
            <li>All view analytics</li>
          </ul>
          <Group justify='flex-end' gap='sm'>
            <Button
              variant='default'
              onClick={() => setDeleteModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              color='red'
              loading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Yes, Delete My Account
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Toaster richColors />
    </div>
  );
};

export default Profile;
