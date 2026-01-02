import Posts from "../models/Posts.js";
import Users from "../models/Users.js";
import Comments from "../models/Comment.js";
import Views from "../models/Views.js";
import mongoose from "mongoose";
import Followers from "../models/Followers.js";
import { createUniqueSlug } from "../utils/slugUtils.js";

const getUserIdFromRequest = (req) =>
  req.user?.userId || req.body?.user?.userId || req.body?.userId;

const ensureUser = (req, res) => {
  const userId = getUserIdFromRequest(req);
  if (!userId) {
    res.status(401).json({ success: false, message: "Authentication required." });
    return null;
  }
  return userId;
};

export const stats = async (req, res, next) => {
  try {
    const { query } = req.query;
    const userId = ensureUser(req, res);
    if (!userId) return;

    const numofDays = Number(query) || 28;

    const currentDate = new Date();
    const startDate = new Date();
    startDate.setDate(currentDate.getDate() - numofDays);

    const totalPost = await Posts.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: currentDate }
    }).countDocuments();

    const totalViews = await Views.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: currentDate }
    }).countDocuments();

    const totalWriters = await Users.find({
      accountType: 'Writer',
    }).countDocuments();

    const totalFollowers = await Users.find({
      followers: userId
    }).countDocuments();

    const viewStats = await Views.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: currentDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          Total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const FollowersStats = await Followers.aggregate([
      {
        $match: {
          writerId: new mongoose.Types.ObjectId(userId),
          createdAt: { $gte: startDate, $lte: currentDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          Total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

      const last5Followers = await Users.findById(userId).populate({
      path: 'followers',
      options: { sort: { _id: -1 }, limit: 5 },
      populate: {
        path: 'followerId',
        // Avoid mixing inclusion and exclusion in projection; include only the fields we need
        select: 'name email image accountType followers'
      }
    });

    const Last5Posts = await Posts.find({ user: userId })
      .sort({ _id: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      message: 'Stats fetched successfully',
      data: {
        followers: totalFollowers,
        totalPost,
        totalViews,
        totalWriters,
        viewStats,
        FollowersStats,
        last5Followers: last5Followers?.followers,
        Last5Posts
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const userId = ensureUser(req, res);
    if (!userId) return;

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    const result = await Users.findById(userId).populate({
      path: 'followers',
      options: { sort: { _id: -1 }, limit: limit, skip: skip },
      populate: {
        path: "followerId",
        // include only safe fields; avoid mixing inclusion and exclusion in projection
        select: "name email image accountType followers"
      }
    });

    const totalFollowers = await Users.findById(userId);

    const numOfPages = Math.ceil((totalFollowers?.followers?.length || 0) / limit);

    res.status(200).json({
      data: result?.followers,
      total: totalFollowers?.followers?.length || 0,
      numOfPages,
      page,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getPostContent = async (req, res, next) => {
  try {
    // If this request was authenticated via `adminAuth`, `req.currentUser` will be set
    // and we should return all posts (approved and unapproved). Otherwise return
    // only the posts belonging to the requesting user.
    const isAdminRequest = Boolean(req.currentUser);

    let filter = {};
    if (!isAdminRequest) {
      const userId = ensureUser(req, res);
      if (!userId) return;
      filter.user = userId;
    }

    let queryResult = Posts.find(filter).sort({ _id: -1 });

    // Include author and who approved the post (if any)
    queryResult = queryResult.populate({ path: 'user', select: 'name email image' });
    queryResult = queryResult.populate({ path: 'approvedBy', select: 'name email' });

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // records count
    const totalPost = await Posts.countDocuments(filter);

    const numOfPage = Math.ceil(totalPost / limit);

    queryResult = queryResult.skip(skip).limit(limit);

    const posts = await queryResult;

    res.status(200).json({
      success: true,
      message: 'Posts fetched successfully',
      totalPost,
      numOfPage,
      page,
      data: posts
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const createPost = async (req, res, next) => {
  try {
    const { title, description, cat, status } = req.body;

    if (!title) {
      return next("Title is required!");
    }

    // --- MAGIC HAPPENS HERE ---
    // Pass the 'Posts' model so it checks the posts table
    const slug = await createUniqueSlug(title, Posts);
    // --------------------------

    const newPost = await Posts.create({
      title,
      slug, // Save the unique slug
      description,
      cat,
      user: req.user.userId,
      status: status ?? false, // Default to draft if not provided
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: newPost,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const commentPost = async (req, res, next) => {
  try {
    const { desc } = req.body;
    const { id: postId } = req.params;
    const userId = ensureUser(req, res);
    if (!userId) return;

    if (!postId) {
      return res.status(400).json({ success: false, message: "Post id is required." });
    }

    if (!desc || !desc.trim()) {
      return res.status(400).json({ success: false, message: "Comment is required." });
    }

    const post = await Posts.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const newComment = await Comments.create({
      user: userId,
      desc: desc.trim(),
      post: postId,
    });

    post.comments.push(newComment._id);
    await post.save({ validateBeforeSave: false });

    const hydratedComment = await newComment.populate({
      path: "user",
      select: "name image",
    });

    res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: hydratedComment,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res, next) => {
  try {
    const userId = ensureUser(req, res);
    if (!userId) return;

    const { id: postId } = req.params;
    if (!postId) return res.status(400).json({ success: false, message: 'Post id is required' });

    const updated = await Posts.findByIdAndUpdate(
      postId,
      { $addToSet: { likes: userId } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Post not found' });

    const liked = (updated.likes || []).some((l) => String(l) === String(userId));

    res.status(200).json({
      success: true,
      message: liked ? 'Post liked' : 'Like recorded',
      data: { likesCount: updated.likes?.length || 0, liked }
    });
  } catch (error) {
    console.error('likePost error', error);
    res.status(500).json({ message: error.message });
  }
};

export const unlikePost = async (req, res, next) => {
  try {
    const userId = ensureUser(req, res);
    if (!userId) return;

    const { id: postId } = req.params;
    if (!postId) return res.status(400).json({ success: false, message: 'Post id is required' });

    const updated = await Posts.findByIdAndUpdate(
      postId,
      { $pull: { likes: userId } },
      { new: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Post not found' });

    const liked = (updated.likes || []).some((l) => String(l) === String(userId));

    res.status(200).json({
      success: true,
      message: !liked ? 'Post unliked' : 'Unlike recorded',
      data: { likesCount: updated.likes?.length || 0, liked }
    });
  } catch (error) {
    console.error('unlikePost error', error);
    res.status(500).json({ message: error.message });
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    
    const post = await Posts.findById(id);
    if (!post) return next("Post not found");

    // Only regenerate slug if title changed
    if (title && title !== post.title) {
       req.body.slug = await createUniqueSlug(title, Posts, post.slug);
    }

    const updatedPost = await Posts.findByIdAndUpdate(id, req.body, { new: true });
    
    res.status(200).json({ success: true, data: updatedPost });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const { cat, writerId, search } = req.query;

    const filter = { status: true, approved: true };

    if (cat) {
      const categories = Array.isArray(cat)
        ? cat
        : String(cat)
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

      if (categories.length) {
        filter.cat = {
          $in: categories.map((label) => new RegExp(`^${label}$`, "i")),
        };
      }
    }

    if (writerId) {
      filter.user = writerId;
    }

    if (search) {
      const term = String(search).trim();
      if (term) {
        filter.$or = [
          { title: { $regex: term, $options: "i" } },
          { desc: { $regex: term, $options: "i" } },
        ];
      }
    }

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 50);
    const skip = (page - 1) * limit;

    const totalPost = await Posts.countDocuments(filter);
    const numOfPage = Math.max(Math.ceil(totalPost / limit), 1);

    let posts = await Posts.find(filter)
      .populate({
        path: "user",
        select: "name image",
      })
      .skip(skip)
      .limit(limit);

    // Shuffle the returned page of posts so the order is randomized for the client
    // We intentionally do this after applying pagination so we don't fetch the entire
    // collection into memory. This shuffles only the current page.
    posts = posts.sort(() => Math.random() - 0.5);

    res.status(200).json({
      success: true,
      totalPost,
      numOfPage,
      page,
      limit,
      data: posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getPopularContents = async (req, res, next) => {
  try {
    const posts = await Posts.aggregate([
      { $match: { status: true, approved: true } },
      {
        $addFields: {
          viewsCount: { $size: { $ifNull: ["$views", []] } }
        }
      },
      { $sort: { viewsCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          title: 1,
          slug: 1,
          img: 1,
          cat: 1,
          views: '$viewsCount',
          createdAt: 1,
          user: { _id: '$user._id', name: '$user.name', image: '$user.image' }
        }
      }
    ]);

    const writers = await Users.aggregate([
      {
        $match: {
          accountType: { $ne: "User" }
        }
      },
      {
        $project: {
          name: 1,
          image: 1,
          followers: { $size: { $ifNull: ["$followers", []] } },
        }
      },
      {
        $sort: { followers: -1 },
      },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Successful',
      data: {
        posts,
        writers
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getPost = async (req, res, next) => {
  try {
    const { id: postId } = req.params;

    const post = await Posts.findById(postId)
      .populate({
        path: 'user',
        // Include only the public user fields we need (do not mix inclusion and exclusion)
        select: 'name image'
      });

    const newView = await Views.create({
      user: post?.user,
      post: postId,
    });

    post.views.push(newView?._id);

    await Posts.findByIdAndUpdate(postId, post);

    res.status(200).json({
      success: true,
      message: 'Post fetched successfully',
      data: post
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const postComments = await Comments.find({ post: postId })
      .populate({
        path: 'user',
        select: 'name image'
      })
      .sort({ _id: -1 });

    res.status(200).json({
      success: true,
      message: 'Comments fetched successfully',
      data: postComments
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Posts.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id, postId } = req.params;

    await Comments.findByIdAndDelete(id);

    // updating the post by removing the comment id
    const result = await Posts.updateOne(
      { _id: postId },
      { $pull: { comments: id } }
    );

    if (result.modifiedCount > 0) {
      res
        .status(200)
        .json({ success: true, message: "Comment deleted successfully" });
    } else {
      res.status(404).json({ message: "Comment not found in the post" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Return shareable public links for a post (frontend URL + image URL)
export const getShareLink = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    if (!postId) return res.status(400).json({ success: false, message: 'Post id is required' });

    const post = await Posts.findById(postId).select('title slug img desc');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    // Determine frontend/public base URL
    const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.CORS_ALLOWED_ORIGINS || '').split(',')[0] || 'http://localhost:3000';

    const base = String(FRONTEND_URL).replace(/\/$/, '');
    // Build path: client expects route "/:slug/:id?" so include slug then id
    const slugPart = post.slug ? encodeURIComponent(String(post.slug).replace(/\s+/g, '-')) : 'post';
    const webUrl = `${base}/${slugPart}/${post._id}`;

    // Resolve image URL: if already absolute, use it; otherwise try to construct Supabase public URL
    let imageUrl = post.img || null;
    if (imageUrl && !/^https?:\/\//i.test(imageUrl)) {
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'uploads';
      if (SUPABASE_URL) {
        // If stored as "uploads/filename" or similar, build public object URL
        const cleanPath = encodeURIComponent(String(imageUrl).replace(/^\/+/, ''));
        imageUrl = `${SUPABASE_URL.replace(/\/$/, '')}/storage/v1/object/public/${SUPABASE_BUCKET}/${cleanPath}`;
      }
    }

    return res.json({ success: true, data: { url: webUrl, image: imageUrl, title: post.title, desc: post.desc } });
  } catch (err) {
    console.error('getShareLink error', err);
    return res.status(500).json({ success: false, message: 'Unable to construct share link' });
  }

};