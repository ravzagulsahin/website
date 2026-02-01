import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Decorative */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -top-10 -left-10 w-72 h-72 bg-gradient-to-br from-amber-100 to-orange-50 rounded-full blur-3xl opacity-60" />
              <div className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-br from-rose-100 to-pink-50 rounded-full blur-2xl opacity-50" />
              <div className="relative z-10 p-12">
                <Mail className="w-16 h-16 text-zinc-300 mb-8" strokeWidth={1} />
                <h2 className="text-4xl font-serif italic mb-6 leading-tight">
                  Bizimle İletişime Geçin
                </h2>
                <p className="text-zinc-500 text-lg leading-relaxed mb-8">
                  Sorularınız, önerileriniz veya işbirliği teklifleriniz için
                  bize e-posta gönderebilirsiniz. En kısa sürede size dönüş yapacağız.
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

          {/* Right - Mailto CTA */}
          <div className="max-w-md mx-auto lg:mx-0 w-full">
            <div className="lg:hidden mb-12">
              <h1 className="text-4xl font-serif italic mb-4">İletişim</h1>
              <p className="text-zinc-500">
                Bize e-posta gönderin, en kısa sürede dönüş yapacağız.
              </p>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
              <p className="text-zinc-600 mb-6">
                Doğrudan e-posta ile ulaşmak için aşağıdaki butona tıklayın.
              </p>
              <a
                href="mailto:ravzagulte@gmail.com"
                className="inline-flex items-center justify-center gap-2 bg-brown-600 text-white px-6 py-3 rounded-full font-bold hover:bg-brown-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
                Bize E-posta Gönderin
              </a>
              <p className="mt-4 text-sm text-zinc-500">
                ravzagulte@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
