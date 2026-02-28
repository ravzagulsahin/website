import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureAdminHeader } from "@/lib/server/ensureAdmin";

export async function PUT(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-admin-email");
    const ok = await ensureAdminHeader(adminEmail);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { id, title, issue_number } = body;
    if (!id || !title) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase.from("magazines").update({ title, issue_number }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
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
    const { error } = await supabase.from("magazines").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

