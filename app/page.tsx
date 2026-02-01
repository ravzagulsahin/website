import ImageSlider from './components/ImageSlider';
import { getMagazines } from '@/lib/data/magazines';
import { getHomeSlides } from '@/lib/data/homeGallery';
import LatestBlogPosts from '@/app/components/LatestBlogPosts';
import MagazineCard from './components/MagazineCard';
import PinterestGallery from './components/PinterestGallery';

export default async function Home() {
  const allMagazines = await getMagazines();
  const slides = await getHomeSlides();
  const featuredMagazines = allMagazines.slice(0, 4);

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
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

      {/* Öne Çıkan Dergiler - 4 adet */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-serif italic">Öne Çıkan Sayılar</h2>
          <a href="/magazines" className="text-xs uppercase tracking-widest hover:opacity-50 transition-opacity">Tümünü Gör →</a>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredMagazines.map((magazine) => (
            <MagazineCard key={magazine.id} magazine={magazine} />
          ))}
        </div>
      </section>

      {/* Son Blog Yazıları - 2 adet yan yana */}
      <div className="bg-white border-y border-black/5">
        <div className="max-w-7xl mx-auto px-6">
          <LatestBlogPosts />
        </div>
      </div>

      {/* Pinterest Style Gallery */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex justify-between items-end mb-12">
          <h2 className="text-3xl font-serif italic">Galeri</h2>
        </div>
        <PinterestGallery />
      </section>
    </main>
  );
}
