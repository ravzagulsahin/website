'use client';

export default function MagazinePlaceholder({ title }: { title: string }) {
  // Başlığın ilk harfine göre farklı gradyanlar seçerek görsel çeşitlilik sağlar
  const gradients = [
    'from-indigo-500 to-purple-600',
    'from-blue-600 to-cyan-500',
    'from-emerald-500 to-teal-600',
    'from-slate-700 to-slate-900'
  ];
  const selectedGradient = gradients[title.length % gradients.length];

  return (
    <div className={`relative w-full h-full bg-gradient-to-br ${selectedGradient} flex flex-col items-center justify-center p-6 overflow-hidden`}>
      {/* Arka plan süslemesi - Soyut halkalar */}
      <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-white/10 rounded-full blur-2xl" />
      <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-black/10 rounded-full blur-xl" />
      
      {/* Kitap/Dergi İkonu */}
      <div className="relative z-10 mb-4 bg-white/20 p-4 rounded-2xl backdrop-blur-md border border-white/30">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      </div>

      {/* Kısa Başlık Önizlemesi */}
      <span className="relative z-10 text-white/90 font-serif italic text-center text-sm px-2">
        {title.split(' ').slice(0, 3).join(' ')}...
      </span>
    </div>
  );
}