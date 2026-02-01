import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, message } = await request.json();

    // Validate input
    if (!email || !message) {
      return NextResponse.json(
        { error: "E-posta ve mesaj alanları zorunludur." },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz." },
        { status: 400 }
      );
    }

    // Get all admin emails from the database
    const supabase = createSupabaseServerClient();
    const { data: admins, error: adminError } = await supabase
      .from("admins")
      .select("email");

    if (adminError) {
      console.error("Error fetching admins:", adminError);
      return NextResponse.json(
        { error: "Bir hata oluştu. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      );
    }

    const adminEmails = admins?.map((admin) => admin.email).filter(Boolean) || [];

    if (adminEmails.length === 0) {
      console.error("No admin emails found");
      return NextResponse.json(
        { error: "Sistem hatası. Lütfen daha sonra tekrar deneyin." },
        { status: 500 }
      );
    }

    // Save the message to the database (optional)
    const { error: insertError } = await supabase
      .from("contact_messages")
      .insert({ email, message });

    if (insertError) {
      console.error("Error saving contact message:", insertError);
      // Continue anyway - email sending is more important
    }

    // Send email to all admins
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
              ${message}
            </p>
          </div>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            Bu mesaj web sitenizdeki iletişim formu aracılığıyla gönderilmiştir.
          </p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
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
