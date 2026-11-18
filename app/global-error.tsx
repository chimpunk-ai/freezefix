"use client";

// Last-resort error boundary. Catches render failures in the root layout
// itself (fonts fail to load, a provider crashes, etc). Must render its own
// <html>/<body> because the layout isn't available here. Kept intentionally
// dependency-free: no Tailwind, no shared components, no images. If those
// are what crashed, we can't rely on them.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          padding: 0,
          minHeight: "100vh",
          background: "#12100E",
          color: "#E6ECE8",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <main style={{ maxWidth: 640, margin: "0 auto", padding: "2.5rem 1.25rem" }}>
          <p
            style={{
              fontSize: 12,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              color: "#8699A1",
              margin: "0 0 0.5rem",
            }}
          >
            fix &mdash; something broke
          </p>
          <h1 style={{ fontFamily: "ui-serif, Georgia, serif", fontWeight: 400, fontSize: 32, lineHeight: 1.1, margin: 0 }}>
            the whole page didn&rsquo;t load.
          </h1>
          <p style={{ color: "#B6C2BC", lineHeight: 1.6, marginTop: 16 }}>
            nothing you did. try again. if it keeps happening, your log is safe on your
            device either way.
          </p>
          <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 12 }}>
            <button
              type="button"
              onClick={reset}
              style={{
                padding: "10px 20px",
                borderRadius: 999,
                background: "#F0A868",
                color: "#12100E",
                border: 0,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              try again
            </button>
            <a
              href="/help"
              style={{
                padding: "10px 16px",
                borderRadius: 999,
                border: "1px solid #3A3733",
                color: "#E6ECE8",
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              get help now
            </a>
          </div>
          {error.digest ? (
            <p style={{ color: "#8699A1", fontSize: 12, marginTop: 24 }}>
              reference: <span style={{ fontFamily: "ui-monospace, monospace" }}>{error.digest}</span>
            </p>
          ) : null}
        </main>
      </body>
    </html>
  );
}
