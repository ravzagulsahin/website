"use client";
import Link from 'next/link';

interface MagazineCardProps {
  magazine: {
    id: string;
    title: string;
    issue_number?: string;
    cover_image?: string | null;
    created_at?: string;
  };
}

function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function MagazineCard({ magazine }: MagazineCardProps) {
  return (
    <Link href={`/magazines/${magazine.id}`} className="group block no-underline text-inherit">
      {/* A4 Aspect Ratio (1:1.414) */}
      <div className="relative aspect-[1/1.414] overflow-hidden bg-zinc-100 rounded-sm shadow-lg transition-all duration-700 group-hover:shadow-xl">
        {magazine.cover_image ? (
          <img
            src={magazine.cover_image} 
            alt={magazine.title}
            className="object-cover w-full h-full grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 text-xs uppercase tracking-widest">
            Kapak Yakında
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-lg font-serif italic leading-tight">{magazine.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          {magazine.issue_number && (
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              {magazine.issue_number}
            </span>
          )}
          {magazine.created_at && (
            <>
              {magazine.issue_number && <span className="text-zinc-300">•</span>}
              <time className="text-[10px] text-zinc-400">
                {formatDate(magazine.created_at)}
              </time>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
