import { createClient } from "@supabase/supabase-js";

// Bu bilgiler sizin paylaştığınız dosyalardan alınmıştır
const supabase = createClient(
  "https://ykychxpadhdffpcqticr.supabase.co", 
  "sb_publishable_R1DmAxwY_Ltl7sI8sNcugA_fJJOLGyL"
);

async function fillAllTables() {
  console.log("🚀 Tüm tablolara veri ekleniyor...");

  // 1. Blog Yazısı Ekleme
  const { error: blogErr } = await supabase
    .from('blog_posts')
    .insert([{ 
      title: 'İlk Blog Yazım', 
      slug: 'ilk-blog-yazim', 
      content: 'Bu içerik Supabase üzerinden canlı gelmektedir.',
      published: true,
      published_at: new Date().toISOString()
    }]);
  if (!blogErr) console.log("✅ blog_posts: Veri eklendi.");

  // 2. Slider (Home Gallery) Ekleme
  const { error: galleryErr } = await supabase
    .from('home_gallery')
    .insert([{ 
      title: 'Ana Sayfa Slider 1', 
      image_url: 'test-slider.jpg', 
      order_index: 1 
    }]);
  if (!galleryErr) console.log("✅ home_gallery: Veri eklendi.");

  // 3. Dergi (Magazines) Ekleme
  const { error: magErr } = await supabase
    .from('magazines')
    .insert([{ 
      title: 'Ocak Sayısı', 
      issue: '2024 / 01', 
      cover_url: 'dergi-kapak.jpg',
      pdf_path: 'dergi.pdf',
      published: true,
      created_at: new Date().toISOString()
    }]);
  if (!magErr) console.log("✅ magazines: Veri eklendi.");
}

fillAllTables().catch(console.error);