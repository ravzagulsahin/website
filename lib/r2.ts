const BLOG = process.env.NEXT_PUBLIC_R2_BLOG_BASE_URL || "";
const PHOTOS = process.env.NEXT_PUBLIC_R2_PHOTOS_BASE_URL || "";

const clean = (p: string | null | undefined) => {
  if (!p) return "";
  return String(p).replace(/^\/+/, "");
};

export const r2 = {
  blog: (path?: string | null) => {
    if (!BLOG || !path) return "";
    return `${BLOG}/${clean(path)}`;
  },
  photos: (path?: string | null) => {
    if (!PHOTOS || !path) return "";
    return `${PHOTOS}/${clean(path)}`;
  },
};
