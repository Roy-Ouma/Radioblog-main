import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function DirectUpload({ onComplete }) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const filename = `uploads/${Date.now()}-${file.name}`;

      // Upload file as the authenticated user. Ensure the user is signed in and
      // the bucket policy allows authenticated uploads.
      const { error } = await supabase.storage
        .from('uploads')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) throw error;

      // If the bucket is public, getPublicUrl will return an accessible URL.
      const { data } = supabase.storage.from('uploads').getPublicUrl(filename);
      const publicUrl = data?.publicUrl;

      // If your bucket is private, you'll need the server to create a signed URL.
      onComplete && onComplete(publicUrl);
    } catch (err) {
      console.error('Upload error', err.message || err);
      alert('Upload failed: ' + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFile} disabled={loading} />
      {loading && <div>Uploading…</div>}
    </div>
  );
}
