import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureAdminHeader } from "@/lib/server/ensureAdmin";

export async function GET() {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("about_content").select("id,content").maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? null);
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
    const { content } = body;
    if (typeof content !== "string") return NextResponse.json({ error: "Invalid content" }, { status: 400 });

    const supabase = createSupabaseServerClient();
    const { data: existing } = await supabase.from("about_content").select("id").maybeSingle();
    const id = (existing as any)?.id;
    if (id) {
      const { error } = await supabase.from("about_content").update({ content }).eq("id", id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true });
    } else {
      const { error } = await supabase.from("about_content").insert({ content });
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ success: true }, { status: 201 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

