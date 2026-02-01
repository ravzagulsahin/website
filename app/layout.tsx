import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./globals.css";
import { AdminProvider } from "@/lib/context/AdminContext";
import AdminToolbar from "@/app/components/AdminToolbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Psikoloji Dergisi | The Journal",
  description: "Psikoloji dünyasından en güncel içerikler, makaleler ve araştırmalar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AdminProvider>
          <nav className="navbar">
            <div className="nav-inner">
              <div className="pill">
                <Link href="/">Ana Sayfa</Link>
                <Link href="/about">Hakkımızda</Link>
                <Link href="/#gallery">Galeri</Link>
                <Link href="/magazines">Dergiler</Link>
                <Link href="/blog">Blog</Link>
                <Link href="/contact">İletişim</Link>
              </div>
            </div>
          </nav>
          <main className="container">
            {children}
          </main>
          <AdminToolbar />
        </AdminProvider>
      </body>
    </html>
  );
}
