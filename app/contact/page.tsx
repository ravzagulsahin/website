"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Mesaj gönderilemedi");
      }

      setStatus("success");
      setEmail("");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Bir hata oluştu");
    }
  };

  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Decorative */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Abstract shapes */}
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-amber-100 to-orange-50 rounded-full blur-3xl opacity-60" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-br from-rose-100 to-pink-50 rounded-full blur-2xl opacity-50" />
              
              {/* Content */}
              <div className="relative z-10 p-12">
                <Mail className="w-16 h-16 text-zinc-300 mb-8" strokeWidth={1} />
                <h2 className="text-4xl font-serif italic mb-6 leading-tight">
                  Bizimle İletişime Geçin
                </h2>
                <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                  Sorularınız, önerileriniz veya işbirliği teklifleriniz için 
                  bize ulaşabilirsiniz. En kısa sürede size dönüş yapacağız.
                </p>
                <div className="space-y-4 text-sm text-zinc-400">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Genellikle 24 saat içinde yanıt veriyoruz
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    Tüm mesajlarınız gizli tutulmaktadır
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="max-w-md mx-auto lg:mx-0 w-full">
            <div className="lg:hidden mb-12">
              <h1 className="text-4xl font-serif italic mb-4">İletişim</h1>
              <p className="text-zinc-500">
                Bize mesaj gönderin, en kısa sürede dönüş yapacağız.
              </p>
            </div>

            {status === "success" ? (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  Mesajınız Gönderildi!
                </h3>
                <p className="text-green-600 mb-6">
                  En kısa sürede size dönüş yapacağız.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  className="text-green-700 underline hover:no-underline"
                >
                  Yeni mesaj gönder
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{errorMessage}</p>
                  </div>
                )}

                <div>
                  <label 
                    htmlFor="email" 
                    className="block text-sm font-medium text-zinc-700 mb-2"
                  >
                    E-posta Adresiniz
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="ornek@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 outline-none transition-all text-zinc-800 placeholder:text-zinc-400"
                  />
                </div>

                <div>
                  <label 
                    htmlFor="message" 
                    className="block text-sm font-medium text-zinc-700 mb-2"
                  >
                    Mesajınız
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    placeholder="Mesajınızı buraya yazın..."
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 outline-none transition-all text-zinc-800 placeholder:text-zinc-400 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full bg-zinc-900 text-white py-4 px-6 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Mesaj Gönder
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
