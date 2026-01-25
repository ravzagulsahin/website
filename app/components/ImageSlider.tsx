'use client';

import { useState, useEffect, useCallback } from 'react';
import { r2 } from "@/lib/r2";

interface Slide {
  id: number;
  title: string;
  description?: string;
  color: string;
  image_path?: string | null;
  image_url?: string | null;
}

const originalSlides: Slide[] = [
  { id: 1, title: 'Psikoloji Topluluğu Etkinlikleri', description: 'Topluluk etkinliklerimizden kareler', color: 'linear-gradient(135deg, #5a78ff, #ffb478)' },
  { id: 2, title: 'Seminer ve Konferanslar', description: 'Uzman konuşmacılarla buluşmalar', color: 'linear-gradient(135deg, #ffb478, #5a78ff)' },
  { id: 3, title: 'Araştırma Projeleri', description: 'Topluluk üyelerimizin çalışmaları', color: 'linear-gradient(135deg, #78ffb4, #ff78b4)' },
  { id: 4, title: 'Topluluk Buluşmaları', description: 'Birlikte öğrenme ve paylaşım', color: 'linear-gradient(135deg, #b478ff, #78b4ff)' },
  { id: 5, title: 'Workshop ve Atölyeler', description: 'Pratik beceriler geliştirme fırsatları', color: 'linear-gradient(135deg, #ff78c8, #78c8ff)' },
  { id: 6, title: 'Sosyal Etkinlikler', description: 'Eğlenceli ve unutulmaz anılar', color: 'linear-gradient(135deg, #c8ff78, #ffc878)' },
  { id: 7, title: 'Akademik Başarılar', description: 'Topluluk üyelerimizin başarı hikayeleri', color: 'linear-gradient(135deg, #78b4ff, #ff78b4)' },
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Modulo (%) operatörü sayesinde sonsuz döngü (7'den sonra 0'a geçer)
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % originalSlides.length);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + originalSlides.length) % originalSlides.length);
  };

  useEffect(() => {
    const timer = setInterval(handleNext, 5000);
    return () => clearInterval(timer);
  }, [handleNext]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '450px',
      borderRadius: '1.5rem',
      overflow: 'hidden',
      background: '#000', // Geçişlerde arkada boşluk kalmaması için
      boxShadow: '0 18px 50px rgba(0, 0, 0, 0.15)',
    }}>
      
      {/* ARKA PLAN KATMANI (Crossfade) */}
      {originalSlides.map((slide, index) => (
        <div
          key={slide.id}
          style={{
            position: 'absolute',
            inset: 0,
            background: slide.color,
            opacity: index === currentIndex ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out', // Yumuşak geçiş hızı
            zIndex: 1,
          }}
        />
      ))}

      {/* SABİT İÇERİK KATMANI (Hiç hareket etmez) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        pointerEvents: 'none' // Altındaki butonlara tıklanabilsin diye
      }}>
        {/* Yazılar da yumuşakça değişsin istersen burayı da index'e bağlayabiliriz, 
            ama talebine göre ana taşıyıcı sabit kalıyor */}
        <div style={{ pointerEvents: 'auto' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: 'white', marginBottom: '1rem', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
            {originalSlides[currentIndex].title}
          </h2>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.9)', maxWidth: '600px' }}>
            {originalSlides[currentIndex].description}
          </p>
        </div>
      </div>

      {/* NAVİGASYON (Oklar) */}
      <button onClick={handlePrev} style={navButtonStyle('left')}>‹</button>
      <button onClick={handleNext} style={navButtonStyle('right')}>›</button>

      {/* DOTS (Sabit Göstergeler) */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        gap: '10px'
      }}>
        {originalSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: index === currentIndex ? '30px' : '10px',
              height: '10px',
              borderRadius: '5px',
              border: 'none',
              background: 'white',
              opacity: index === currentIndex ? 1 : 0.4,
              transition: 'all 0.4s ease',
              cursor: 'pointer'
            }}
          />
        ))}
      </div>
    </div>
  );
}

// Yardımcı stil fonksiyonu
const navButtonStyle = (side: 'left' | 'right'): React.CSSProperties => ({
  position: 'absolute',
  [side]: '1.5rem',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 25,
  width: '50px',
  height: '50px',
  borderRadius: '50%',
  border: 'none',
  background: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  color: 'white',
  fontSize: '2rem',
  cursor: 'pointer',
  transition: 'background 0.3s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});