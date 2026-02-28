import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const paths: string[] = body?.paths ?? [];
    if (!Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ error: "No paths provided" }, { status: 400 });
    }

    for (const p of paths) {
      try {
        revalidatePath(p);
      } catch (e) {
        console.warn("revalidatePath failed for", p, e);
      }
    }

    return NextResponse.json({ revalidated: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

