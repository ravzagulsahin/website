"use client";

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Worker ayarı - local dosyadan yükle
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export default function PdfViewerInner({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const updateWidth = () => {
      const maxW = Math.min(window.innerWidth - 48, 900);
      setWidth(maxW);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "2rem 0", width: "100%" }}>
      <Document
        file={url}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        loading={
          <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)", fontSize: "0.95rem" }}>
            Belge hazırlanıyor...
          </div>
        }
        error={
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#dc2626",
              fontSize: "0.95rem",
              background: "rgba(220, 38, 38, 0.10)",
              borderRadius: "12px",
              border: "1px solid rgba(220, 38, 38, 0.20)",
            }}
          >
            PDF yüklenemedi. Lütfen bağlantınızı kontrol edin.
          </div>
        }
      >
        <div
          style={{
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
            border: "1px solid rgba(0, 0, 0, 0.10)",
            borderRadius: "4px",
            overflow: "hidden",
            marginBottom: "1rem",
          }}
        >
          <Page
            pageNumber={pageNumber}
            width={width}
            renderAnnotationLayer={false}
            loading={
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--muted)" }}>
                Sayfa yükleniyor...
              </div>
            }
          />
        </div>
      </Document>

      {/* Navigasyon - Fixed bottom, glass effect */}
      {numPages && (
        <div
          style={{
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(255, 255, 255, 0.90)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(0, 0, 0, 0.10)",
            padding: "0.75rem 1.5rem",
            borderRadius: "999px",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            zIndex: 50,
          }}
        >
          <button
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: "transparent",
              color: "var(--text)",
              cursor: pageNumber <= 1 ? "not-allowed" : "pointer",
              opacity: pageNumber <= 1 ? 0.3 : 1,
              fontWeight: "500",
              fontSize: "0.9rem",
              transition: "opacity 0.2s",
            }}
          >
            ← Geri
          </button>
          <span
            style={{
              fontSize: "0.875rem",
              fontFamily: "monospace",
              color: "var(--text)",
              fontWeight: "500",
              minWidth: "80px",
              textAlign: "center",
            }}
          >
            {pageNumber} / {numPages}
          </span>
          <button
            onClick={() => setPageNumber((p) => Math.min(numPages || 1, p + 1))}
            disabled={pageNumber >= (numPages || 1)}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              background: "transparent",
              color: "var(--text)",
              cursor: pageNumber >= (numPages || 1) ? "not-allowed" : "pointer",
              opacity: pageNumber >= (numPages || 1) ? 0.3 : 1,
              fontWeight: "500",
              fontSize: "0.9rem",
              transition: "opacity 0.2s",
            }}
          >
            İleri →
          </button>
        </div>
      )}
    </div>
  );
}
