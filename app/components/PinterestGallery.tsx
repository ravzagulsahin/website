import { getHomeSlides } from "@/lib/data/homeGallery";

export default async function PinterestGallery() {
  const slides = await getHomeSlides();

  if (slides.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        Henüz galeri görseli eklenmemiş.
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
      {slides.map((slide, index) => {
        const imageUrl = slide.image_url || slide.image_path;
        
        if (!imageUrl) return null;

        return (
          <div
            key={slide.id}
            className="break-inside-avoid group relative overflow-hidden rounded-lg bg-zinc-100"
          >
            {/* 16:9 Aspect Ratio Container */}
            <div className="aspect-[16/9] overflow-hidden">
              <img
                src={imageUrl}
                alt={slide.title || `Galeri ${index + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
            </div>
            
            {/* Caption Overlay */}
            {slide.title && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-8">
                <p className="text-white text-sm font-medium">
                  {slide.title}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
