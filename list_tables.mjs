import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ykychxpadhdffpcqticr.supabase.co";
// Admin key gerekli - ama burada public key var. 
// Alternatif: information_schema'dan tablo listesi al

const supabase = createClient(supabaseUrl, "sb_publishable_R1DmAxwY_Ltl7sI8sNcugA_fJJOLGyL");

async function listTables() {
  console.log("📋 Supabase'teki tabloları listelemeye çalışıyorum...\n");

  // Bir tablo adı test et
  const tableNamesToTest = ["blog_posts", "blogs", "blog", "articles", "posts"];
  
  for (const tableName of tableNamesToTest) {
    const { data, error } = await supabase
      .from(tableName)
      .select("*")
      .limit(0);
    
    if (!error) {
      console.log(`✅ TABLO BULUNDU: "${tableName}"`);
    } else if (error.message.includes("does not exist")) {
      console.log(`❌ Tablo yok: "${tableName}"`);
    } else {
      console.log(`⚠️  "${tableName}": ${error.message}`);
    }
  }
}

listTables().catch(console.error);
