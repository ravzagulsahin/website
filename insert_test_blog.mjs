import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ykychxpadhdffpcqticr.supabase.co";
const supabaseKey = "sb_publishable_R1DmAxwY_Ltl7sI8sNcugA_fJJOLGyL";

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestBlogPost() {
  console.log("📝 Test blog post ekleniyor...\n");

  const testPost = {
    title: "Test Blog Post",
    slug: "test-blog-post",
    excerpt: "Bu bir test blog yazısıdır.",
    published: true,
    published_at: new Date().toISOString(),
    cover_path: null,
    content: {
      html: "<p>Test içeriği</p>"
    }
  };

  const { data, error } = await supabase
    .from("blog_posts")
    .insert([testPost])
    .select();

  if (error) {
    console.error("❌ Hata:", error.message);
    console.error("Detaylar:", error);
    return;
  }

  console.log("✅ Test post başarıyla eklendi!");
  console.log("Post ID:", data[0].id);
  console.log("Post Slug:", data[0].slug);
  console.log("\nŞimdi /blog/test-blog-post'a giderek testi yapabilirsiniz.");
}

insertTestBlogPost().catch(console.error);
