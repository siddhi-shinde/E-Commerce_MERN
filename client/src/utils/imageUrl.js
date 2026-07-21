const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

// Simple inline SVG placeholder so the UI never shows a broken image icon
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#eef2ff"/><text x="50%" y="50%" font-family="sans-serif" font-size="18" fill="#64748b" text-anchor="middle" dy=".3em">No Image</text></svg>`;
export const PLACEHOLDER_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

// Backend returns paths like "/uploads/products/xyz.jpg" - prefix with the
// server origin (not /api) so <img> tags can load them directly.
export const getImageUrl = (path) => {
  if (!path) return PLACEHOLDER_IMAGE;
  if (path.startsWith('http')) return path;
  return `${SERVER_URL}${path}`;
};
