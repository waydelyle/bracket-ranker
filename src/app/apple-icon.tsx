import { ImageResponse } from "next/og";

/**
 * Apple touch icon.
 *
 * iOS ignores SVG favicons, so a home-screen bookmark falls back to a page
 * screenshot without a real PNG here. Generated rather than committed so it
 * stays in step with `icon.svg`.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0b14",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 32 32"
          fill="none"
          stroke="#f59e0b"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <path d="M7.5 9.5h4.5M7.5 14.5h4.5M7.5 17.5h4.5M7.5 22.5h4.5" />
          <path d="M13.5 9.5v5M13.5 17.5v5" />
          <path d="M13.5 12h4M13.5 20h4" />
          <path d="M19 12v8" />
          <path d="M19 16h5" />
          <circle cx="25.5" cy="16" r="1.6" fill="#fbbf24" stroke="none" />
        </svg>
      </div>
    ),
    size,
  );
}
