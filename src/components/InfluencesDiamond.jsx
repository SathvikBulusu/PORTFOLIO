/* src/components/InfluencesDiamond.jsx */

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { getLenis } from "./LenisProvider";

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

const QUOTES = [
  {
    show: "Sons of Anarchy",
    quote: "It's hard not to hate. People, things, institutions. When they break your spirit and take pleasure in watching you bleed, hate is the only feeling that makes sense. But I know what hate does to a man. Tears him apart. Turns him into something he's not. Something he promised himself he'd never become.",
    attr: "— Jax Teller",
  },
  { show: "Billions", quote: "Starvation makes the brain run faster.", attr: "" },
  { show: "Add a quote", quote: "Something that moved you.", attr: "" },
  { show: "Add a quote", quote: "A line you carry with you.", attr: "" },
  { show: "Add a quote", quote: "Words that changed how you see things.", attr: "" },
];

/* ── Colors — matches site aesthetic: black + charcoal, no color ── */
const GEM_COLOR = "#0A0A0B";

/* ── One clean bipyramid, single group rotation ──
   The trick to "every facet visible" is:
   1. Low-poly cones (only 4–5 sides) so facets are BIG, not smooth
   2. Rotate on Y axis so the vertical-belt facets sweep past camera
   3. Slight tilt on Z so tips angle toward viewer, revealing top/bottom faces
   4. Multiple lights from opposing angles so light-dark transitions happen
      as each facet turns through them
*/
function Gem() {
  const groupRef = useRef();

  const geo = useMemo(() => {
    /* 5-sided bipyramid — belt has 5 wide facets. Odd number so no two
       facets face camera at the same time — always dynamic profile. */
    const top = new THREE.ConeGeometry(0.62, 1.15, 5);
    top.translate(0, 0.575, 0);
    const bot = new THREE.ConeGeometry(0.62, 1.15, 5);
    bot.rotateZ(Math.PI);
    bot.translate(0, -0.575, 0);
    return { top, bot };
  }, []);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color:     new THREE.Color(GEM_COLOR),
    metalness: 0.75,
    roughness: 0.30,
    flatShading: true,     /* CRITICAL — makes each facet a solid tone */
  }), []);

  /* Wireframe edge overlay — subtle white lines along facet borders.
     Ensures every edge is visible even in dim spots during rotation. */
  const edgeGeo = useMemo(() => {
    const merged = new THREE.BufferGeometry();
    return {
      top: new THREE.EdgesGeometry(geo.top),
      bot: new THREE.EdgesGeometry(geo.bot),
    };
  }, [geo]);

  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({
    color: "#333333", transparent: true, opacity: 0.55,
  }), []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    /* Clockwise from front view = negative Y rotation.
       Steady speed — no oscillation, no acceleration. */
    groupRef.current.rotation.y -= delta * 0.55;
  });

  return (
    /* Tilted forward slightly so both top & bottom halves visible */
    <group ref={groupRef} rotation={[0.15, 0, 0]}>
      <mesh geometry={geo.top} material={mat} />
      <mesh geometry={geo.bot} material={mat} />
      <lineSegments geometry={edgeGeo.top} material={edgeMat} />
      <lineSegments geometry={edgeGeo.bot} material={edgeMat} />
    </group>
  );
}

function GemCanvas() {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.2], fov: 45 }}
      style={{ width: 100, height: 130, display: "block" }}
      gl={{ alpha: true, antialias: true }}
    >
      {/* Monochrome lighting — white key + soft warm-white fill, no color casts */}
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 2.5, 3]}   intensity={7}   color="#ffffff" />
      <pointLight position={[-3, -1, 2.5]} intensity={3}   color="#f0efe8" />
      <pointLight position={[0, 3, -2]}    intensity={2}   color="#ffffff" />
      <Gem />
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

export default function InfluencesDiamond() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        data-cursor="Influences"
        style={{
          cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
          transition: "transform .3s ease",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; }}
      >
        <GemCanvas />
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