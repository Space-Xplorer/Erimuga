// Self-contained (no network request, can't 404) placeholder for products with no photos.
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' fill='%239ca3af'%3ENo image%3C/text%3E%3C/svg%3E";

// Products can have a flat `image` array (virtual) or, defensively, a single string.
export const getProductThumbnail = (product) => {
  const images = Array.isArray(product?.image) ? product.image : (product?.image ? [product.image] : []);
  return images[0] || PLACEHOLDER_IMAGE;
};
