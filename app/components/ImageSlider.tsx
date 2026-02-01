'use client';
import { useState, useEffect, useCallback } from 'react';

interface Slide {
  id: string | number;
  title: string | null;
  subtitle?: string | null;
  image_url: string | null;
}

export default function ImageSlider({ slides }: { slides?: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = useCallback(() => {
    if (!slides || slides.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides]);

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [handleNext, slides]);

  if (!slides || slides.length === 0) {
    return (
      <div className="w-full h-[450px] bg-zinc-200 rounded-[1.5rem] flex items-center justify-center italic text-zinc-400">
        Görsel bulunamadı...
      </div>
    );
  }

  return (
    <div style={{
      position: 'relative', width: '100%', height: '450px',
      borderRadius: '1.5rem', overflow: 'hidden', background: '#000',
      boxShadow: '0 18px 50px rgba(0, 0, 0, 0.15)',
    }}>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            position: 'absolute', inset: 0,
            background: `url(${slide.image_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            zIndex: 1,
          }}
        />
      ))}

      <div style={{
        position: 'absolute', inset: 0, zIndex: 10,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center', padding: '2rem',
        background: 'rgba(0,0,0,0.2)', pointerEvents: 'none'
      }}>
        <div style={{ pointerEvents: 'auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
            {slides[currentIndex].title}
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)' }}>
            {slides[currentIndex].subtitle}
          </p>
        </div>
      </div>
    </div>
  );
}