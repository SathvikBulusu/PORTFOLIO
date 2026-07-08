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
   📐  SIZE — one number to rule them all
═══════════════════════════════════════════════════════════════ */
const ORB_CANVAS = 180;   /* px canvas — 100–200 range          */
const ORB_CAM_Z  = 1.85;  /* camera Z — lower = fills canvas more */

/* ═══════════════════════════════════════════════════════════════
   ⚙️  SHAPE PARAMETERS
   Leaf  = the 4 black elongated shapes at diagonals (45°/135°/225°/315°)
   Diam  = the 4 blue diamond arms at cardinals  (0°/90°/180°/270°)
═══════════════════════════════════════════════════════════════ */
const LEAF_INNER = 0.08;    /* leaf inner tip from center  */
const LEAF_OUTER = 1.10;    /* leaf outer tip from center  */
const LEAF_WIDTH = 0.062;   /* leaf half-width at widest   */

const DIAM_INNER = 0.08;    /* diamond inner tip           */
const DIAM_OUTER = 0.85;    /* diamond outer tip           */
const DIAM_WIDTH = 0.27;    /* diamond half-width          */
const DIAM_SHLD  = 0.44;    /* shoulder height ratio 0–1   */

/* ═══════════════════════════════════════════════════════════════
   🔄  ROTATION SPEEDS (radians / second)
   Black leaves = counter-clockwise  (negative Z)
   Blue diamonds = clockwise         (positive Z)
═══════════════════════════════════════════════════════════════ */
const LEAF_SPEED = 0.45;
const DIAM_SPEED = 0.70;

/* ─── Shared extrude options (tiny depth → bevel catches light) ─── */
const EXT = {
  depth: 0.020,
  bevelEnabled: true,
  bevelSize: 0.009,
  bevelThickness: 0.007,
  bevelSegments: 2,
};

/* ─── Shape constructors ─── */
function makeLeaf() {
  /* Double bezier → symmetric lens shape, SHARP at both ends */
  const s = new THREE.Shape();
  const gap = LEAF_OUTER - LEAF_INNER;
  s.moveTo(0, LEAF_INNER);
  s.bezierCurveTo(
     LEAF_WIDTH, LEAF_INNER + gap * 0.28,
     LEAF_WIDTH, LEAF_INNER + gap * 0.68,
     0,          LEAF_OUTER
  );
  s.bezierCurveTo(
    -LEAF_WIDTH, LEAF_INNER + gap * 0.68,
    -LEAF_WIDTH, LEAF_INNER + gap * 0.28,
     0,          LEAF_INNER
  );
  s.closePath();
  return s;
}

function makeDiamond() {
  /* Strict linear edges → SHARP crystal faces, no curves */
  const s = new THREE.Shape();
  const shldY = DIAM_INNER + (DIAM_OUTER - DIAM_INNER) * DIAM_SHLD;
  s.moveTo(0,            DIAM_INNER);
  s.lineTo( DIAM_WIDTH,  shldY);
  s.lineTo(0,            DIAM_OUTER);
  s.lineTo(-DIAM_WIDTH,  shldY);
  s.closePath();
  return s;
}

/* ─── Center blob shaders ─── */
const blobVert = /* glsl */`
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vNormal;
  varying vec3 vPos;

  float h(float n){ return fract(sin(n)*43758.5453); }
  float noise(vec3 x){
    vec3 p=floor(x), f=fract(x);
    f=f*f*(3.-2.*f);
    float n=p.x+p.y*57.+113.*p.z;
    return mix(
      mix(mix(h(n),h(n+1.),f.x),mix(h(n+57.),h(n+58.),f.x),f.y),
      mix(mix(h(n+113.),h(n+114.),f.x),mix(h(n+170.),h(n+171.),f.x),f.y),
    f.z);
  }

  void main(){
    vNormal = normalize(normalMatrix * normal);
    float n  = noise(position * 4.5 + vec3(uTime * 0.85));
    vec3 d   = position + normal * n * uAmp;
    vPos     = (modelMatrix * vec4(d, 1.0)).xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(d, 1.0);
  }
`;

const blobFrag = /* glsl */`
  uniform vec3 uColor;
  varying vec3 vNormal;
  varying vec3 vPos;

  void main(){
    vec3 vd  = normalize(cameraPosition - vPos);
    float fr = pow(1. - clamp(dot(normalize(vNormal), vd), 0., 1.), 2.6);
    vec3 col = mix(uColor, vec3(1., .97, .85), fr * 0.72);
    gl_FragColor = vec4(col, 0.88 + fr * 0.12);
  }
`;

/* ─── Main 3D scene (runs inside R3F Canvas) ─── */
function OrbScene({ isOpen, isHovered }) {
  const leafGrpRef = useRef();   /* black leaves  — CCW */
  const diamGrpRef = useRef();   /* blue diamonds — CW  */
  const blobMatRef = useRef();   /* center blob shader  */

  /* Black leaves — dark metallic */
  const blackMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:     new THREE.Color("#0a0a0a"),
    metalness: 0.85,
    roughness: 0.15,
    side:      THREE.DoubleSide,
  }), []);

  /* Blue diamonds — vivid, bright enough to read over black */
  const blueMat = useMemo(() => new THREE.MeshStandardMaterial({
    color:     new THREE.Color("#2563eb"),   /* bright blue — visible with just lights */
    metalness: 0.80,
    roughness: 0.10,
    side:      THREE.DoubleSide,
    emissive:  new THREE.Color("#0a1a4a"),   /* slight self-illumination so it's never pure black */
    emissiveIntensity: 0.35,
  }), []);

  const leafWireMat = useMemo(() => new THREE.LineBasicMaterial({
    color: new THREE.Color("#1a1a1a"), transparent: true, opacity: 0.55,
  }), []);

  const diamWireMat = useMemo(() => new THREE.LineBasicMaterial({
    color: new THREE.Color("#4a80c0"), transparent: true, opacity: 0.40,
  }), []);

  /* Pre-built geometries */
  const { leafGeos, leafWires, diamGeos, diamWires } = useMemo(() => {
    const leafShape = makeLeaf();
    const diamShape = makeDiamond();

    /* 4 leaves — 45°, 135°, 225°, 315° */
    const leafGeos = [0,1,2,3].map(i => {
      const g = new THREE.ExtrudeGeometry(leafShape, EXT);
      g.rotateZ(Math.PI / 4 + i * (Math.PI / 2));
      g.translate(0, 0, -EXT.depth / 2);
      return g;
    });
    const leafWires = leafGeos.map(g => new THREE.EdgesGeometry(g));

    /* 4 diamond arms — 0°, 90°, 180°, 270° */
    const diamGeos = [0,1,2,3].map(i => {
      const g = new THREE.ExtrudeGeometry(diamShape, EXT);
      g.rotateZ(i * (Math.PI / 2));
      g.translate(0, 0, -EXT.depth / 2);
      return g;
    });
    const diamWires = diamGeos.map(g => new THREE.EdgesGeometry(g));

    return { leafGeos, leafWires, diamGeos, diamWires };
  }, []);

  const C = useRef({
    blueA: new THREE.Color("#2563eb"),   /* vivid blue start  */
    blueB: new THREE.Color("#D97706"),   /* amber gold end    */
    wireA: new THREE.Color("#60a5fa"),
    wireB: new THREE.Color("#D4A843"),
    blobA: new THREE.Color("#3b82f6"),
    blobB: new THREE.Color("#C8860A"),
  }).current;

  useFrame(({ clock }, delta) => {
    const t = clock.getElapsedTime();

    /* Counter-clockwise — black leaves */
    if (leafGrpRef.current) leafGrpRef.current.rotation.z -= LEAF_SPEED * delta;
    /* Clockwise — metallic blue diamonds */
    if (diamGrpRef.current) diamGrpRef.current.rotation.z += DIAM_SPEED * delta;

    /* Color oscillation: vivid blue → amber gold → back */
    const ph = (Math.sin(t * 0.42) + 1) * 0.5;
    blueMat.color.copy(C.blueA).lerp(C.blueB, ph);
    blueMat.emissive.copy(C.blueA).lerp(C.blueB, ph).multiplyScalar(0.2);
    diamWireMat.color.copy(C.wireA).lerp(C.wireB, ph);

    /* Center blob */
    if (blobMatRef.current) {
      blobMatRef.current.uniforms.uTime.value = t;
      const ampTarget = isOpen ? 0.22 : isHovered ? 0.12 : 0.05;
      const cur = blobMatRef.current.uniforms.uAmp.value;
      blobMatRef.current.uniforms.uAmp.value += (ampTarget - cur) * 0.05;

      /* Blob colour also blue → gold */
      const bph = (Math.sin(t * 0.58 + 1.4) + 1) * 0.5;
      blobMatRef.current.uniforms.uColor.value
        .copy(C.blobA).lerp(C.blobB, bph);
    }
  });

  return (
    <>
      {/* Lighting — key from upper-right, fill from left, gold rim from below */}
      <ambientLight intensity={0.45} />
      <pointLight position={[2,  2, 2.5]} intensity={6.0} color="#ffffff" />
      <pointLight position={[-2, 1, 2.0]} intensity={4.0} color="#60a5fa" />
      <pointLight position={[0, -3, 1.5]} intensity={2.0} color="#D4A843" />

      {/* ── BLACK LEAF GROUP — counter-clockwise ── */}
      <group ref={leafGrpRef}>
        {leafGeos.map((g, i) => (
          <mesh key={i} geometry={g} material={blackMat} />
        ))}
        {leafWires.map((g, i) => (
          <lineSegments key={`lw${i}`} geometry={g} material={leafWireMat} />
        ))}
      </group>

      {/* ── METALLIC BLUE DIAMOND GROUP — clockwise, slightly in front ── */}
      <group ref={diamGrpRef} position={[0, 0, 0.015]}>
        {diamGeos.map((g, i) => (
          <mesh key={i} geometry={g} material={blueMat} />
        ))}
        {diamWires.map((g, i) => (
          <lineSegments key={`dw${i}`} geometry={g} material={diamWireMat} />
        ))}
      </group>

      {/* ── CENTER MORPHING BLOB (blue → gold, responds to state) ── */}
      <mesh position={[0, 0, 0.04]}>
        <icosahedronGeometry args={[0.075, 4]} />
        <shaderMaterial
          ref={blobMatRef}
          vertexShader={blobVert}
          fragmentShader={blobFrag}
          uniforms={{
            uTime:  { value: 0 },
            uAmp:   { value: 0.05 },  // note: uniform name matches vert shader
            uColor: { value: new THREE.Color("#4a90d9") },
          }}
          transparent
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

function OrbCanvas({ isOpen, isHovered }) {
  return (
    <Canvas
      camera={{ position: [0, 0, ORB_CAM_Z], fov: 50 }}
      style={{ width: ORB_CANVAS, height: ORB_CANVAS }}
      gl={{ alpha: true, antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
    >
      <OrbScene isOpen={isOpen} isHovered={isHovered} />
    </Canvas>
  );
}

/* ─────────────────────────────────────────────────────────────
   POPUP + TRIGGER SHELL
───────────────────────────────────────────────────────────── */
export default function OrbMenu() {
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(false);

  const wrapRef  = useRef(null);
  const orbRef   = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(orbRef.current,
      { opacity: 0, scale: 0.5, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 1.0, delay: 2.8, ease: "back.out(1.7)" }
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
        display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10,
      }}
    >
      {/* Popup card */}
      <div
        ref={popupRef}
        style={{
          background: "rgba(5,5,9,0.96)",
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          borderRadius: 18,
          border: "1px solid rgba(26,74,138,0.28)",
          padding: "20px 24px 16px",
          minWidth: 172,
          opacity: 0, visibility: "hidden", pointerEvents: "none",
          transform: "translateY(10px) scale(0.95)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 48px rgba(26,74,138,0.15), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 16 }}>
          {NAV_ITEMS.map(({ label, href }) => (
            <a key={label} href={href} className="orb-nav" onClick={() => setOpen(false)}
              style={{ fontFamily:"'Array',monospace", fontSize:"1.05rem", letterSpacing:".04em", textTransform:"uppercase", color:"#F9F9F7", textDecoration:"none", padding:"5px 0", display:"block", transition:"color .16s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#4a90d9"}
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

      {/* Orb trigger */}
      <div
        ref={orbRef}
        data-cursor={open ? "Close" : "Menu"}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          opacity: 0, cursor: "pointer",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          filter: `drop-shadow(0 0 ${open || hovered ? 22 : 8}px rgba(26,74,138,${open || hovered ? 0.75 : 0.38}))`,
          transition: "filter .42s ease",
        }}
      >
        <OrbCanvas isOpen={open} isHovered={hovered} />
        <span style={{
          fontFamily: "'Space Mono',monospace", fontSize: ".46rem",
          letterSpacing: ".22em", textTransform: "uppercase",
          color: open ? "#4a90d9" : "#555", transition: "color .3s",
        }}>
          {open ? "close" : "menu"}
        </span>
      </div>
    </div>
  );
}