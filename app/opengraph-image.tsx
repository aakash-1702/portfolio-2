import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(60% 70% at 80% 0%, rgba(255,107,61,0.26), transparent 70%), radial-gradient(40% 50% at 0% 100%, rgba(124,200,255,0.14), transparent 70%), #07080c",
          color: "#eef1f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: "#a3abbc" }}>
          <div style={{ width: 14, height: 14, borderRadius: 99, background: "#ff6b3d" }} />
          akashdwivedi.me
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -4, lineHeight: 1 }}>I build the backend</div>
          <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: -4, lineHeight: 1.1, display: "flex" }}>
            that&nbsp;<span style={{ color: "#ff6b3d" }}>AI agents</span>&nbsp;run on.
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#a3abbc" }}>
          <span>{site.name} · {site.role}</span>
          <span style={{ color: "#ffb84d" }}>MCP · tool calling · Postgres · queues</span>
        </div>
      </div>
    ),
    size,
  );
}
