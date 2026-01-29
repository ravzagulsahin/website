import Link from "next/link";
import { getLatestBlogPost } from "@/lib/data/blog";
import { r2 } from "@/lib/r2";

export default async function LatestBlogPost() {
  const post = await getLatestBlogPost();

  if (!post) {
    return (
      <section style={{
        marginTop: "5rem",
        paddingTop: "3rem",
        borderTop: "1px solid var(--stroke)"
      }}>
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.875rem",
          fontWeight: 700,
          color: "var(--text)",
          margin: 0
        }}>Latest Story</h2>
        <p style={{
          marginTop: "1rem",
          color: "var(--muted)",
          fontSize: "1rem"
        }}>Henüz yayınlanmış yazı yok.</p>
      </section>
    );
  }

  const cover = post.cover_path ? r2.blog(post.cover_path) : null;
  console.log('📝 LatestBlogPost - cover_path:', post.cover_path, '→ URL:', cover);

  return (
    <section style={{
      display: "grid",
      gridTemplateColumns: "repeat(12, 1fr)",
      gap: "2rem",
      alignItems: "start",
      marginTop: "5rem",
      marginBottom: "3rem",
      paddingTop: "3rem",
      borderTop: "1px solid var(--stroke)"
    }}>
      {/* Title (left, 4 cols) */}
      <div style={{
        gridColumn: "1 / 5",
      }}>
        <h2 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "1.875rem",
          fontWeight: 700,
          margin: 0,
          color: "var(--text)",
          lineHeight: 1.1
        }}>Latest Story</h2>
      </div>

      {/* Content (right, 8 cols) */}
      <div style={{
        gridColumn: "5 / 13",
        background: "var(--card)",
        border: "1px solid var(--stroke)",
        borderRadius: "0.5rem",
        overflow: "hidden"
      }}>
        {cover && (
          <img 
            src={cover} 
            alt={post.title} 
            style={{
              width: "100%",
              height: "280px",
              objectFit: "cover"
            }} 
          />
        )}
        <div style={{ padding: "2rem" }}>
          <h3 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.5rem",
            fontWeight: 700,
            margin: 0,
            marginBottom: "1rem",
            color: "var(--text)",
            lineHeight: 1.2
          }}>
            {post.title}
          </h3>
          {post.excerpt && (
            <p style={{
              fontSize: "1rem",
              color: "var(--muted)",
              margin: "1rem 0",
              lineHeight: 1.6
            }}>
              {post.excerpt}
            </p>
          )}
          <div style={{ marginTop: "1.5rem" }}>
            <Link
              href={`/blog/${post.slug}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                paddingRight: "0.75rem",
                color: "var(--accent)",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                transition: "opacity 200ms ease"
              }}
            >
              Read More →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
