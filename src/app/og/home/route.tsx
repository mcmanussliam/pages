import { ImageResponse } from "next/og";

export const revalidate = false;

export async function GET() {
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        height: "100%",
        width: "100%",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#000",
        color: "#fff",
        padding: "48px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div
          style={{
            fontSize: 68,
            lineHeight: 1.02,
            fontWeight: 700,
            letterSpacing: "-0.04em",
          }}
        >
          mcmanussliam
        </div>
        <div
          style={{
            maxWidth: 900,
            fontSize: 30,
            lineHeight: 1.35,
            color: "rgba(255,255,255,0.62)",
          }}
        >
          small software projects, docs, and experiments.
        </div>
      </div>

      <div
        style={{
          fontSize: 24,
          color: "rgba(255,255,255,0.52)",
        }}
      >
        mcmanussliam
      </div>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  );
}
