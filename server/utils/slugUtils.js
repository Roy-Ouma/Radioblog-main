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

export const createUniqueSlug = async (title, Model, oldSlug = null) => {
  let slug = generateSlug(title);

  // If updating and title hasn't changed enough to alter slug, keep old one
  if (oldSlug && slug === oldSlug) {
    return oldSlug;
  }

  let uniqueSlug = slug;
  let counter = 1;

  // Check database for duplicates
  while (await Model.findOne({ slug: uniqueSlug })) {
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};