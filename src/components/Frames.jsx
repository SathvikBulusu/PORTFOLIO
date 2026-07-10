/* src/components/Frames.jsx */

import { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./LenisProvider";

gsap.registerPlugin(ScrollTrigger);

const photoGlob = import.meta.glob(
  "../photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true }
);
const ALL_PHOTOS = Object.values(photoGlob).map(m => m.default);

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

/* ── Photo categories ── */
const CATEGORIES = [
  { id: "buildings", label: "Buildings" },
  { id: "objects",   label: "Objects"   },
  { id: "nature",    label: "Nature"    },
  { id: "people",    label: "People"    },
  { id: "scenes",    label: "Scenes"    },
];

/* ── Influences — scaffold, user fills in quotes ── */
const INFLUENCES = {
  series: [
    {
      show: "Sons of Anarchy",
      quote:
        "It's hard not to hate. People, things, Institutions. When they break your spirit and take pleasure in watching you bleed... hate is the only feeling that makes sense. But I know what hate does to a man. Tears him apart. Turns him into something he's not. Something he promised he'd never become.",
      attr: "— Jax Teller",
    },
    {
      show: "Billions",
      quote: "Starvation makes the brain run faster.",
      attr: "",
    },
    {
      show: "Add your series",
      quote: "Add a quote that stayed with you.",
      attr: "— Character",
    },
  ],
  movies: [
    { show: "Add your film",   quote: "A line you won't forget.", attr: "" },
    { show: "Add another",     quote: "Something that changed how you see things.", attr: "" },
  ],
  anime: [
    { show: "Add your anime",  quote: "A moment that hit different.", attr: "" },
    { show: "Add another",     quote: "Something that stayed.", attr: "" },
  ],
};

/* ── Stable snow flake data ── */
const SNOW = Array.from({ length: 36 }, (_, i) => ({
  left:  `${(i * 2.78 + (i % 4) * 5) % 100}%`,
  size:   1.4 + (i % 3) * 0.7,
  dur:   `${4 + i % 5}s`,
  delay: `${(i * 0.27) % 4.2}s`,
  drift: `${(i % 2 ? 1 : -1) * (5 + i % 12)}px`,
  op:     0.18 + (i % 5) * 0.08,
}));

const SNOW_CSS = `
@keyframes sf {
  0%   { transform:translateY(-12px) translateX(0); opacity:0; }
  6%   { opacity:var(--op); }
  94%  { opacity:var(--op); }
  100% { transform:translateY(110vh) translateX(var(--drift)); opacity:0; }
}
.sf {
  position:absolute; border-radius:50%; background:#fff; top:0;
  animation: sf var(--dur) var(--delay) linear infinite;
}
`;

function SnowLayer() {
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", pointerEvents:"none", zIndex:0 }}>
      <style>{SNOW_CSS}</style>
      {SNOW.map((f, i) => (
        <div key={i} className="sf" style={{
          left: f.left, width: f.size, height: f.size,
          "--dur": f.dur, "--delay": f.delay,
          "--drift": f.drift, "--op": f.op,
        }} />
      ))}
    </div>
  );
}

/* ─────────────────── 3-D mini diamond for Influences ─────────────────── */
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

function MiniDiamond({ color, hovered }) {
  const grp = useRef();
  const { top, bot } = useBipyramid(0.5, 0.7);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), metalness: 0.65, roughness: 0.18,
    flatShading: true,
  }), [color]);

  useFrame((_, d) => {
    if (!grp.current) return;
    grp.current.rotation.y += (hovered ? 0.9 : 0.4) * d;
  });

  return (
    <group ref={grp}>
      <mesh geometry={top} material={mat} />
      <mesh geometry={bot} material={mat} />
    </group>
  );
}

function DiamondOrb({ color, hovered }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 2.3], fov: 44 }}
      style={{ width: 110, height: 130, display: "block" }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[2, 2, 3]}  intensity={5} color="#fff" />
      <pointLight position={[-2,-1, 2]} intensity={2} color={color} />
      <MiniDiamond color={color} hovered={hovered} />
    </Canvas>
  );
}

/* ─────────────────── Photo overlay ─────────────────── */
function PhotoOverlay({ category, onClose }) {
  const ref = useRef();

  useEffect(() => {
    getLenis()?.stop();
    document.body.style.overflow = "hidden";
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" });
    return () => { document.body.style.overflow = ""; getLenis()?.start(); };
  }, []);

  const close = () =>
    gsap.to(ref.current, { opacity: 0, duration: 0.28, ease: "power2.in", onComplete: onClose });

  return (
    <div ref={ref} style={{
      position: "fixed", inset: 0, zIndex: 990,
      background: "rgba(4,4,6,0.97)",
      display: "flex", flexDirection: "column", overflow: "hidden",
    }}>
      <SnowLayer />

      {/* Header */}
      <div style={{
        position: "relative", zIndex: 2,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "28px 44px",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: ".52rem", letterSpacing: ".24em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
            Frames / Photography
          </div>
          <div style={{ fontFamily: ARRAY, fontSize: "1.8rem", color: "#F9F9F7", letterSpacing: ".04em", textTransform: "uppercase" }}>
            {category.label}
          </div>
        </div>
        <button onClick={close} style={{ background: "none", border: "none", cursor: "pointer", fontFamily: ARRAY, fontSize: "1.4rem", color: "#F9F9F7", lineHeight: 1 }}>
          ✕
        </button>
      </div>

      {/* 3-column photo grid — vertically scrollable */}
      <div style={{
        position: "relative", zIndex: 2,
        flex: 1, overflowY: "auto",
        padding: "28px 44px 44px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        alignContent: "start",
      }}>
        {ALL_PHOTOS.map((src, i) => (
          <div key={i} style={{ aspectRatio: "4/3", overflow: "hidden", background: "#111" }}>
            <img src={src} alt="" draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                opacity: 0.88, transition: "opacity .2s, transform .4s" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1.04)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "0.88"; e.currentTarget.style.transform = ""; }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────── Quotes overlay (Influences) ─────────────────── */
const POSITIONS = [
  { left: "7%",  top: "12%" },
  { left: "50%", top: "8%"  },
  { left: "18%", top: "54%" },
  { left: "55%", top: "58%" },
  { left: "6%",  top: "80%" },
  { left: "48%", top: "78%" },
];

function QuotesOverlay({ type, onClose }) {
  const ref = useRef();

  useEffect(() => {
    getLenis()?.stop();
    document.body.style.overflow = "hidden";
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    return () => { document.body.style.overflow = ""; getLenis()?.start(); };
  }, []);

  const close = () =>
    gsap.to(ref.current, { opacity: 0, duration: 0.3, ease: "power2.in", onComplete: onClose });

  const data = INFLUENCES[type] || [];

  return (
    <div ref={ref} style={{
      position: "fixed", inset: 0, zIndex: 995,
      background: "#020204", overflow: "hidden",
    }}>
      <SnowLayer />

      <button onClick={close} style={{
        position: "fixed", top: 28, right: 40, zIndex: 2,
        background: "none", border: "none", cursor: "pointer",
        fontFamily: ARRAY, fontSize: "1.4rem", color: "rgba(255,255,255,0.5)",
      }}>✕</button>

      {/* Type label */}
      <div style={{
        position: "absolute", top: 36, left: 44, zIndex: 2,
        fontFamily: MONO, fontSize: ".54rem", letterSpacing: ".26em",
        textTransform: "uppercase", color: "rgba(255,255,255,0.3)",
      }}>
        Influences / {type}
      </div>

      {/* Floating quotes */}
      {data.map((item, i) => (
        <div key={i} style={{
          position: "absolute",
          left: POSITIONS[i % POSITIONS.length].left,
          top:  POSITIONS[i % POSITIONS.length].top,
          maxWidth: 420, zIndex: 1,
        }}>
          <div style={{ fontFamily: MONO, fontSize: ".48rem", letterSpacing: ".2em", textTransform: "uppercase", color: "rgba(255,255,255,0.28)", marginBottom: 10 }}>
            {item.show}
          </div>
          <div style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: "clamp(.88rem,1.3vw,1rem)", color: "rgba(255,255,255,0.7)", lineHeight: 1.85 }}>
            "{item.quote}"
          </div>
          {item.attr && (
            <div style={{ fontFamily: MONO, fontSize: ".44rem", letterSpacing: ".14em", color: "rgba(255,255,255,0.28)", marginTop: 10 }}>
              {item.attr}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────── Main component ─────────────────── */
export default function Frames() {
  const [activePhoto,     setActivePhoto]     = useState(null);
  const [activeInfluence, setActiveInfluence] = useState(null);
  const [hoveredInf,      setHoveredInf]      = useState(null);

  const sectionRef  = useRef(null);
  const itemRefs    = useRef([]);
  const influenceRef = useRef(null);

  /* GSAP reveal for category list items */
  useEffect(() => {
    const ctx = gsap.context(() => {
      itemRefs.current.forEach((el, i) => {
        if (!el) return;
        gsap.fromTo(el,
          { opacity: 0, x: -48 },
          {
            opacity: 1, x: 0, duration: 0.65, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 84%" },
            delay: i * 0.055,
          }
        );
      });
      if (influenceRef.current) {
        gsap.fromTo(influenceRef.current,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: influenceRef.current, start: "top 78%" } }
        );
      }
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="frames"
      style={{ background: "#F9F9F7", paddingTop: 120, borderTop: "1px solid #ECEAE4" }}
    >
      {/* ── Section heading ── */}
      <div style={{ padding: "0 56px", marginBottom: 40 }}>
        <div style={{ fontFamily: MONO, fontSize: ".62rem", letterSpacing: ".28em", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>
          Photography
        </div>
        <div style={{ fontFamily: ARRAY, fontSize: "clamp(3rem,7vw,5.5rem)", letterSpacing: ".04em", textTransform: "uppercase", color: "#0A0A0B", lineHeight: 1 }}>
          Frames
        </div>
      </div>

      {/* ── Category list — big, animated, clickable ── */}
      <div style={{ padding: "0 56px 80px", borderBottom: "1px solid #ECEAE4" }}>
        {CATEGORIES.map((cat, i) => (
          <div
            key={cat.id}
            ref={el => { itemRefs.current[i] = el; }}
            onClick={() => setActivePhoto(cat)}
            data-cursor="Open"
            style={{
              display: "flex", alignItems: "baseline", gap: 28,
              padding: "16px 0",
              borderBottom: i < CATEGORIES.length - 1 ? "1px solid rgba(10,10,11,0.06)" : "none",
              cursor: "pointer", opacity: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.querySelector(".cl").style.color = "#9333EA";
              e.currentTarget.querySelector(".cn").style.color = "#9333EA";
              e.currentTarget.querySelector(".cv").style.opacity = "1";
            }}
            onMouseLeave={e => {
              e.currentTarget.querySelector(".cl").style.color = "#0A0A0B";
              e.currentTarget.querySelector(".cn").style.color = "#bbb";
              e.currentTarget.querySelector(".cv").style.opacity = "0";
            }}
          >
            <span className="cn" style={{ fontFamily: MONO, fontSize: ".52rem", letterSpacing: ".2em", color: "#bbb", flexShrink: 0, width: 26, transition: "color .2s" }}>
              0{i + 1}
            </span>
            <span className="cl" style={{ fontFamily: ARRAY, fontSize: "clamp(2.6rem,5.5vw,4.8rem)", letterSpacing: ".03em", textTransform: "uppercase", color: "#0A0A0B", lineHeight: 1, transition: "color .2s" }}>
              {cat.label}
            </span>
            <span className="cv" style={{ marginLeft: "auto", fontFamily: MONO, fontSize: ".5rem", letterSpacing: ".16em", textTransform: "uppercase", color: "#9333EA", alignSelf: "center", opacity: 0, transition: "opacity .2s" }}>
              View →
            </span>
          </div>
        ))}
      </div>

      {/* ── Influences ── */}
      <div ref={influenceRef} style={{ padding: "80px 56px 100px", opacity: 0 }}>
        <div style={{ fontFamily: MONO, fontSize: ".62rem", letterSpacing: ".28em", textTransform: "uppercase", color: "#555", marginBottom: 12 }}>
          What I Watch
        </div>
        <div style={{ fontFamily: ARRAY, fontSize: "clamp(2rem,3.5vw,3rem)", letterSpacing: ".04em", textTransform: "uppercase", color: "#0A0A0B", lineHeight: 1, marginBottom: 56 }}>
          Influences
        </div>

        <div style={{ display: "flex", gap: 52, alignItems: "flex-end" }}>
          {[
            { type: "series", label: "Series", color: "#E0B888" },
            { type: "movies", label: "Movies", color: "#7FA0E8" },
            { type: "anime",  label: "Anime",  color: "#D4A855" },
          ].map(inf => (
            <div
              key={inf.type}
              onClick={() => setActiveInfluence(inf.type)}
              onMouseEnter={() => setHoveredInf(inf.type)}
              onMouseLeave={() => setHoveredInf(null)}
              data-cursor={inf.label}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                cursor: "pointer",
                transform: hoveredInf === inf.type ? "translateY(-6px)" : "translateY(0)",
                transition: "transform .3s ease",
                filter: hoveredInf === inf.type ? `drop-shadow(0 0 14px ${inf.color}66)` : "none",
              }}
            >
              <DiamondOrb color={inf.color} hovered={hoveredInf === inf.type} />
              <span style={{ fontFamily: MONO, fontSize: ".52rem", letterSpacing: ".2em", textTransform: "uppercase", color: "#555" }}>
                {inf.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Overlays */}
      {activePhoto && (
        <PhotoOverlay category={activePhoto} onClose={() => setActivePhoto(null)} />
      )}
      {activeInfluence && (
        <QuotesOverlay type={activeInfluence} onClose={() => setActiveInfluence(null)} />
      )}
    </section>
  );
}