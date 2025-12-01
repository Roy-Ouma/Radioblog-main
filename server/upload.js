import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import admin from "firebase-admin";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

dotenv.config();

// Initialize Supabase client (if configured)
let supabaseClient = null;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "uploads";
const SUPABASE_PUBLIC = (process.env.SUPABASE_PUBLIC || "true") === "true";

if (SUPABASE_URL && SUPABASE_KEY) {
  supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
  console.log("Supabase Storage client initialized");
}

// Try to initialize firebase-admin using a service account JSON in
// `FIREBASE_SERVICE_ACCOUNT` (JSON string) or `FIREBASE_SERVICE_ACCOUNT_FILE` (path).
let firebaseInitialized = false;
function initFirebase() {
  if (firebaseInitialized) return;

  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccountFile = process.env.FIREBASE_SERVICE_ACCOUNT_FILE;

    if (serviceAccountJson) {
      const parsed = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(parsed),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      firebaseInitialized = true;
      return;
    }

    if (serviceAccountFile && fs.existsSync(serviceAccountFile)) {
      const parsed = JSON.parse(fs.readFileSync(serviceAccountFile, "utf8"));
      admin.initializeApp({
        credential: admin.credential.cert(parsed),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
      firebaseInitialized = true;
      return;
    }

    // Last resort: try ADC (Application Default Credentials)
    admin.initializeApp({
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    firebaseInitialized = true;
  } catch (err) {
    // don't throw — we'll fallback to local storage
    console.warn("Firebase admin init failed, falling back to local storage:", err.message || err);
  }
}

const router = express.Router();
const upload = multer();

// Ensure uploads directory exists
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
try {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
} catch (err) {
  // ignore if already exists or other non-fatal error
}

// UPLOAD FILE - prefer Supabase Storage if configured, otherwise Firebase, then local storage
router.post("/upload", upload.single("file"), async (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ error: "No file provided" });

  const filename = `${Date.now()}-${file.originalname}`;

  // Try Supabase Storage first
  if (supabaseClient) {
    try {
      const destPath = `uploads/${filename}`;
      console.log("Attempting Supabase upload:", destPath);

      const { data, error } = await supabaseClient.storage
        .from(SUPABASE_BUCKET)
        .upload(destPath, file.buffer, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.mimetype,
        });

      if (error) throw error;

      // Generate public or signed URL
      let publicUrl;
      if (SUPABASE_PUBLIC) {
        publicUrl = `${SUPABASE_URL.replace(/\/+$/, "")}/storage/v1/object/public/${SUPABASE_BUCKET}/${encodeURIComponent(destPath)}`;
      } else {
        const { data: signed, error: signErr } = await supabaseClient.storage
          .from(SUPABASE_BUCKET)
          .createSignedUrl(destPath, 60 * 60 * 24 * 7); // 7 days
        if (signErr) throw signErr;
        publicUrl = signed.signedUrl;
      }

      console.log("Supabase upload successful:", publicUrl);
      return res.json({ url: publicUrl });
    } catch (err) {
      console.warn("Supabase upload failed, trying Firebase:", err.message || err);
      // Fall through to Firebase/local fallback
    }
  }

  // Initialize Firebase admin (if possible)
  console.log("initFirebase(): FIREBASE_STORAGE_BUCKET=", process.env.FIREBASE_STORAGE_BUCKET, "FIREBASE_SERVICE_ACCOUNT_FILE=", process.env.FIREBASE_SERVICE_ACCOUNT_FILE ? '[provided]' : '[none]');
  initFirebase();
  console.log("initFirebase complete: firebaseInitialized=", firebaseInitialized, "admin.apps.length=", admin.apps ? admin.apps.length : 0);

  if (firebaseInitialized && admin.storage) {
    try {
      const bucketName = process.env.FIREBASE_STORAGE_BUCKET || getClientBucketFallback();
      console.log("Attempting firebase upload; resolved bucketName=", bucketName);
      // Try the resolved bucket. If it doesn't exist, and the name looks like
      // the web SDK format (e.g. `project.firebasestorage.app`), try the
      // corresponding `project.appspot.com` bucket as a fallback.
      let attemptedBuckets = [];
      let uploadSucceeded = false;
      let lastErr;

      const tryBucketUpload = async (bName) => {
        attemptedBuckets.push(bName);
        const b = admin.storage().bucket(bName);
        const f = b.file(filename);
        await f.save(file.buffer, {
          metadata: { contentType: file.mimetype },
          resumable: false,
        });
        return { bucket: b, file: f };
      };

      try {
        const result = await tryBucketUpload(bucketName);
        // success
        const remoteFile = result.file;
        const bucket = result.bucket;
        uploadSucceeded = true;

        try {
          await remoteFile.makePublic();
          const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
            remoteFile.name
          )}?alt=media`;
          return res.json({ url: publicUrl });
        } catch (err) {
          const [signedUrl] = await remoteFile.getSignedUrl({ action: "read", expires: "03-09-2491" });
          return res.json({ url: signedUrl });
        }
      } catch (err) {
        lastErr = err;
        // If the error indicates bucket not found and bucketName ends with the
        // web SDK domain, attempt the appspot.com variant.
        const altBucket = bucketName && bucketName.endsWith(".firebasestorage.app")
          ? bucketName.replace(/\.firebasestorage\.app$/, ".appspot.com")
          : null;

        if (altBucket && !attemptedBuckets.includes(altBucket)) {
          try {
            const result2 = await tryBucketUpload(altBucket);
            uploadSucceeded = true;
            const remoteFile = result2.file;
            const bucket = result2.bucket;
            try {
              await remoteFile.makePublic();
              const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
                remoteFile.name
              )}?alt=media`;
              return res.json({ url: publicUrl });
            } catch (err2) {
              const [signedUrl] = await remoteFile.getSignedUrl({ action: "read", expires: "03-09-2491" });
              return res.json({ url: signedUrl });
            }
          } catch (err2) {
            lastErr = err2;
          }
        }
      }

      if (!uploadSucceeded) {
        console.warn("Firebase upload failed for buckets:", attemptedBuckets, "error:", lastErr && lastErr.message);
        throw lastErr;
      }

      // Try to make the file public so it can be accessed via a stable public URL.
      // If makePublic fails (permissions), fall back to a signed URL.
      try {
        await remoteFile.makePublic();
        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(
          remoteFile.name
        )}?alt=media`;
        return res.json({ url: publicUrl });
      } catch (err) {
        // fallback to signed URL
        const [signedUrl] = await remoteFile.getSignedUrl({
          action: "read",
          expires: "03-09-2491",
        });
        return res.json({ url: signedUrl });
      }
    } catch (err) {
      console.warn("Firebase upload failed, falling back to local storage:", err.message || err);
      // fall through to local storage
    }
  }

  // Local fallback
  const filepath = path.join(UPLOAD_DIR, filename);

  try {
    await fs.promises.writeFile(filepath, file.buffer);
  } catch (err) {
    return res.status(500).json({ error: "Failed to save file" });
  }

  const publicUrl = `${req.protocol}://${req.get("host")}/uploads/${encodeURIComponent(filename)}`;

  return res.json({ url: publicUrl });
});

// Try to read client firebase config as a fallback for bucket name
function getClientBucketFallback() {
  try {
    const clientConfigPath = path.join(process.cwd(), "client", "src", "utils", "firebase.js");
    if (!fs.existsSync(clientConfigPath)) return undefined;
    const content = fs.readFileSync(clientConfigPath, "utf8");
    const m = content.match(/storageBucket:\s*["']([^"']+)["']/);
    return m ? m[1] : undefined;
  } catch (err) {
    return undefined;
  }
}

export default router;
