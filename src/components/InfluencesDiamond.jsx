/* src/components/InfluencesDiamond.jsx
   A single 3D bipyramid diamond that lives in the Hero.
   Colors match the OrbMenu palette exactly. Spins clockwise forever.
   Click → fullscreen quotes overlay.
*/

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { getLenis } from "./LenisProvider";

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

/* ═══════════════════════════════════════════════════════════════
   QUOTES — mixed pool from every show/film/anime that motivates you.
   Fill this in; scaffold entries included so it never renders empty.
═══════════════════════════════════════════════════════════════ */
const QUOTES = [
  {
    show: "Sons of Anarchy",
    quote: "It's hard not to hate. People, things, institutions. When they break your spirit and take pleasure in watching you bleed, hate is the only feeling that makes sense. But I know what hate does to a man. Tears him apart. Turns him into something he's not. Something he promised himself he'd never become.",
    attr: "— Jax Teller",
  },
  {
    show: "Billions",
    quote: "Starvation makes the brain run faster.",
    attr: "",
  },
  { show: "Add a quote", quote: "Something that moved you.", attr: "" },
  { show: "Add a quote", quote: "A line you carry with you.", attr: "" },
  { show: "Add a quote", quote: "Words that changed how you see things.", attr: "" },
];

/* ── Colors — brighter, higher-contrast; readable against warm-white bg ── */
const OUTER = "#0A0A0B";   /* near-black outer shell — reads on warm white */
const INNER = "#4C6FE0";   /* vivid periwinkle — pops against black shell */

/* ── Bipyramid geometry (4-sided cones joined at the belt) ── */
function useBipyramid(r, h) {
  return useMemo(() => {
    const top = new THREE.ConeGeometry(r, h, 4);
    top.translate(0, h / 2, 0);
    const bot = new THREE.ConeGeometry(r, h, 4);
    bot.rotateZ(Math.PI);
    bot.translate(0, -h / 2, 0);
    return { top, bot };
  }, [r, h]);
}

/* ── Diamond mesh: outer larger peach shell + inner smaller blue core ──
   Both rotate clockwise. Inner spins slightly faster for parallax. */
function DiamondMesh({ hovered }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const { top: outerTop, bot: outerBot } = useBipyramid(0.60, 1.00);
  const { top: innerTop, bot: innerBot } = useBipyramid(0.28, 0.55);

  const outerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(OUTER), metalness: 0.85, roughness: 0.15,
    flatShading: true,
  }), []);

  const innerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(INNER), metalness: 0.75, roughness: 0.12,
    emissive: new THREE.Color(INNER), emissiveIntensity: 0.30,
    flatShading: true,
  }), []);

  useFrame((_, d) => {
    const boost = hovered ? 1.55 : 1;
    /* Clockwise = negative Y rotation from front view */
    if (outerRef.current) outerRef.current.rotation.y -= 0.55 * d * boost;
    if (innerRef.current) innerRef.current.rotation.y -= 0.82 * d * boost;
  });

  return (
    <>
      <group ref={outerRef}>
        <mesh geometry={outerTop} material={outerMat} />
        <mesh geometry={outerBot} material={outerMat} />
      </group>
      <group ref={innerRef}>
        <mesh geometry={innerTop} material={innerMat} />
        <mesh geometry={innerBot} material={innerMat} />
      </group>
    </>
  );
}

function DiamondCanvas({ hovered }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 42 }}
      style={{ width: 140, height: 180, display: "block" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.75} />
      <pointLight position={[2.5, 2, 3]}  intensity={6.5} color="#ffffff" />
      <pointLight position={[-2, -1, 2]}  intensity={3.5} color={INNER} />
      <pointLight position={[0, 3, -1]}   intensity={2.0} color="#ffd9b3" />
      <DiamondMesh hovered={hovered} />
    </Canvas>
  );
}

/* ── Fullscreen quotes overlay ── */
const POSITIONS = [
  { left: "8%",  top: "14%" },
  { left: "52%", top: "10%" },
  { left: "14%", top: "48%" },
  { left: "56%", top: "52%" },
  { left: "10%", top: "78%" },
  { left: "50%", top: "78%" },
];

function QuotesOverlay({ onClose }) {
  const ref = useRef();

  useEffect(() => {
    getLenis()?.stop();
    document.body.style.overflow = "hidden";
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    return () => { document.body.style.overflow = ""; getLenis()?.start(); };
  }, []);

  const close = () =>
    gsap.to(ref.current, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: onClose });

  return (
    <div ref={ref} style={{
      position: "fixed", inset: 0, zIndex: 995,
      background: "#020204", overflow: "hidden",
    }}>
      <button onClick={close} style={{
        position: "fixed", top: 28, right: 40, zIndex: 2,
        background: "none", border: "none", cursor: "pointer",
        fontFamily: ARRAY, fontSize: "1.4rem", color: "rgba(255,255,255,0.6)",
      }}>✕</button>

      <div style={{
        position: "absolute", top: 36, left: 44, zIndex: 2,
        fontFamily: MONO, fontSize: ".56rem", letterSpacing: ".26em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 700,
      }}>
        Influences
      </div>

      {QUOTES.map((item, i) => (
        <div key={i} style={{
          position: "absolute",
          left: POSITIONS[i % POSITIONS.length].left,
          top:  POSITIONS[i % POSITIONS.length].top,
          maxWidth: 460, zIndex: 1,
        }}>
          <div style={{ fontFamily: MONO, fontSize: ".5rem", letterSpacing: ".22em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 12, fontWeight: 700 }}>
            {item.show}
          </div>
          <div style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: "clamp(.92rem,1.35vw,1.05rem)", color: "rgba(255,255,255,0.78)", lineHeight: 1.85 }}>
            "{item.quote}"
          </div>
          {item.attr && (
            <div style={{ fontFamily: MONO, fontSize: ".46rem", letterSpacing: ".16em", color: "rgba(255,255,255,0.35)", marginTop: 12 }}>
              {item.attr}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Public component — the Hero uses <InfluencesDiamond />
───────────────────────────────────────────────────────────── */
export default function InfluencesDiamond() {
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-cursor="Influences"
        style={{
          cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          transform: hovered ? "translateY(-4px)" : "translateY(0)",
          transition: "transform .3s ease",
          filter: hovered
            ? `drop-shadow(0 0 22px ${INNER}88)`
            : "drop-shadow(0 6px 16px rgba(0,0,0,0.08))",
        }}
      >
        <DiamondCanvas hovered={hovered} />
        <span style={{
          fontFamily: MONO, fontSize: ".5rem", letterSpacing: ".24em",
          textTransform: "uppercase", color: "#666", fontWeight: 700,
        }}>
          Influences
        </span>
      </div>

      {open && <QuotesOverlay onClose={() => setOpen(false)} />}
    </>
  );
}