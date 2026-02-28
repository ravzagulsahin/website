 "use client";
import { useQuery } from "@tanstack/react-query";
import { fetchWithRetry } from "@/lib/api/fetchWithRetry";

async function getLatest() {
  const res = await fetchWithRetry("/api/public/blogs");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

export function useLatestPosts() {
  return useQuery({
    queryKey: ["latestPosts"],
    queryFn: getLatest,
    staleTime: 1000 * 60, // 1 minute
    retry: 2,
  });
}

