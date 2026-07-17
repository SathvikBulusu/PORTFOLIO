/* src/components/InfluencesDiamond.jsx
   Simple, bulletproof — no gsap, no closedRef races, plain React.
*/

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

const QUOTES = [
  {
    show: "Sons of Anarchy",
    quote: "It's hard not to hate. People, things, institutions. When they break your spirit and take pleasure in watching you bleed, hate is the only feeling that makes sense.",
    attr: "— Jax Teller",
  },
  { show: "Billions",     quote: "Starvation makes the brain run faster.", attr: "" },
  { show: "Add a quote",  quote: "Something that moved you.", attr: "" },
  { show: "Add a quote",  quote: "A line you carry with you.", attr: "" },
  { show: "Add a quote",  quote: "Words that changed how you see things.", attr: "" },
];

function Gem() {
  const g = useRef();
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y -= dt * 0.55;
  });
  return (
    <group ref={g} rotation={[0.15, 0, 0]}>
      <mesh position={[0, 0.575, 0]}>
        <coneGeometry args={[0.62, 1.15, 5]} />
        <meshStandardMaterial color="#0A0A0B" metalness={0.75} roughness={0.30} flatShading />
      </mesh>
      <mesh position={[0, -0.575, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.62, 1.15, 5]} />
        <meshStandardMaterial color="#0A0A0B" metalness={0.75} roughness={0.30} flatShading />
      </mesh>
    </group>
  );
}

/* Absolute-positioned quotes — mapped over a fullscreen dark overlay */
const POSITIONS = [
  { left: "8%",  top: "16%" },
  { left: "56%", top: "12%" },
  { left: "12%", top: "48%" },
  { left: "58%", top: "52%" },
  { left: "10%", top: "78%" },
];

function Overlay({ onClose }) {
  /* Body lock, restore on unmount */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      onClick={onClose}          /* click anywhere on backdrop closes */
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "#020204",
        overflow: "hidden",
        animation: "infFade 0.35s ease-out",
      }}
    >
      <style>{`@keyframes infFade { from { opacity: 0 } to { opacity: 1 } }`}</style>

      {/* Close button — event stops propagation so backdrop doesn't
         re-trigger. Very explicit hit area. */}
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
        style={{
          position: "fixed", top: 24, right: 32, zIndex: 10001,
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 100,
          width: 44, height: 44,
          cursor: "pointer",
          color: "#F9F9F7",
          fontSize: "1.15rem",
          fontFamily: ARRAY,
          display: "flex", alignItems: "center", justifyContent: "center",
          lineHeight: 1,
        }}
      >
        ✕
      </button>

      <div style={{
        position: "fixed", top: 32, left: 40, zIndex: 10000,
        fontFamily: MONO, fontSize: ".56rem", letterSpacing: ".26em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.4)",
        fontWeight: 700, pointerEvents: "none",
      }}>
        Influences
      </div>

      {QUOTES.map((item, i) => (
        <div
          key={i}
          onClick={e => e.stopPropagation()}   /* clicking quote doesn't close */
          style={{
            position: "absolute",
            left: POSITIONS[i % POSITIONS.length].left,
            top:  POSITIONS[i % POSITIONS.length].top,
            maxWidth: 460, zIndex: 5,
          }}
        >
          <div style={{
            fontFamily: MONO, fontSize: ".5rem", letterSpacing: ".22em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.42)",
            marginBottom: 12, fontWeight: 700,
          }}>
            {item.show}
          </div>
          <div style={{
            fontFamily: NIPPO, fontWeight: 300,
            fontSize: "clamp(.92rem,1.35vw,1.05rem)",
            color: "rgba(255,255,255,0.8)", lineHeight: 1.85,
          }}>
            "{item.quote}"
          </div>
          {item.attr && (
            <div style={{
              fontFamily: MONO, fontSize: ".46rem", letterSpacing: ".16em",
              color: "rgba(255,255,255,0.4)", marginTop: 12,
            }}>
              {item.attr}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function InfluencesDiamond() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-cursor="Influences"
        style={{
          background: "none", border: "none", padding: 0, margin: 0,
          cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          transition: "transform .3s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 45 }}
          style={{ width: 100, height: 130, display: "block", pointerEvents: "none" }}
          gl={{ alpha: true, antialias: true }}
          dpr={[1, 2]}
        >
          <ambientLight intensity={0.6} />
          <pointLight position={[3, 2.5, 3]}   intensity={7} color="#ffffff" />
          <pointLight position={[-3, -1, 2.5]} intensity={3} color="#f0efe8" />
          <pointLight position={[0, 3, -2]}    intensity={2} color="#ffffff" />
          <Gem />
        </Canvas>
        <span style={{
          fontFamily: MONO, fontSize: ".5rem", letterSpacing: ".24em",
          textTransform: "uppercase", color: "#666", fontWeight: 700,
        }}>
          Influences
        </span>
      </button>

      {open && <Overlay onClose={() => setOpen(false)} />}
    </>
  );
}