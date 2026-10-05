import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "#f6f2e9",
          color: "#173d3a",
          display: "flex",
          height: "100%",
          padding: "72px",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ color: "#a97732", fontSize: 24, letterSpacing: "0.18em" }}>
            KANTI SECONDARY SCHOOL · BUTWAL
          </div>
          <div style={{ fontSize: 76, fontWeight: 700 }}>Kanti Science Club</div>
          <div style={{ color: "#526763", fontSize: 34 }}>
            A shared effort to bring everyone closer to science.
          </div>
        </div>
      </div>
    ),
    size,
  );
}
