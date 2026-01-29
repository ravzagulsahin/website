import Link from "next/link";

type Magazine = {
  id: string;
  title: string;
  issue?: string | null;
  coverUrl?: string | null;
};

export default function MagazineCard({ m }: { m: Magazine }) {
  console.log("MAG RAW:", m);
  return (
    <Link href={`/magazines/${m.id}`} style={{ textDecoration: "none" }}>
      <article
        style={{
          background: "white",
          borderRadius: 24,
          boxShadow: "0 18px 40px rgba(0,0,0,0.10)",
          border: "1px solid rgba(0,0,0,0.06)",
          overflow: "hidden",
          maxWidth: 640,        // /magazines sayfasındaki gibi iri kart
          width: "100%",
        }}
      >
        {/* Cover area */}
        <div
          style={{
            width: "100%",
            height: 360,         // BU kartın “büyük cover” hissi
            background: "rgba(0,0,0,0.03)",
            display: "grid",
            placeItems: "center",
          }}
        >
          {m.coverUrl ? (
            // cover varsa burada img / next/image koyarsın
            <img
              src={m.coverUrl}
              alt={m.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div style={{ color: "rgba(0,0,0,0.55)", fontSize: 22 }}>No Cover</div>
          )}
        </div>

        {/* Meta area */}
        <div style={{ padding: 28, background: "rgba(0,0,0,0.02)" }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: "rgba(0,0,0,0.82)",
              lineHeight: 1.1,
            }}
          >
            {m.title}
          </div>
          <div style={{ marginTop: 12, fontSize: 22, color: "rgba(0,0,0,0.55)" }}>
            {m.issue ?? ""}
          </div>
        </div>
      </article>
    </Link>
  );
}
