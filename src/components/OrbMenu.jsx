/* src/components/OrbMenu.jsx */

import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const NAV_ITEMS = [
  { label: "Work",       href: "#work" },
  { label: "Thoughts",   href: "#writing" },
  { label: "Projects",   href: "#projects" },
  { label: "Frames",     href: "#frames" },
  { label: "Movie List", href: "#movies" },
];
const SOCIALS = [
  { l: "LinkedIn", h: "https://linkedin.com/in/sathvikbulusu" },
  { l: "GitHub",   h: "https://github.com/yourusername" },
  { l: "Email",    h: "mailto:your@email.com" },
];

/* ═══════════════════════════════════════════════════════════════
   STRUCTURE — 5 real 3D gem-cut diamonds in a horizontal row:
   [BIG]—[small]—[tiny + inner]—[small]—[BIG]

   Each diamond is a true bipyramid (two 4-sided cones joined at a
   belt) — genuine 3D volume with facets, not a flat extruded plane.

   PHYSICS — continuous one-direction rotation, never oscillating:
   - Outer pair: locked together, same speed, same direction forever
   - Inner pair: opposite direction from outer, but DIFFERENT speeds
     from each other so they drift out of sync and never re-align
   - Center: rotationally fixed; only its nested inner diamond spins
═══════════════════════════════════════════════════════════════ */

/* ── SIZE ── */
const ORB_CANVAS = 175;
const ORB_CAM_Z  = 5.4;

/* ── DIAMOND DIMENSIONS (bipyramid: radius = belt width, halfHeight = apex distance) ── */
const PINK_R = 0.30;  const PINK_H = 1.05;
const BLUE_R = 0.24;  const BLUE_H = 0.50;
const GOLD_R = 0.13;  const GOLD_H = 0.16;
const GOLD_INNER_R = 0.06; const GOLD_INNER_H = 0.07;

/* ── POSITIONS along X (generous gaps — real 3D volume needs room) ── */
const X_PINK = 1.30;
const X_BLUE = 0.62;
const X_GOLD = 0;

/* ── CONTINUOUS ROTATION SPEEDS (rad/sec) — never bounces, always spins ── */
const SPEED_PINK   = 0.65;    /* both outer diamonds — locked together   */
const SPEED_BLUE_L = -0.50;   /* inner left  — opposite dir from pink    */
const SPEED_BLUE_R = -0.78;   /* inner right — different speed than left,
                                  so the two never realign in phase      */

/* ── COLORS — matched to the reference orb palette ── */
const COL_OUTER = "#E0B888";   /* warm peach/tan  */
const COL_INNER = "#7FA0E8";   /* periwinkle blue */
const COL_GOLD  = "#D4A855";   /* gold accent, center */
const COL_GOLD_INNER = "#20203A";

/* ─── Bipyramid builder — two 4-sided cones joined at a shared belt ───
   This is a REAL 3D gem shape (like the diamond emoji), not a flat plane. */
function useBipyramidGeos(radius, halfHeight) {
  return useMemo(() => {
    const top = new THREE.ConeGeometry(radius, halfHeight, 4);
    top.translate(0, halfHeight / 2, 0);       /* apex at +H, belt at y=0 */

    const bot = new THREE.ConeGeometry(radius, halfHeight, 4);
    bot.rotateZ(Math.PI);                       /* flip apex to point down */
    bot.translate(0, -halfHeight / 2, 0);        /* apex at -H, belt at y=0 */

    return { top, bot };
  }, [radius, halfHeight]);
}

/* ── One spinning diamond (continuous rotation, never stops/bounces) ── */
function SpinDiamond({ x, radius, halfHeight, color, speed, active }) {
  const grpRef = useRef();
  const { top, bot } = useBipyramidGeos(radius, halfHeight);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    metalness: 0.5, roughness: 0.22,
    flatShading: true,           /* crisp facet edges, real gem look */
  }), [color]);

  useFrame((_, delta) => {
    if (!grpRef.current) return;
    const boost = active ? 1.7 : 1;
    grpRef.current.rotation.x += delta * speed * boost;  /* continuous — never resets/bounces */
  });

  return (
    <group ref={grpRef} position={[x, 0, 0]}>
      <mesh geometry={top} material={mat} />
      <mesh geometry={bot} material={mat} />
    </group>
  );
}

/* ── Center gem — fixed rotation, nested inner diamond spins slowly ── */
function CenterGold({ active }) {
  const innerRef = useRef();
  const outer = useBipyramidGeos(GOLD_R, GOLD_H);
  const inner = useBipyramidGeos(GOLD_INNER_R, GOLD_INNER_H);

  const outerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(COL_GOLD), metalness: 0.65, roughness: 0.18,
    emissive: new THREE.Color(COL_GOLD), emissiveIntensity: 0.22,
    flatShading: true,
  }), []);
  const innerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(COL_GOLD_INNER), metalness: 0.4, roughness: 0.3,
    flatShading: true,
  }), []);

  useFrame(({ clock }) => {
    if (!innerRef.current) return;
    innerRef.current.rotation.y = clock.getElapsedTime() * (active ? 1.3 : 0.45);
  });

  return (
    <group position={[X_GOLD, 0, 0]}>
      <mesh geometry={outer.top} material={outerMat} />
      <mesh geometry={outer.bot} material={outerMat} />
      <group ref={innerRef}>
        <mesh geometry={inner.top} material={innerMat} />
        <mesh geometry={inner.bot} material={innerMat} />
      </group>
    </group>
  );
}

/* ── Scene ── */
function OrbScene({ active }) {
  return (
    <>
      <ambientLight intensity={0.55} />
      <pointLight position={[3, 3, 4]}   intensity={5.5} color="#ffffff" />
      <pointLight position={[-3, -1, 3]} intensity={3.2} color="#ffd9b3" />
      <pointLight position={[0, 2, -2]}  intensity={2.2} color="#7FA0E8" />

      {/* Outer pair — locked together, one continuous direction */}
      <SpinDiamond x={-X_PINK} radius={PINK_R} halfHeight={PINK_H} color={COL_OUTER} speed={SPEED_PINK} active={active} />
      <SpinDiamond x={ X_PINK} radius={PINK_R} halfHeight={PINK_H} color={COL_OUTER} speed={SPEED_PINK} active={active} />

      {/* Inner pair — opposite direction, DIFFERENT speeds so they never align */}
      <SpinDiamond x={-X_BLUE} radius={BLUE_R} halfHeight={BLUE_H} color={COL_INNER} speed={SPEED_BLUE_L} active={active} />
      <SpinDiamond x={ X_BLUE} radius={BLUE_R} halfHeight={BLUE_H} color={COL_INNER} speed={SPEED_BLUE_R} active={active} />

      {/* Center — fixed, inner gem spins */}
      <CenterGold active={active} />
    </>
  );
}

function OrbCanvas({ active }) {
  return (
    <Canvas
      camera={{ position: [0, 0, ORB_CAM_Z], fov: 38 }}
      style={{ width: ORB_CANVAS, height: ORB_CANVAS, display: "block" }}
      gl={{ alpha: true, antialias: true }}
    >
      <OrbScene active={active} />
    </Canvas>
  );
}

/* ─────────────────────────────────────────────────────────────
   OrbMenu — popup shell unchanged
───────────────────────────────────────────────────────────── */
export default function OrbMenu() {
  const [open, setOpen] = useState(false);

  const wrapRef  = useRef(null);
  const orbRef   = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(orbRef.current,
      { opacity: 0, scale: 0.6, y: 16 },
      { opacity: 1, scale: 1, y: 0, duration: 1.0, delay: 2.8, ease: "back.out(1.6)" }
    );
  }, []);

  useEffect(() => {
    const el = popupRef.current;
    if (!el) return;
    if (open) {
      gsap.set(el.querySelectorAll(".orb-nav"), { opacity: 0, x: 8 });
      gsap.to(el, {
        autoAlpha: 1, y: 0, scale: 1,
        duration: 0.32, ease: "back.out(1.5)",
        onStart: () => { el.style.pointerEvents = "auto"; },
      });
      gsap.to(el.querySelectorAll(".orb-nav"), {
        opacity: 1, x: 0, duration: 0.28, stagger: 0.05, delay: 0.08, ease: "power2.out",
      });
    } else {
      gsap.to(el, {
        autoAlpha: 0, y: 10, scale: 0.95,
        duration: 0.22, ease: "power2.in",
        onComplete: () => { el.style.pointerEvents = "none"; },
      });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handle = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div
      ref={wrapRef}
      style={{
        position: "fixed", bottom: 80, right: 28, zIndex: 800,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
      }}
    >
      <div
        ref={popupRef}
        style={{
          background: "rgba(5,5,9,0.96)",
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          borderRadius: 18,
          border: "1px solid rgba(224,184,136,0.20)",
          padding: "20px 24px 16px",
          minWidth: 172,
          opacity: 0, visibility: "hidden", pointerEvents: "none",
          transform: "translateY(10px) scale(0.95)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 48px rgba(224,184,136,0.10), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
          {NAV_ITEMS.map(({ label, href }) => (
            <a key={label} href={href} className="orb-nav" onClick={() => setOpen(false)}
              style={{ fontFamily:"'Array',monospace", fontSize:"1.05rem", letterSpacing:".04em", textTransform:"uppercase", color:"#F9F9F7", textDecoration:"none", padding:"5px 0", display:"block", transition:"color .16s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#7FA0E8"}
              onMouseLeave={e => e.currentTarget.style.color = "#F9F9F7"}
            >{label}</a>
          ))}
        </div>
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 14 }} />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {SOCIALS.map(({ l, h }) => (
            <a key={l} href={h} target="_blank" rel="noopener noreferrer" className="orb-nav"
              style={{ fontFamily:"'Space Mono',monospace", fontSize:".5rem", letterSpacing:".14em", textTransform:"uppercase", color:"#444", textDecoration:"none", transition:"color .16s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#F9F9F7"}
              onMouseLeave={e => e.currentTarget.style.color = "#444"}
            >{l}</a>
          ))}
        </div>
      </div>

      <div
        ref={orbRef}
        data-cursor={open ? "Close" : "Menu"}
        onClick={() => setOpen(o => !o)}
        style={{
          opacity: 0, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
          filter: `drop-shadow(0 0 ${open ? 20 : 9}px rgba(224,184,136,${open ? 0.55 : 0.3}))`,
          transition: "filter .4s ease",
        }}
      >
        <OrbCanvas active={open} />
        <span style={{
          fontFamily: "'Space Mono',monospace", fontSize: ".46rem",
          letterSpacing: ".22em", textTransform: "uppercase",
          color: open ? "#7FA0E8" : "#555", transition: "color .3s",
        }}>
          {open ? "close" : "menu"}
        </span>
      </div>
    </div>
  );
}