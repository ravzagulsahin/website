"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const BOOK_WIDTH = 400;
const BOOK_HEIGHT = 565;

const defaultFlipSettings = {
  startPage: 0,
  size: "fixed" as const,
  width: BOOK_WIDTH,
  height: BOOK_HEIGHT,
  minWidth: 0,
  maxWidth: 0,
  minHeight: 0,
  maxHeight: 0,
  drawShadow: true,
  flippingTime: 600,
  usePortrait: true,
  startZIndex: 0,
  autoSize: true,
  maxShadowOpacity: 0.5,
  showCover: false,
  mobileScrollSupport: true,
  clickEventForward: true,
  useMouseEvents: true,
  swipeDistance: 30,
  showPageCorners: true,
  disableFlipByClick: false,
};

export default function PdfViewerInner({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [jumpInput, setJumpInput] = useState("");
  const flipRef = useRef<{ pageFlip: () => { flip: (page: number, corner: string) => void; getCurrentPageIndex: () => number } } | null>(null);

  const jumpToPage = useCallback(
    (value: string) => {
      const n = parseInt(value, 10);
      if (Number.isNaN(n) || !numPages) return;
      if (n <= 0) {
        flipRef.current?.pageFlip()?.flip(0, "top");
        setJumpInput("1");
      } else if (n > numPages) {
        flipRef.current?.pageFlip()?.flip(numPages - 1, "top");
        setJumpInput(String(numPages));
      } else {
        flipRef.current?.pageFlip()?.flip(n - 1, "top");
        setJumpInput(String(n));
      }
    },
    [numPages]
  );

  const handleFlip = useCallback((e: { data?: number }) => {
    const page = e?.data;
    if (typeof page === "number") {
      setCurrentPageIndex(page);
      setJumpInput(String(page + 1));
    }
  }, []);

  useEffect(() => {
    if (numPages != null) setJumpInput("1");
  }, [numPages]);

  return (
    <div className="fixed inset-0 overflow-auto">
      {/* Hyperland background */}
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: "rgba(243, 234, 203, 0.4)", backdropFilter: "blur(80px)" }}
      />

      {/* Red-tinted desk behind the book */}
      <div className="min-h-screen flex flex-col items-center justify-start pt-24 pb-32 px-4">
        <div
          className="rounded-3xl bg-red-900/20 p-8 md:p-12 shadow-2xl"
          style={{
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(127, 29, 29, 0.1)",
          }}
        >
          {/* Floating glassmorphism navigation - top */}
          {numPages !== null && numPages > 0 && (
            <div
              className="mb-6 flex items-center justify-center gap-3 px-5 py-3 rounded-xl"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              }}
            >
              <span className="text-zinc-700 text-sm font-medium tabular-nums">
                Sayfa {currentPageIndex + 1} / {numPages}
              </span>
              <input
                type="number"
                min={1}
                max={numPages}
                value={jumpInput || currentPageIndex + 1}
                onChange={(e) => setJumpInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && jumpToPage((e.target as HTMLInputElement).value)}
                onBlur={(e) => jumpToPage(e.target.value) || setJumpInput(String(currentPageIndex + 1))}
                className="w-14 text-center text-sm bg-white/80 border border-zinc-200 rounded-lg py-1.5 px-2 text-zinc-800"
              />
              <button
                type="button"
                onClick={() => jumpToPage(jumpInput || String(currentPageIndex + 1))}
                className="text-xs text-zinc-600 hover:text-zinc-900 font-medium"
              >
                Git
              </button>
            </div>
          )}

          {/* Flipbook container */}
          <Document
            file={url}
            onLoadSuccess={({ numPages: n }) => setNumPages(n)}
            loading={
              <div className="flex items-center justify-center rounded-2xl bg-white/80 shadow-inner text-zinc-500 text-sm" style={{ width: BOOK_WIDTH, height: BOOK_HEIGHT }}>
                Belge hazırlanıyor...
              </div>
            }
            error={
              <div className="rounded-2xl bg-red-50 border border-red-200 p-8 text-center text-red-700 text-sm" style={{ width: BOOK_WIDTH, minHeight: BOOK_HEIGHT }}>
                PDF yüklenemedi. Lütfen bağlantınızı kontrol edin.
              </div>
            }
          >
            {numPages !== null && numPages > 0 && (
              <HTMLFlipBook
                ref={flipRef}
                {...defaultFlipSettings}
                className="flex justify-center items-start"
                style={{ width: BOOK_WIDTH, height: BOOK_HEIGHT }}
                onFlip={handleFlip}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <div
                    key={i}
                    className="bg-white shadow-inner overflow-hidden flex items-center justify-center"
                    style={{ width: BOOK_WIDTH, height: BOOK_HEIGHT }}
                    data-density="soft"
                  >
                    <Page
                      pageNumber={i + 1}
                      width={BOOK_WIDTH}
                      height={BOOK_HEIGHT}
                      renderAnnotationLayer={false}
                      loading={
                        <div className="text-zinc-400 text-sm">Yükleniyor...</div>
                      }
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            )}
          </Document>
        </div>
      </div>
    </div>
  );
}
