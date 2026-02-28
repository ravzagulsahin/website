import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureAdminHeader } from "@/lib/server/ensureAdmin";

export async function POST(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-admin-email");
    const ok = await ensureAdminHeader(adminEmail);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { title, subtitle, image_url, image_path, order_index = 0, active = true } = body;
    if (!title) return NextResponse.json({ error: "Missing title" }, { status: 400 });

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("home_gallery").insert([
      { title, subtitle, image_url, image_path, order_index, active },
    ]);
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
    const { id, title, subtitle, image_url, image_path, order_index = 0, active = true } = body;
    if (!id || !title) return NextResponse.json({ error: "Missing id or title" }, { status: 400 });

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("home_gallery")
      .update({ title, subtitle, image_url, image_path, order_index, active })
      .eq("id", id);
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
    const { data: row, error: fetchErr } = await supabase.from("home_gallery").select("*").eq("id", id).maybeSingle();
    if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
    const imagePath = (row as any)?.image_path;
    if (imagePath) {
      try {
        await supabase.storage.from("home_gallery").remove([imagePath]);
      } catch (e) {
        // best-effort
        console.warn("remove storage failed", e);
      }
    }

    const { error } = await supabase.from("home_gallery").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

