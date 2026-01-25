const BLOG = process.env.NEXT_PUBLIC_R2_BLOG_BASE_URL!;
const PHOTOS = process.env.NEXT_PUBLIC_R2_PHOTOS_BASE_URL!;

const clean = (p: string) => p.replace(/^\/+/, "");

export const r2 = {
  blog: (path: string) => `${BLOG}/${clean(path)}`,
  photos: (path: string) => `${PHOTOS}/${clean(path)}`,
};
