import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureAdminHeader } from "@/lib/server/ensureAdmin";

export async function GET() {
  // Server-side admin check via header
  // Expect header: x-admin-email
  try {
    return NextResponse.json({ error: "GET not allowed on this admin route" }, { status: 405 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-admin-email");
    const ok = await ensureAdminHeader(adminEmail);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("blog_posts").insert([body]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-admin-email");
    const ok = await ensureAdminHeader(adminEmail);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { id, ...rest } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("blog_posts").update(rest).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-admin-email");
    const ok = await ensureAdminHeader(adminEmail);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const supabase = createSupabaseServerClient();
    // Fetch row so we can cleanup storage objects referenced by it
    const { data: rows, error: fetchErr } = await supabase.from("blog_posts").select("*").eq("id", id).maybeSingle();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    const row = rows as any;

    // Helper to parse Supabase public URLs and attempt to remove the underlying storage object
    const tryRemoveUrl = async (url?: string) => {
      if (!url) return;
      try {
        const u = new URL(url);
        // Supabase public URL pattern: /storage/v1/object/public/{bucket}/{path}
        const parts = u.pathname.split("/").filter(Boolean);
        const idx = parts.findIndex(p => p === "storage");
        if (idx >= 0 && parts[idx + 2] === "object" && parts[idx + 3] === "public") {
          const bucket = parts[idx + 4];
          const path = parts.slice(idx + 5).join("/");
          if (bucket && path) {
            await supabase.storage.from(bucket).remove([decodeURIComponent(path)]);
          }
        }
      } catch (e) {
        // ignore parse/remove errors - best-effort cleanup
        console.warn("tryRemoveUrl failed", e);
      }
    };

    // Attempt to remove cover image
    await tryRemoveUrl(row?.cover_path);

    // Attempt to remove images embedded in content (if content.raw is HTML)
    try {
      const content = row?.content;
      let html = "";
      if (content && typeof content === "object" && "raw" in content) html = content.raw;
      else if (typeof content === "string") html = content;
      if (html) {
        const imgUrls = Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)).map(m => m[1]);
        for (const url of imgUrls) {
          await tryRemoveUrl(url);
        }
      }
    } catch (e) {
      console.warn("content cleanup failed", e);
    }

    // Finally delete DB row
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

