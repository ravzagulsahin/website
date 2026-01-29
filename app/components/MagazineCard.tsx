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
          background: "var(--card)",
          borderRadius: "0.5rem",
          border: "1px solid var(--stroke)",
          overflow: "hidden",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms ease",
          cursor: "pointer",
          display: "flex",
          flexDirection: "column"
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          el.style.transform = "scale(1.02) translateY(-2px)";
          el.style.boxShadow = "0 16px 40px rgba(0, 0, 0, 0.14)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget;
          el.style.transform = "scale(1) translateY(0)";
          el.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.06)";
        }}
      >
        {/* Cover 3:4 aspect ratio */}
        <div
          style={{
            width: "100%",
            aspectRatio: "3 / 4",
            height: 360,
            overflow: "hidden",
            background: "rgba(0,0,0,0.03)",
            display: "grid",
            placeItems: "center",
            position: "relative",
          }}
        >
          {m.coverUrl ? (
            <img
              src={m.coverUrl}
              alt={m.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: "grayscale(0%)",
                transition: "filter 500ms ease, transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.filter = "grayscale(0%) brightness(1.1)";
                el.style.transform = "scale(1.08)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.filter = "grayscale(0%)";
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
              color: "var(--muted)",
              fontSize: "0.9rem"
            }}>
              No Cover
            </div>
          )}
        </div>

        {/* Meta area */}
        <div style={{ padding: "1.5rem 1.25rem" }}>
          <h3
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.05rem",
              fontWeight: 700,
              margin: 0,
              marginBottom: "0.5rem",
              color: "var(--text)",
              lineHeight: 1.3,
              fontStyle: "italic"
            }}
          >
            {m.title}
          </h3>
          <p style={{
            fontSize: "0.875rem",
            color: "var(--muted)",
            margin: 0,
            fontWeight: 400
          }}>
            {m.issue ?? ""}
          </p>
        </div>
      </article>
    </Link>
  );
}
