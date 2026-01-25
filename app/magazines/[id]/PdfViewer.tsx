"use client";

import { useEffect, useState, type ComponentType } from "react";

type Props = {
  url: string; // public pdf url ya da signed url
};

export default function PdfViewer({ url }: Props) {
  const [Inner, setInner] = useState<null | ComponentType<Props>>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        // react-pdf'yi import eden dosyayı SADECE client'ta yükle
        const mod = await import("./PdfViewerInner");
        if (alive) setInner(() => mod.default);
      } catch (e) {
        if (alive) setErr(String(e));
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (err) return <div style={{ padding: 24, color: "crimson" }}>{err}</div>;
  if (!Inner) return <div style={{ padding: 24, textAlign: "center", color: "var(--muted)", fontSize: "0.95rem" }}>PDF hazırlanıyor...</div>;

  return <Inner url={url} />;
}
