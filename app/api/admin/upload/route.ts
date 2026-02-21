import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { filename, file, contentType } = await request.json();
    if (!filename || !file) {
      return NextResponse.json({ error: "Missing file or filename" }, { status: 400 });
    }

    const buffer = Buffer.from(file, "base64");
    const supabase = createSupabaseServerClient();
    const bucket = supabase.storage.from("blog_images");
    const { error: uploadError } = await bucket.upload(filename, buffer, {
      contentType,
      cacheControl: "public, max-age=3600",
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = bucket.getPublicUrl(filename);
    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

