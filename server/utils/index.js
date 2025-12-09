import bcrypt from "bcryptjs";
import { signToken, verifyToken } from "./jwt.js"; // <- fixed path

export const hashString = async (userValue) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(userValue, salt);
  return hashedPassword;
};

export const compareString = async (userPassword, password) => {
  try {
    const isMatch = await bcrypt.compare(userPassword, password);
    return isMatch;
  } catch (error) {
    throw new Error(error);
  }
};

// Use signToken helper instead of undefined `JWT`
export function createJWT(id) {
  return signToken({ userId: id }, { expiresIn: "1d" });
}

export function generateOTP() {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Slug issues resolution
const generateSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove non-word characters
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
};

/**
 * Generates a unique slug for a Mongoose Model.
 * @param {String} title - The title to slugify.
 * @param {Model} Model - The Mongoose Model (e.g., Posts, Category).
 * @param {String} [oldSlug] - (Optional) The existing slug if updating a document.
 */
export const createUniqueSlug = async (title, Model, oldSlug = null) => {
  let slug = generateSlug(title);

  // If we are updating (oldSlug exists) and the title hasn't changed enough to alter the slug, keep it.
  if (oldSlug && slug === oldSlug) {
    return oldSlug;
  }

  // Check database for duplicates
  let uniqueSlug = slug;
  let counter = 1;

  // Loop until we find a slug that doesn't exist
  while (await Model.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};