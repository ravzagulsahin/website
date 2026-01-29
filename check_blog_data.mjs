import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ykychxpadhdffpcqticr.supabase.co";
const supabaseKey = "sb_publishable_R1DmAxwY_Ltl7sI8sNcugA_fJJOLGyL";

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBlogPosts() {
  console.log("📋 Supabase'teki tüm blog_posts verilerini kontrol ediyorum...\n");

  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, title, slug, published, published_at");

  if (error) {
    console.error("❌ Hata:", error.message);
    return;
  }

  if (!data || data.length === 0) {
    console.log("⚠️  Hiç blog post yok");
    return;
  }

  console.log(`📊 Toplam ${data.length} post bulundu:\n`);

  let issues = [];

  data.forEach((post, index) => {
    console.log(`${index + 1}. "${post.title}"`);
    console.log(`   ID: ${post.id}`);
    console.log(`   Slug: "${post.slug}"`);
    console.log(`   Published: ${post.published}`);
    console.log(`   Published At: ${post.published_at}`);

    // Kontrol et
    if (!post.slug || post.slug.trim() === "") {
      issues.push(`❌ Post ${index + 1}: Slug boş!`);
    }
    if (post.slug && post.slug.startsWith("/")) {
      issues.push(`❌ Post ${index + 1}: Slug "/" ile başlıyor! ("${post.slug}")`);
    }
    
    console.log("");
  });

  if (issues.length > 0) {
    console.log("\n⚠️  SORUNLAR BULUNDU:\n");
    issues.forEach(issue => console.log(issue));
  } else {
    console.log("✅ Slug verileri tamam görünüyor!");
  }
}

checkBlogPosts().catch(console.error);
