/* src/components/LocationBox.jsx
   Dot-matrix world map with India highlighted (pulsing purple dot).
   Click India dot → purple popup message.
   Same pixel aesthetic as the SATHVIK particle text — programmatically
   drawn dot grid where dots are ON for land, OFF for ocean.
*/

import { useState, useRef, useEffect } from "react";

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

/* ─── World map, encoded as a compact ASCII grid ───
   . = ocean (no dot)   # = land (dot)
   65 cols × 24 rows.  Simplified continent silhouettes.        */
const MAP = [
"..................................................................",
"...####...####################........................############",
"..######.######################...................###..#########..",
"..######.######################..................####.###########",
"...####..######################..............................####.",
"....##....########################................###.......####..",
".....#......###############..###...................#####...####...",
"..............#######........###......#####..........########.....",
"................######......#####...###############..######.......",
".................#####.....#######..###################...........",
"..................####....###########..###############............",
"...................###...####..###########..##########............",
"...................###...####..##################.##..............",
"...................###....##...#################..................",
"....................##....#....################...................",
"....................##.........###############....................",
"....................##..........############......................",
".....................#..........#########.........................",
".....................#............######..........................",
"...................................####...........................",
"....................................##............................",
"....................................#.............................",
"..................................................................",
"..................................................................",
];

/* India location on the map grid (col, row), fine-tuned to sit
   inside the continent-Asia landmass drawn above. */
const INDIA = { col: 46, row: 11 };

export default function LocationBox() {
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  /* Close popup when clicking outside */
  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const cols = MAP[0].length;
  const rows = MAP.length;

  /* ── Sizing ──
     Dot 3px, gap 3px → each cell is 6px.
     Total width  = 65 * 6 = 390px.
     Total height = 24 * 6 = 144px. */
  const CELL = 6;
  const DOT  = 3;
  const W = cols * CELL;
  const H = rows * CELL;

  return (
    <div ref={boxRef} style={{ position: "relative", display: "inline-block" }}>
      {/* ─── The pixel map ─── */}
      <div
        style={{
          position: "relative",
          width: W,
          height: H,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
          gridTemplateRows:    `repeat(${rows}, ${CELL}px)`,
          padding: 8,
          background: "rgba(10,10,11,0.03)",
          border: "1px solid rgba(10,10,11,0.06)",
          borderRadius: 8,
          boxSizing: "content-box",
        }}
      >
        {MAP.flatMap((row, r) =>
          row.split("").map((ch, c) => {
            if (ch !== "#") return <div key={`${r}-${c}`} />;
            const isIndia = c === INDIA.col && r === INDIA.row;
            return (
              <div
                key={`${r}-${c}`}
                style={{
                  width: DOT, height: DOT, borderRadius: "50%",
                  background: isIndia ? "#9333EA" : "#0A0A0B",
                  opacity: isIndia ? 1 : 0.4,
                  margin: "auto",
                  boxShadow: isIndia ? "0 0 8px #9333EA, 0 0 4px #9333EA" : "none",
                  cursor: isIndia ? "pointer" : "default",
                  transition: "transform .2s",
                  zIndex: isIndia ? 2 : 1,
                }}
                onClick={isIndia ? () => setOpen(o => !o) : undefined}
              />
            );
          })
        )}

        {/* India pulse ring — sits on the same grid cell as the India dot */}
        <div style={{
          position: "absolute",
          left: 8 + INDIA.col * CELL + (CELL - DOT) / 2 - 3,
          top:  8 + INDIA.row * CELL + (CELL - DOT) / 2 - 3,
          width: DOT + 6, height: DOT + 6,
          borderRadius: "50%",
          background: "#9333EA",
          opacity: 0.35,
          animation: "indPulse 2s ease-in-out infinite",
          pointerEvents: "none",
        }} />
        <style>{`
          @keyframes indPulse {
            0%,100% { transform: scale(1);   opacity: 0.35; }
            50%     { transform: scale(2.4); opacity: 0;    }
          }
        `}</style>
      </div>

      {/* ─── Purple popup on India click ─── */}
      {open && (
        <div style={{
          position: "absolute",
          bottom: "calc(100% + 12px)",
          left: 8 + INDIA.col * CELL - 100,
          zIndex: 10,
          background: "#0A0A0B",
          border: "1px solid #9333EA",
          borderRadius: 10,
          padding: "12px 16px",
          minWidth: 220,
          boxShadow: "0 12px 32px rgba(147,51,234,0.30), 0 6px 16px rgba(0,0,0,0.3)",
        }}>
          <div style={{
            fontFamily: ARRAY, fontSize: ".85rem", letterSpacing: ".06em",
            textTransform: "uppercase", color: "#F9F9F7",
            fontWeight: 700, marginBottom: 6,
          }}>
            🇮🇳 Bangalore, India
          </div>
          <div style={{
            fontFamily: NIPPO, fontWeight: 300, fontSize: ".78rem",
            color: "#c8b5e8", lineHeight: 1.5,
          }}>
            If you're in Bangalore, hit me up. Let's grab coffee.
          </div>

          {/* Popup arrow pointing to the dot */}
          <div style={{
            position: "absolute",
            top: "100%", left: 100,
            width: 0, height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid #9333EA",
          }} />
        </div>
      )}
    </div>
  );
}