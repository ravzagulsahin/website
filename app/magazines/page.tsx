import { getMagazines } from "@/lib/data/magazines";
import MagazineCard from "@/app/components/MagazineCard";

export default async function MagazinesPage() {
  const magazines = await getMagazines();

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-16">
          <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-4">
            Dergiler
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl">
            Psikoloji dünyasından en güncel içerikler ve araştırmalar.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {magazines.map((magazine) => (
            <MagazineCard key={magazine.id} magazine={magazine} />
          ))}
        </div>

        {magazines.length === 0 && (
          <div className="text-center py-24 text-zinc-500">
            Henüz yayınlanmış dergi bulunmuyor.
          </div>
        )}
      </div>
    </div>
  );
}
