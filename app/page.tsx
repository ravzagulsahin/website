import ImageSlider from './components/ImageSlider';
import { getMagazines } from '@/lib/data/magazines';
import Link from 'next/link';
import LatestBlogPost from '@/app/components/LatestBlogPost';

export default async function Home() {
  const allMagazines = await getMagazines();
  const featuredMagazines = allMagazines.slice(0, 3);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "3rem 2rem" }}>
      
      {/* ASYMMETRICAL HERO SECTION - 12 column grid */}
      <section style={{
        display: "grid",
        gridTemplateColumns: "repeat(12, 1fr)",
        gap: "3rem",
        alignItems: "start",
        marginBottom: "5rem"
      }}>
        {/* Left: Title (4 columns, vertical offset) */}
        <div style={{
          gridColumn: "1 / 5",
          paddingTop: "2rem",
        }}>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-1.5px",
            color: "var(--text)",
            marginBottom: "1rem"
          }}>
            The Journal
          </h1>
          <p style={{
            fontSize: "1.1rem",
            color: "var(--muted)",
            maxWidth: "280px",
            lineHeight: 1.6,
            fontWeight: 400
          }}>
            Akdeniz Üniversitesi Psikoloji Topluluğu
          </p>
        </div>

        {/* Right: ImageSlider (8 columns, focal point) */}
        <div style={{
          gridColumn: "5 / 13",
        }}>
          <ImageSlider />
        </div>
      </section>

      {/* Magazine preview cards */}
      <section style={{ marginBottom: "5rem" }}>
        <div style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: "2rem",
          marginBottom: "2.5rem",
          borderBottom: "1px solid var(--stroke)",
          paddingBottom: "1.5rem"
        }}>
          <div>
            <h2 style={{
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--text)",
              margin: 0,
              fontFamily: "var(--font-serif)"
            }}>
              Featured Editions
            </h2>
          </div>

          <Link
            href="/magazines"
            style={{
              textDecoration: "none",
              color: "var(--accent)",
              fontSize: "0.95rem",
              fontWeight: 600,
              opacity: 1,
              transition: "opacity 200ms ease"
            }}
          >
            View All →
          </Link>
        </div>

        {featuredMagazines.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "2rem",
              alignItems: "start",
            }}
          >
            {featuredMagazines.map((magazine) => (
              <Link
                key={magazine.id}
                href={`/magazines/${magazine.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <article style={{
                  background: "var(--card)",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--stroke)",
                  overflow: "hidden",
                  transition: "transform 300ms ease, box-shadow 300ms ease",
                  cursor: "pointer"
                }} 
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "scale(1.02)";
                  el.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.12)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "scale(1)";
                  el.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
                }}>
                  {/* Cover 3:4 aspect ratio */}
                  <div style={{
                    aspectRatio: "3 / 4",
                    overflow: "hidden",
                    background: "rgba(0,0,0,0.04)",
                    position: "relative"
                  }}>
                    {magazine.coverUrl ? (
                      <img
                        src={magazine.coverUrl}
                        alt={magazine.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "filter 400ms ease, transform 400ms ease"
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLImageElement;
                          el.style.transform = "scale(1)";
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "linear-gradient(135deg, rgba(139, 115, 85, 0.1), rgba(212, 197, 185, 0.1))",
                        color: "var(--muted)"
                      }}>
                        No Cover
                      </div>
                    )}
                  </div>

                  {/* Meta */}
                  <div style={{ padding: "1.5rem 1.25rem" }}>
                    <h3 style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                      color: "var(--text)",
                      lineHeight: 1.3,
                      fontStyle: "italic"
                    }}>
                      {magazine.title}
                    </h3>
                    <p style={{
                      fontSize: "0.85rem",
                      color: "var(--muted)",
                      margin: 0
                    }}>
                      {magazine.issue}
                    </p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        ) : (
          <div style={{
            padding: "2rem",
            background: "var(--card)",
            borderRadius: "0.5rem",
            border: "1px solid var(--stroke)"
          }}>
            <p style={{ color: "var(--muted)", margin: 0 }}>Henüz dergi bulunmamaktadır.</p>
          </div>
        )}
      </section>

      {/* Latest blog post */}
      <LatestBlogPost />

      {/* Contact section */}
      <section style={{ marginTop: "5rem", paddingTop: "3rem", borderTop: "1px solid var(--stroke)" }}>
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.75rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
          color: "var(--text)"
        }}>
          Stay Updated
        </h2>
        <div style={{ display: "flex", gap: "1rem", maxWidth: "500px" }}>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              flex: 1,
              padding: "0.875rem 1.25rem",
              border: "1px solid var(--stroke)",
              borderRadius: "0.375rem",
              fontSize: "1rem",
              background: "rgba(255, 255, 255, 0.8)",
              color: "var(--text)",
              fontFamily: "var(--font-sans)",
              transition: "border-color 200ms ease"
            }}
          />
          <button
            type="button"
            style={{
              padding: "0.875rem 2rem",
              backgroundColor: "var(--text)",
              color: "var(--bg)",
              border: "none",
              fontSize: "1rem",
              cursor: "pointer",
              borderRadius: "0.375rem",
              fontWeight: 600,
              fontFamily: "var(--font-sans)",
              transition: "opacity 200ms ease"
            }}
          >
            Subscribe
          </button>
        </div>
      </section>
    </div>
  );
}
