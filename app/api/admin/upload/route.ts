import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ensureAdminHeader } from "@/lib/server/ensureAdmin";

export async function POST(request: NextRequest) {
  try {
    const adminEmail = request.headers.get("x-admin-email");
    const ok = await ensureAdminHeader(adminEmail);
    if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { filename, file, contentType, bucket: bucketName = "blog_images" } = await request.json();
    if (!filename || !file || !contentType) {
      return NextResponse.json({ error: "Missing file, filename or contentType" }, { status: 400 });
    }

    // Basic validations
    const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxImageBytes = 5 * 1024 * 1024; // 5MB
    const maxPdfBytes = 20 * 1024 * 1024; // 20MB

    const buffer = Buffer.from(file, "base64");
    if (contentType.startsWith("image/") && buffer.length > maxImageBytes) {
      return NextResponse.json({ error: "Image exceeds max size of 5MB" }, { status: 400 });
    }
    if (contentType === "application/pdf" && buffer.length > maxPdfBytes) {
      return NextResponse.json({ error: "PDF exceeds max size of 20MB" }, { status: 400 });
    }
    if (contentType.startsWith("image/") && !allowedImageTypes.includes(contentType)) {
      return NextResponse.json({ error: "Unsupported image type" }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const bucket = supabase.storage.from(bucketName);

    const { error: uploadError } = await bucket.upload(filename, buffer, {
      contentType,
      cacheControl: "public, max-age=3600",
      upsert: false,
    });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data } = bucket.getPublicUrl(filename);
    // Return both publicUrl and the storage path we wrote (useful for cleanup)
    return NextResponse.json({ publicUrl: data.publicUrl, path: filename, bucket: bucketName });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Server error" }, { status: 500 });
  }
}

