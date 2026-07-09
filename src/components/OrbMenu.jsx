/* src/components/OrbMenu.jsx */

import { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const NAV_ITEMS = [
  { label: "Work",       href: "#work" },
  { label: "Writing",    href: "#writing" },
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
   THE STRUCTURE — 5 flat diamonds in a horizontal row:

   [BIG PINK]—[small BLUE]—[tiny GOLD + inner diamond]—[small BLUE]—[BIG PINK]

   Each diamond TIPS around the horizontal (X) axis — like a card
   hinged at its middle, flipping forward/back. That's what makes
   it read as real 3D: a flat shape foreshortens as it tips
   (thin edge-on at 90°, full width at 0°), unlike a flat screen-
   plane spin which never changes apparent size.

   Pink pair tips one direction, blue pair the opposite direction
   (counter-phase). Gold center stays rotationally fixed.
   Thin strut lines connect the row + diagonal braces from each
   pink's outer tip down toward the blue diamonds, per the sketch.
═══════════════════════════════════════════════════════════════ */

/* ── SIZE ── */
const ORB_CANVAS = 170;
const ORB_CAM_Z  = 4.6;

/* ── DIAMOND DIMENSIONS ── */
const PINK_H = 1.55;   /* pink diamond half-height (tall)   */
const PINK_W = 0.30;   /* pink diamond half-width           */
const BLUE_H = 0.62;   /* blue diamond half-height          */
const BLUE_W = 0.24;   /* blue diamond half-width           */
const GOLD_W = 0.15;   /* gold diamond half-width (horiz.)  */
const GOLD_H = 0.09;   /* gold diamond half-height          */

/* ── POSITIONS along X axis (tips touching) ── */
const X_PINK = PINK_H * 0.62;                 /* pink center offset  */
const X_BLUE = X_PINK - PINK_H + BLUE_H * 0.5; /* blue center offset  */
const X_GOLD = 0;                              /* gold stays centered */

/* ── ROTATION ── */
const TIP_SPEED = 0.55;   /* radians/sec tipping speed */

/* ── COLORS ── */
const COL_PINK  = "#F2B6C4";
const COL_BLUE  = "#2E63EB";
const COL_GOLD  = "#D9A73E";
const COL_INNER = "#1a1a2e";

/* ── Diamond shape (kite, pointed top/bottom) ── */
function makeDiamond(halfW, halfH) {
  const s = new THREE.Shape();
  s.moveTo(0,  halfH);
  s.lineTo( halfW, 0);
  s.lineTo(0, -halfH);
  s.lineTo(-halfW, 0);
  s.closePath();
  return s;
}

const EXT = { depth: 0.045, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.010, bevelSegments: 2 };

/* ── One tipping diamond group ── */
function TippingDiamond({ x, halfW, halfH, color, phase, speed, active }) {
  const grpRef = useRef();
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(makeDiamond(halfW, halfH), EXT);
    g.translate(0, 0, -EXT.depth / 2);
    return g;
  }, [halfW, halfH]);
  const edge = useMemo(() => new THREE.EdgesGeometry(geo), [geo]);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(color), metalness: 0.55, roughness: 0.28, side: THREE.DoubleSide,
  }), [color]);
  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({
    color: new THREE.Color(color).multiplyScalar(0.6), transparent: true, opacity: 0.6,
  }), [color]);

  useFrame(({ clock }) => {
    if (!grpRef.current) return;
    const t = clock.getElapsedTime();
    const boost = active ? 1.6 : 1;
    grpRef.current.rotation.x = Math.sin(t * speed * boost + phase) * (Math.PI / 2.1);
  });

  return (
    <group ref={grpRef} position={[x, 0, 0]}>
      <mesh geometry={geo} material={mat} />
      <lineSegments geometry={edge} material={edgeMat} />
    </group>
  );
}

/* ── Center gold assembly — outer diamond (fixed) + inner diamond (subtle spin) ── */
function CenterGold({ active }) {
  const innerRef = useRef();
  const outerGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(makeDiamond(GOLD_W, GOLD_H), EXT);
    g.translate(0, 0, -EXT.depth / 2);
    return g;
  }, []);
  const innerGeo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(makeDiamond(GOLD_W * 0.42, GOLD_H * 0.42), EXT);
    g.translate(0, 0, -EXT.depth / 2);
    return g;
  }, []);
  const outerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(COL_GOLD), metalness: 0.7, roughness: 0.18,
    emissive: new THREE.Color(COL_GOLD), emissiveIntensity: 0.25, side: THREE.DoubleSide,
  }), []);
  const innerMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(COL_INNER), metalness: 0.4, roughness: 0.3, side: THREE.DoubleSide,
  }), []);

  useFrame(({ clock }) => {
    if (!innerRef.current) return;
    const t = clock.getElapsedTime();
    innerRef.current.rotation.z = t * (active ? 1.4 : 0.5);
  });

  return (
    <group position={[X_GOLD, 0, 0]}>
      <mesh geometry={outerGeo} material={outerMat} />
      <mesh ref={innerRef} geometry={innerGeo} material={innerMat} position={[0, 0, 0.03]} />
    </group>
  );
}

/* ── Strut lines: horizontal spine + diagonal braces from pink tips ── */
function Struts() {
  const lineMat = useMemo(() => new THREE.LineBasicMaterial({
    color: "#999999", transparent: true, opacity: 0.35,
  }), []);

  const points = useMemo(() => {
    const spine = new Float32Array([
      -X_PINK - PINK_H, 0, 0,
       X_PINK + PINK_H, 0, 0,
    ]);
    /* Diagonal braces: from each pink's top tip down toward its neighboring blue */
    const braceL = new Float32Array([
      -X_PINK, PINK_H, 0,   -X_BLUE, BLUE_H * 0.3, 0,
    ]);
    const braceR = new Float32Array([
       X_PINK, PINK_H, 0,    X_BLUE, BLUE_H * 0.3, 0,
    ]);
    return { spine, braceL, braceR };
  }, []);

  const makeGeo = arr => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  };

  return (
    <>
      <lineSegments geometry={makeGeo(points.spine)}  material={lineMat} />
      <lineSegments geometry={makeGeo(points.braceL)} material={lineMat} />
      <lineSegments geometry={makeGeo(points.braceR)} material={lineMat} />
    </>
  );
}

/* ── Full scene ── */
function OrbScene({ active }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 4]}  intensity={5.5} color="#ffffff" />
      <pointLight position={[-3, -1, 3]} intensity={3.0} color="#ffb6c9" />
      <pointLight position={[0, 2, -2]} intensity={2.0} color="#60a5fa" />

      <Struts />

      {/* Far pink diamonds — tip together, same phase */}
      <TippingDiamond x={-X_PINK} halfW={PINK_W} halfH={PINK_H} color={COL_PINK} phase={0}    speed={TIP_SPEED} active={active} />
      <TippingDiamond x={ X_PINK} halfW={PINK_W} halfH={PINK_H} color={COL_PINK} phase={0}    speed={TIP_SPEED} active={active} />

      {/* Blue diamonds — tip opposite phase (π offset = counter motion) */}
      <TippingDiamond x={-X_BLUE} halfW={BLUE_W} halfH={BLUE_H} color={COL_BLUE} phase={Math.PI} speed={TIP_SPEED} active={active} />
      <TippingDiamond x={ X_BLUE} halfW={BLUE_W} halfH={BLUE_H} color={COL_BLUE} phase={Math.PI} speed={TIP_SPEED} active={active} />

      {/* Gold center — rotationally constant, inner diamond subtly spins */}
      <CenterGold active={active} />
    </>
  );
}

function OrbCanvas({ active }) {
  return (
    <Canvas
      camera={{ position: [0, 0, ORB_CAM_Z], fov: 40 }}
      style={{ width: ORB_CANVAS, height: ORB_CANVAS, display: "block" }}
      gl={{ alpha: true, antialias: true }}
    >
      <OrbScene active={active} />
    </Canvas>
  );
}

/* ─────────────────────────────────────────────────────────────
   OrbMenu — popup shell unchanged from previous builds
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
        position: "fixed", bottom: 28, right: 28, zIndex: 800,
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8,
      }}
    >
      <div
        ref={popupRef}
        style={{
          background: "rgba(5,5,9,0.96)",
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          borderRadius: 18,
          border: "1px solid rgba(242,182,196,0.20)",
          padding: "20px 24px 16px",
          minWidth: 172,
          opacity: 0, visibility: "hidden", pointerEvents: "none",
          transform: "translateY(10px) scale(0.95)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 48px rgba(242,182,196,0.10), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
          {NAV_ITEMS.map(({ label, href }) => (
            <a key={label} href={href} className="orb-nav" onClick={() => setOpen(false)}
              style={{ fontFamily:"'Array',monospace", fontSize:"1.05rem", letterSpacing:".04em", textTransform:"uppercase", color:"#F9F9F7", textDecoration:"none", padding:"5px 0", display:"block", transition:"color .16s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#2E63EB"}
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
          filter: `drop-shadow(0 0 ${open ? 20 : 9}px rgba(242,182,196,${open ? 0.55 : 0.3}))`,
          transition: "filter .4s ease",
        }}
      >
        <OrbCanvas active={open} />
        <span style={{
          fontFamily: "'Space Mono',monospace", fontSize: ".46rem",
          letterSpacing: ".22em", textTransform: "uppercase",
          color: open ? "#2E63EB" : "#555", transition: "color .3s",
        }}>
          {open ? "close" : "menu"}
        </span>
      </div>
    </div>
  );
}