import ImageSlider from './components/ImageSlider';
import { getMagazines } from '@/lib/data/magazines';
import Link from 'next/link';
import LatestBlogPost from '@/app/components/LatestBlogPost';

export default async function Home() {
  const allMagazines = await getMagazines();
  const featuredMagazines = allMagazines.slice(0, 3);

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "1rem", fontWeight: "600", color: "var(--text)" }}>
        Akdeniz Üniversitesi Psikoloji Topluluğu
      </h1>
      {/* Top photo/slider */}
      <section style={{ marginBottom: "3rem" }}>
        <ImageSlider />
      </section>

      {/* Magazine preview cards */}
<section style={{ marginBottom: "3rem" }}>
  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem" }}>
    <div>
      <h2 style={{ fontSize: "1.5rem", fontWeight: "600", color: "var(--text)", margin: 0 }}>
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
        fontWeight: "500",
        opacity: 0.85,
      }}
    >
      Tümünü gör →
    </Link>
  </div>

  {featuredMagazines.length > 0 ? (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 280px))",
        gap: "1.25rem",
        alignItems: "start",
      }}
    >
      {featuredMagazines.map((magazine) => (
        <Link
          key={magazine.id}
          href={`/magazines/${magazine.id}`}
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <article
            className="card featured-card"
            style={{
              padding: 0,
              overflow: "hidden",
              borderRadius: "18px",
              border: "1px solid rgba(0,0,0,0.06)",
            }}
          >
            {/* Cover area (fixed height, not full-page) */}
            <div
              style={{
                width: "100%",
                height: 180,
                position: "relative",
                overflow: "hidden",
                background: "rgba(255,255,255,0.55)",
              }}
            >
              {/* subtle overlay gradient (always) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(135deg, rgba(120,120,255,0.18), rgba(255,170,220,0.18), rgba(130,240,200,0.18))",
                }}
              />

              {magazine.coverUrl ? (
                <img
                  src={magazine.coverUrl}
                  alt={magazine.title}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                // Designed placeholder (no ugly "No Cover" in the middle of emptiness)
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
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.55)",
                      border: "1px solid rgba(0,0,0,0.08)",
                      color: "rgba(0,0,0,0.60)",
                      fontSize: "0.9rem",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    <span style={{ fontSize: "1rem" }}>📘</span>
                    <span>Kapak yakında</span>
                  </div>
                </div>
              )}
            </div>

            {/* Meta area */}
            <div style={{ padding: "1rem 1.1rem 1.1rem" }}>
              <h3
                style={{
                  fontSize: "1.05rem",
                  margin: 0,
                  fontWeight: "650",
                  color: "var(--text)",
                  lineHeight: 1.25,
                }}
              >
                {magazine.title}
              </h3>

              <div style={{ marginTop: "0.45rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: 0 }}>
                  {magazine.issue}
                </p>

                <span
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--text)",
                    opacity: 0.8,
                    fontWeight: 500,
                  }}
                >
                  Oku →
                </span>
              </div>
            </div>
          </article>
        </Link>
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

      {/* Latest blog post */}
      <LatestBlogPost />

      {/* Contact section */}
      <section>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", fontWeight: "600", color: "var(--text)" }}>
          Contact Us
        </h2>
        <div style={{ display: "flex", gap: "0.5rem", maxWidth: "500px" }}>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              flex: 1,
              padding: "0.75rem 1rem",
              border: "1px solid rgba(0, 0, 0, 0.10)",
              borderRadius: "8px",
              fontSize: "1rem",
              background: "rgba(255, 255, 255, 0.60)",
              backdropFilter: "blur(8px)",
              color: "var(--text)",
            }}
          />
          <button
            type="button"
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "var(--text)",
              color: "var(--bg)",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
              borderRadius: "8px",
              fontWeight: "500",
              transition: "opacity 0.2s",
            }}
          >
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}
