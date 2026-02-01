import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";

    // Validate input
    if (!email || !message) {
      return NextResponse.json(
        { error: "E-posta ve mesaj alanları zorunludur." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // 1. Save message to contact_messages first
    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({ email, message });

    if (insertError) {
      console.error("Contact API: insert error", insertError);
      return NextResponse.json(
        { error: "Mesaj kaydedilemedi. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      );
    }

    // 2. Get all admin emails
    const { data: admins, error: adminError } = await supabase
      .from("admins")
      .select("email");

    if (adminError) {
      console.error("Contact API: fetch admins error", adminError);
      return NextResponse.json(
        { error: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      );
    }

    const adminEmails = admins?.map((a) => a.email).filter(Boolean) as string[];

    if (adminEmails.length === 0) {
      return NextResponse.json({ success: true });
    }

    // 3. Send email to admins via Resend
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Contact API: RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "E-posta servisi yapılandırılmamış. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const { error: emailError } = await resend.emails.send({
      from: "İletişim Formu <onboarding@resend.dev>",
      to: adminEmails,
      replyTo: email,
      subject: `Yeni İletişim Mesajı - ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            Yeni İletişim Mesajı
          </h2>
          <p style="color: #666; margin: 20px 0;">
            <strong>Gönderen:</strong> ${email}
          </p>
          <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #333; white-space: pre-wrap; margin: 0;">
              ${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}
            </p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Bu mesaj web sitenizdeki iletişim formu aracılığıyla gönderilmiştir.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Contact API: Resend error", emailError);
      return NextResponse.json(
        { error: "E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." },
      { status: 500 }
    );
  }
}
