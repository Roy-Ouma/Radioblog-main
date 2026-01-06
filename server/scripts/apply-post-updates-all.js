import dotenv from "dotenv";
import dbConnection from "../dbConfig.js";
import mongoose from "mongoose";
import Posts from "../models/Posts.js";

dotenv.config();

async function run() {
  await dbConnection();

  console.log("Starting full Posts migration: populate content, normalize img, ensure defaults");

  const uploadsBase = (process.env.UPLOADS_BASE_URL || process.env.SERVER_URL || "").replace(/\/$/, "");

  const posts = await Posts.find({}).lean();
  console.log(`Found ${posts.length} posts`);

  let updatedCount = 0;

  for (const p of posts) {
    const set = {};

    // ensure content exists (prefer existing content, fall back to desc)
    const desiredContent = (p.content ?? p.desc ?? "").toString();
    if ((p.content || "") !== desiredContent) set.content = desiredContent;

    // normalize img to absolute URL if uploadsBase is provided and img is relative
    if (p.img && uploadsBase && !/^https?:\/\//i.test(p.img)) {
      const imgPath = p.img.replace(/^\//, "");
      const normalized = `${uploadsBase}/${imgPath}`;
      if (p.img !== normalized) set.img = normalized;
    }

    // ensure moderation/status default booleans
    if (typeof p.approved === "undefined") set.approved = false;
    if (typeof p.status === "undefined") set.status = false;

    if (Object.keys(set).length > 0) {
      await Posts.updateOne({ _id: p._id }, { $set: set });
      updatedCount += 1;
      console.log(`Updated post ${p._id}:`, set);
    }
  }

  console.log(`Migration complete. Updated ${updatedCount} posts.`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
