import Link from "next/link";
import { getMagazines } from "@/lib/data/magazines";

type Magazine = {
  id: string;
  title: string;
  issue?: string | null;
  coverUrl?: string | null; // senin getMagazines() bunu veriyor gibi
};

function FeaturedMagazineCard({ mag }: { mag: Magazine }) {
  return (
    <Link href={`/magazines/${mag.id}`} style={{ textDecoration: "none", color: "inherit" }}>
      <article
        style={{
          background: "white",
          borderRadius: 22,
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 14px 34px rgba(0,0,0,0.10)",
          overflow: "hidden",
          transition: "transform 180ms ease, box-shadow 180ms ease",
        }}
      >
        {/* Cover: SABİT ve küçük — mezar taşı yok */}
        <div
          style={{
            width: "100%",
            height: 170,
            position: "relative",
            overflow: "hidden",
            background: "rgba(255,255,255,0.55)",
          }}
        >
          {/* her durumda hafif gradient */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(135deg, rgba(120,120,255,0.18), rgba(255,170,220,0.18), rgba(130,240,200,0.18))",
            }}
          />

          {mag.coverUrl ? (
            <img
              src={mag.coverUrl}
              alt={mag.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                padding: "1rem",
              }}
            >
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.45rem 0.75rem",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.55)",
                  border: "1px solid rgba(0,0,0,0.08)",
                  color: "rgba(0,0,0,0.60)",
                  fontSize: "0.9rem",
                  backdropFilter: "blur(8px)",
                }}
              >
                <span>📘</span>
                <span>Kapak yakında</span>
              </div>
            </div>
          )}
        </div>

        {/* Meta */}
        <div style={{ padding: "1rem 1.1rem 1.15rem" }}>
          <h3
            style={{
              margin: 0,
              fontSize: "1.05rem",
              fontWeight: 650,
              color: "var(--text)",
              lineHeight: 1.25,
            }}
          >
            {mag.title}
          </h3>

          <div
            style={{
              marginTop: "0.45rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
            }}
          >
            <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.9rem" }}>
              {mag.issue ?? ""}
            </p>
            <span style={{ fontSize: "0.9rem", opacity: 0.8, fontWeight: 500 }}>
              Oku →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default async function FeaturedMagazines() {
  const all = await getMagazines();
  const mags = all.slice(0, 3) as Magazine[];

  return (
    <section style={{ marginBottom: "3rem" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 600, color: "var(--text)", margin: 0 }}>
            Featured Magazines
          </h2>
          <p style={{ margin: "0.35rem 0 0", color: "var(--muted)", fontSize: "0.95rem" }}>
            Son yayınlanan sayılardan seçmeler
          </p>
        </div>

        <Link
          href="/magazines"
          style={{
            textDecoration: "none",
            color: "var(--text)",
            fontSize: "0.95rem",
            fontWeight: 500,
            opacity: 0.85,
          }}
        >
          Tümünü gör →
        </Link>
      </div>

      {/* Grid: KARTLAR asla full-width mezar taşı olmaz */}
      {mags.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 280px))",
            gap: "1.25rem",
            alignItems: "start",
          }}
        >
          {mags.map((mag) => (
            <FeaturedMagazineCard key={mag.id} mag={mag} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: "1.25rem" }}>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", margin: 0 }}>
            Henüz dergi bulunmamaktadır.
          </p>
        </div>
      )}
    </section>
  );
}
