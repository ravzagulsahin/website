import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ykychxpadhdffpcqticr.supabase.co";
const supabase = createClient(supabaseUrl, "sb_publishable_R1DmAxwY_Ltl7sI8sNcugA_fJJOLGyL");

async function checkAllTables() {
  console.log("📋 Kod'da kullanılan tabloları Supabase'te kontrol ediyorum...\n");

  // Kod'da bulunan tablo adları
  const tablesToCheck = [
    { name: "blog_posts", file: "lib/data/blog.ts" },
    { name: "home_gallery", file: "lib/data/homeGallery.ts" },
    { name: "magazines", file: "lib/data/magazines.ts" }
  ];
  
  let issues = [];
  
  for (const table of tablesToCheck) {
    const { data, error } = await supabase
      .from(table.name)
      .select("*")
      .limit(1);
    
    if (error && error.message.includes("does not exist")) {
      issues.push(`❌ TABLO YOK: "${table.name}" (kullanıldığı yer: ${table.file})`);
    } else if (!error) {
      console.log(`✅ ${table.name}: Var (${data.length} kayıt)`);
    } else {
      console.log(`⚠️  ${table.name}: ${error.message.substring(0, 60)}`);
    }
  }
  
  if (issues.length > 0) {
    console.log("\n🔴 SORUNLAR:\n");
    issues.forEach(i => console.log(i));
  } else {
    console.log("\n✅ Tüm tablo adları doğru!");
  }
}

checkAllTables().catch(console.error);
