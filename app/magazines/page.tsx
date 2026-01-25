import { getMagazines } from "@/lib/data/magazines";
import Link from "next/link";

export default async function MagazinesPage() {
  const magazines = await getMagazines();

  return (
    <div>
      <h1 style={{ fontSize: "2rem", marginBottom: "2rem", fontWeight: "600", color: "var(--text)" }}>
        Magazines
      </h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "2rem",
        }}
      >
        {magazines.map((magazine) => (
          <Link
            key={magazine.id}
            href={`/magazines/${magazine.id}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div className="card" style={{ padding: "0", overflow: "hidden" }}>
              {/* Kapak alanı - aspect ratio */}
              <div
                style={{
                  width: "100%",
                  aspectRatio: "16/10",
                  backgroundColor: "rgba(255, 255, 255, 0.40)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {magazine.coverUrl ? (
                  <img
                    src={magazine.coverUrl}
                    alt={magazine.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>No Cover</span>
                )}
              </div>
              {/* İçerik - bol padding */}
              <div style={{ padding: "1.5rem" }}>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    marginBottom: "0.5rem",
                    fontWeight: "600",
                    color: "var(--text)",
                    lineHeight: "1.3",
                  }}
                >
                  {magazine.title}
                </h3>
                <p
                  style={{
                    color: "var(--muted)",
                    fontSize: "0.875rem",
                    marginBottom: "0",
                    fontWeight: "400",
                  }}
                >
                  {magazine.issue}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
