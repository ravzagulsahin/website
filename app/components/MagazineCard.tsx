"use client"; // Kritik: İnteraktif efektler için şart!

import Link from 'next/link';

export default function MagazineCard({ magazine }: { magazine: any }) {
  return (
    <Link href={`/magazines/${magazine.id}`} className="group block no-underline text-inherit">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-200 transition-all duration-700">
        {magazine.coverUrl ? (
          <img
            src={magazine.coverUrl}
            alt={magazine.title}
            className="object-cover w-full h-full grayscale-[0.3] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-400 text-xs uppercase tracking-widest">
            Kapak Yakında
          </div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-xl font-serif italic leading-tight">{magazine.title}</h3>
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 mt-1">{magazine.issue}</p>
      </div>
    </Link>
  );
}
