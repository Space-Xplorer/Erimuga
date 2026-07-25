// utils/slugify.js
// Category and subcategory slugs are user-facing URL segments (/collection/sarees),
// so they need to be stable, lowercase and free of anything that needs escaping.
export const slugify = (str = '') =>
  String(str)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // strip accents left behind by NFD
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export default slugify;
