import ImageSlider from './components/ImageSlider';
import { getMagazines } from '@/lib/data/magazines';
import { getHomeSlides } from '@/lib/data/homeGallery';
import LatestBlogPost from '@/app/components/LatestBlogPost';
import MagazineCard from './components/MagazineCard';

export default async function Home() {
  const allMagazines = await getMagazines();
  const slides = await getHomeSlides();
  const featuredMagazines = allMagazines.slice(0, 3);

  return (
    <main className="min-h-screen">
      <section className="px-6 pt-24 pb-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-end">
          <div className="md:col-span-4 pb-8">
            <h1 className="text-7xl md:text-9xl font-serif leading-[0.8] mb-8">The <br /> Journal</h1>
          </div>
          <div className="md:col-span-8 w-full">
            <ImageSlider slides={slides} />
          </div>
        </div>
      </section>
            <p className="text-xs uppercase tracking-[0.3em] opacity-50 max-w-[200px] leading-relaxed">
              Akdeniz Üniversitesi Psikoloji Topluluğu Dijital Yayını.
            </p>
          </div>
          <div className="md:col-span-8 w-full aspect-video md:aspect-[16/7] overflow-hidden">
            <ImageSlider slides={slides} />
          </div>
        </div>
      </section>

      {/* Öne Çıkan Dergiler */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-serif italic">Featured Issues</h2>
          <a href="/magazines" className="text-xs uppercase tracking-widest hover:opacity-50 transition-opacity">Tümünü Gör →</a>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
          {featuredMagazines.map((magazine) => (
            <MagazineCard key={magazine.id} magazine={magazine} />
          ))}
        </div>
      </section>

      {/* Blog ve Diğer İçerikler */}
      <div className="bg-white border-y border-black/5 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <LatestBlogPost />
        </div>
      </div>
    </main>
  );
}
