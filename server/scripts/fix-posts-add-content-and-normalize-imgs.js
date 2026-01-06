import dotenv from "dotenv";
import dbConnection from "../dbConfig.js";
import mongoose from "mongoose";
import Posts from "../models/Posts.js";

dotenv.config();

async function run() {
  await dbConnection();

  const dryRun = !process.argv.includes("--apply");
  console.log(dryRun ? "Running dry-run (no changes). Use --apply to persist." : "Applying changes to MongoDB");

  // Find posts missing `content` or with empty content
  const posts = await Posts.find({ $or: [ { content: { $exists: false } }, { content: null }, { content: "" } ] }).lean();
  console.log(`Found ${posts.length} posts missing content`);

  const uploadsBase = process.env.UPLOADS_BASE_URL || process.env.SERVER_URL || "";

  const changes = [];
  for (const p of posts) {
    const update = {};
    // copy desc into content when content is missing
    update.content = p.desc || "";

    // Normalize img: if it's a relative path and we have a base URL, prefix it
    if (p.img && uploadsBase && !/^https?:\/\//i.test(p.img)) {
      const prefix = uploadsBase.replace(/\/$/, "");
      const imgPath = p.img.replace(/^\//, "");
      update.img = `${prefix}/${imgPath}`;
    }

    changes.push({ _id: p._id, update });
  }

  if (changes.length === 0) {
    console.log("No updates required.");
    await mongoose.disconnect();
    return;
  }

  console.log("Planned updates:");
  for (const c of changes) console.log(c);

  if (!dryRun) {
    for (const c of changes) {
      const set = {};
      if (typeof c.update.content !== 'undefined') set.content = c.update.content;
      if (typeof c.update.img !== 'undefined') set.img = c.update.img;
      await Posts.updateOne({ _id: c._id }, { $set: set });
    }
    console.log(`Applied ${changes.length} updates.`);
  } else {
    console.log("Dry-run complete. No changes applied.");
  }

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
