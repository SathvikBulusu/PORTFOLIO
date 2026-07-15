/* src/App.jsx */

import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";
import { useLenis, useGsapReveal } from "./components/LenisProvider";
import OrbMenu   from "./components/OrbMenu";
import Work      from "./components/Work";
import Writing   from "./components/Writing";
import Projects  from "./components/Projects";
import Frames     from "./components/Frames";
import InfluencesDiamond from "./components/InfluencesDiamond";
import Footer    from "./components/Footer";

/* ── Journey arc cards ── */
const ARC_CARDS = [
  { n:"01", period:"2021–22", era:"Streamer",
    desc:"Built live production systems from scratch. Layouts, overlays, OBS automation. First time I cared about how something felt, not just whether it ran.",
    tags:["Design","Live Systems","Social Media"] },
  { n:"02", period:"2022–25", era:"Data Science",
    desc:"Self-taught the full DS stack. Learned to ask the right question before opening a notebook. Data without context is just noise.",
    tags:["Analytics","Python","Machine Learning","SQL"] },
  { n:"03", period:"2025–26", era:"Applied AI",
    desc:"Interned at Moneyview under Consumer Insights. Built PRIMA end-to-end. First time I fully owned a product from 0 to 1.",
    tags:["LLM Engineering","Voice Agents","Product Analytics"] },
  { n:"04", period:"Now", era:"AI Engineering",
    desc:"AI is the medium. Building systems that solve real problems at scale. Moving with precision.",
    tags:["AI Engineering","Systems","Scale"] },
];

const SQUARES = [
  { left:"16%", top:"33%", size:18, depth:1.2, fAmt:7,  fSpd:1.0, phase:0.0 },
  { left:"74%", top:"31%", size:16, depth:0.8, fAmt:5,  fSpd:0.9, phase:1.2 },
  { left:"14%", top:"58%", size:48, depth:0.5, fAmt:9,  fSpd:0.7, phase:2.1 },
  { left:"78%", top:"56%", size:16, depth:1.4, fAmt:6,  fSpd:1.1, phase:0.8 },
  { left:"46%", top:"22%", size:12, depth:1.0, fAmt:4,  fSpd:1.3, phase:1.6 },
  { left:"50%", top:"71%", size:12, depth:0.9, fAmt:8,  fSpd:0.8, phase:0.4 },
  { left:"6%",  top:"48%", size:10, depth:1.6, fAmt:5,  fSpd:1.2, phase:2.8 },
  { left:"90%", top:"46%", size:34, depth:0.6, fAmt:7,  fSpd:0.6, phase:1.9 },
];

/* Snow flakes for loader — fixed at module level */
const SNOW = Array.from({ length: 38 }, (_, i) => ({
  left:    `${(i * 2.7 + Math.sin(i) * 8 + 50) % 100}%`,
  size:    Math.max(1.5, (i % 3) + 1.5),
  dur:     `${4 + (i % 5)}s`,
  delay:   `${(i * 0.22) % 3.5}s`,
  drift:   `${(i % 2 === 0 ? 1 : -1) * ((i % 12) + 6)}px`,
  opacity: 0.25 + (i % 4) * 0.12,
}));

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');
@font-face{font-family:'Array';src:url('/fonts/Array-SemiboldWide.otf') format('opentype');font-weight:600;font-display:swap;}
@font-face{font-family:'Nippo';src:url('/fonts/Nippo-Light.woff2') format('woff2');font-weight:300;font-display:swap;}
@font-face{font-family:'Nippo';src:url('/fonts/Nippo-Regular.woff2') format('woff2');font-weight:400;font-display:swap;}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html.lenis{height:auto;}
.lenis.lenis-smooth{scroll-behavior:auto!important;}
body{background:#F9F9F7;color:#0A0A0B;font-family:'Nippo','Helvetica Neue',sans-serif;font-weight:300;overflow-x:hidden;}
body::before{content:"";position:fixed;inset:0;pointer-events:none;z-index:2;opacity:0.035;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");}

/* ── Loader ── */
.ld{position:fixed;inset:0;background:#0A0A0B;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:opacity .65s ease;overflow:hidden;}
.ld.out{opacity:0;pointer-events:none;}
.ld-mark{font-family:'Array',monospace;font-size:2rem;letter-spacing:.15em;text-transform:uppercase;color:#F9F9F7;opacity:0;transition:opacity .5s;position:relative;z-index:2;}
.ld-mark.in{opacity:1;}
.ld-bar-wrap{width:80px;height:1px;background:#222;margin-top:32px;overflow:hidden;opacity:0;transition:opacity .3s .25s;position:relative;z-index:2;}
.ld-bar-wrap.in{opacity:1;}
.ld-bar{height:100%;background:#F9F9F7;width:0;transition:width 2s cubic-bezier(.4,0,.2,1) .45s;}
.ld-bar.in{width:100%;}

/* ── Snow ── */
@keyframes snowfall{
  0%  {transform:translateY(-12px) translateX(0);opacity:0;}
  8%  {opacity:var(--snow-op);}
  92% {opacity:var(--snow-op);}
  100%{transform:translateY(calc(100vh + 12px)) translateX(var(--drift));opacity:0;}
}
.snow{position:absolute;border-radius:50%;background:#ffffff;pointer-events:none;animation:snowfall var(--dur) var(--delay) linear infinite;top:0;z-index:1;}

/* ── Cursor pill ── */
.cpill{position:fixed;top:0;left:0;pointer-events:none;z-index:9998;background:#0A0A0B;color:#F9F9F7;padding:5px 13px;border-radius:100px;font-family:'Space Mono',monospace;font-size:.5rem;letter-spacing:.12em;text-transform:uppercase;white-space:nowrap;opacity:0;transition:opacity .15s;}

/* ── Story popup ── */
.story-pop{position:fixed;inset:0;background:rgba(249,249,247,0.97);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);z-index:880;display:flex;align-items:center;justify-content:center;transition:opacity .35s,visibility .35s;padding:72px 10vw;overflow-y:auto;}
.story-pop.closed{opacity:0;visibility:hidden;pointer-events:none;}
.story-pop.open{opacity:1;visibility:visible;}

/* ── Hero ── */
.hero{height:100vh;position:relative;background:#F9F9F7;overflow:hidden;}
.sb{font-family:'Space Mono',monospace;font-size:.58rem;letter-spacing:.2em;text-transform:uppercase;padding:9px 20px;background:#F9F9F7;color:#0A0A0B;border:1px solid rgba(10,10,11,0.6);cursor:pointer;transition:all .22s ease;}
.sb:hover,.sb.on{background:#0A0A0B;color:#F9F9F7;}

/* ── Glassmorphic floating squares ── */
.gsq{position:absolute;background:rgba(255,255,255,0.72);border:1px solid rgba(10,10,11,0.10);backdrop-filter:blur(16px) saturate(130%);-webkit-backdrop-filter:blur(16px) saturate(130%);box-shadow:0 8px 32px rgba(0,0,0,0.08),0 2px 8px rgba(0,0,0,0.04),inset 0 1px 0 rgba(255,255,255,1),inset 0 -1px 0 rgba(0,0,0,0.03);will-change:transform;}

.rv{opacity:0;}
`;

/* ── Hooks ── */
function useIST() {
  const [t, setT] = useState("");
  useEffect(() => {
    const fmt = () => setT(new Date().toLocaleTimeString("en-IN", { timeZone:"Asia/Kolkata", hour:"2-digit", minute:"2-digit", hour12:true }));
    fmt(); const id = setInterval(fmt, 30000); return () => clearInterval(id);
  }, []);
  return t;
}

function useViews() {
  const [v, setV] = useState(null);
  useEffect(() => {
    const SEED = 1247; const stored = localStorage.getItem("at23_v");
    const n = stored ? parseInt(stored) + 1 : SEED + 1;
    localStorage.setItem("at23_v", n.toString()); setV(n.toLocaleString());
  }, []);
  return v;
}

/* ── CursorPill ── */
function CursorPill() {
  const ref = useRef(null);
  useEffect(() => {
    const pill = ref.current;
    const onMove = e => { if (pill) pill.style.transform = `translate(${e.clientX+14}px,${e.clientY+10}px)`; };
    const onOver = e => { const el = e.target.closest("[data-cursor]"); const lbl = el?.getAttribute("data-cursor") || ""; if (pill) { pill.style.opacity = lbl ? "1" : "0"; pill.textContent = lbl; } };
    window.addEventListener("mousemove", onMove); document.addEventListener("mouseover", onOver);
    return () => { window.removeEventListener("mousemove", onMove); document.removeEventListener("mouseover", onOver); };
  }, []);
  return <div ref={ref} className="cpill" />;
}

/* ── FloatingSquares ── */
function FloatingSquares() {
  const refs = useRef([]); const mouse = useRef({ x:0, y:0 }); const curr = useRef({ x:0, y:0 });
  useEffect(() => {
    const onMove = e => { mouse.current = { x:(e.clientX/window.innerWidth-.5)*2, y:(e.clientY/window.innerHeight-.5)*2 }; };
    window.addEventListener("mousemove", onMove);
    let raf;
    const tick = t => {
      raf = requestAnimationFrame(tick);
      curr.current.x += (mouse.current.x - curr.current.x) * .04; curr.current.y += (mouse.current.y - curr.current.y) * .04;
      refs.current.forEach((el, i) => { if (!el) return; const sq = SQUARES[i]; const mx = curr.current.x*sq.depth*-16; const my = curr.current.y*sq.depth*-16; const fy = Math.sin(t*.001*sq.fSpd+sq.phase)*sq.fAmt; const fr = Math.sin(t*.0007*sq.fSpd+sq.phase)*1.2; el.style.transform = `translate(${mx}px,${my+fy}px) rotate(${fr}deg)`; });
    };
    tick(0);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); };
  }, []);
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1 }}>
      {SQUARES.map((sq, i) => (<div key={i} ref={el => refs.current[i] = el} className="gsq" style={{ left:sq.left, top:sq.top, width:sq.size, height:sq.size }} />))}
    </div>
  );
}

/* ── AmbientPhoto ── */
function AmbientPhoto() {
  const photoGlob = import.meta.glob("./photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", { eager:true });
  const photos = Object.values(photoGlob).map(m => m.default);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const onMove  = () => { el.style.opacity = "0.16"; el.style.filter = "blur(32px)"; };
    const onLeave = () => { el.style.opacity = "0.06"; el.style.filter = "blur(48px)"; };
    window.addEventListener("mousemove", onMove); window.addEventListener("mouseleave", onLeave);
    return () => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseleave", onLeave); };
  }, []);
  if (!photos.length) return null;
  return (
    <img ref={ref} src={photos[0]} alt="" style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"60%", height:"60%", objectFit:"cover", opacity:0.06, filter:"blur(48px)", transition:"opacity .8s ease, filter .8s ease", pointerEvents:"none", zIndex:0 }} />
  );
}

/* ── ParticleSathvik ── */
function ParticleSathvik() {
  const cRef = useRef(null);
  useEffect(() => {
    const canvas = cRef.current; if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio, 2); const ctx = canvas.getContext("2d");
    let particles = [], mouse = { x:-9999, y:-9999 }, raf; let W, H;
    const build = () => {
      const rect = canvas.getBoundingClientRect(); W = Math.floor(rect.width); H = Math.floor(rect.height);
      canvas.width = W*dpr; canvas.height = H*dpr; ctx.scale(dpr, dpr);
      const off = document.createElement("canvas"); off.width = W; off.height = H; const offCtx = off.getContext("2d");
      offCtx.fillStyle = "#000"; offCtx.font = `600 ${Math.min(W*.145, 150)}px Array, monospace`; offCtx.textAlign = "center"; offCtx.textBaseline = "middle"; offCtx.fillText("SATHVIK", W/2, H/2);
      const data = offCtx.getImageData(0, 0, W, H).data; particles = []; const gap = Math.max(4, Math.ceil(W/220));
      for (let y = 0; y < H; y += gap) for (let x = 0; x < W; x += gap) if (data[(y*W+x)*4+3] > 100) particles.push({ x, y, homeX:x, homeY:y, vx:0, vy:0, r:2 });
    };
    const animate = () => {
      raf = requestAnimationFrame(animate); ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        const dx = p.x-mouse.x, dy = p.y-mouse.y, d2 = dx*dx+dy*dy;
        if (d2 < 4900 && d2 > 0) { const d = Math.sqrt(d2), f = ((70-d)/70)*5; p.vx += (dx/d)*f; p.vy += (dy/d)*f; }
        p.vx += (p.homeX-p.x)*.08; p.vy += (p.homeY-p.y)*.08; p.vx *= .82; p.vy *= .82; p.x += p.vx; p.y += p.vy;
        const speed = Math.sqrt(p.vx*p.vx+p.vy*p.vy);
        let r=10,g=10,b=11;
        if (speed > .4) { const t = Math.min(1,(speed-.4)/9); if (t<.5) { const u=t*2; r=Math.round(10+u*138); g=Math.round(10+u*41); b=Math.round(11+u*223); } else { const u=(t-.5)*2; r=Math.round(148-u*89); g=Math.round(51+u*79); b=Math.round(234+u*12); } }
        ctx.fillStyle = `rgb(${r},${g},${b})`; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI*2); ctx.fill();
      });
    };
    const onMove = e => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX-r.left; mouse.y = e.clientY-r.top; };
    window.addEventListener("mousemove", onMove);
    document.fonts.ready.then(() => { build(); animate(); });
    const ro = new ResizeObserver(build); ro.observe(canvas);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); ro.disconnect(); };
  }, []);
  return <canvas ref={cRef} style={{ display:"block", width:"88vw", height:"clamp(100px,16vh,180px)", position:"relative", zIndex:2 }} />;
}

/* ── StoryPopup — "My Journey So Far" ── */
function StoryPopup({ isOpen, onClose }) {
  return (
    <div className={`story-pop ${isOpen ? "open" : "closed"}`} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      {/* X close button — fixed top-right, always visible */}
      <button
        onClick={onClose}
        style={{
          position:"fixed", top:28, right:36,
          fontFamily:"'Array',monospace", fontSize:"1.3rem", letterSpacing:".06em",
          textTransform:"uppercase", color:"#0A0A0B", background:"none", border:"none",
          cursor:"pointer", zIndex:890, lineHeight:1,
        }}
      >
        ✕
      </button>

      <div style={{ maxWidth:600, width:"100%", position:"relative" }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".52rem", letterSpacing:".3em", textTransform:"uppercase", color:"#bbb", marginBottom:48 }}>
          My Journey So Far
        </div>
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", left:3, top:12, bottom:12, width:1, background:"#ECEAE4" }} />
          {ARC_CARDS.map((c, i) => (
            <div key={i} style={{ display:"flex", gap:28, paddingBottom:40, marginBottom:40, position:"relative", borderBottom:i<3?"1px solid #F0EDE8":"none" }}>
              <div style={{ width:8, height:8, borderRadius:"50%", background:i===3?"#0A0A0B":"#F9F9F7", border:"1px solid #0A0A0B", flexShrink:0, marginTop:10, position:"relative", zIndex:1 }} />
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".5rem", color:"#bbb", letterSpacing:".14em", marginBottom:8 }}>{c.period} · {c.n}</div>
                <div style={{ fontFamily:"'Array',monospace", fontSize:"clamp(1.4rem,3vw,2.4rem)", color:"#0A0A0B", letterSpacing:".04em", textTransform:"uppercase", lineHeight:1.0, marginBottom:14 }}>{c.era}</div>
                <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:".95rem", color:"#777", lineHeight:1.72, marginBottom:14 }}>{c.desc}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {c.tags.map(t => (<span key={t} style={{ fontFamily:"'Space Mono',monospace", fontSize:".44rem", letterSpacing:".1em", textTransform:"uppercase", color:"#0A0A0B", border:"1px solid #D8D4CC", padding:"2px 7px" }}>{t}</span>))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Loader with snow ── */
function Loader({ phase }) {
  const a = phase === "active" || phase === "fadeout";
  return (
    <div className={`ld${phase === "fadeout" ? " out" : ""}`}>
      {/* Snow particles */}
      {SNOW.map((f, i) => (
        <div
          key={i}
          className="snow"
          style={{
            left: f.left,
            width: f.size,
            height: f.size,
            "--dur": f.dur,
            "--delay": f.delay,
            "--drift": f.drift,
            "--snow-op": f.opacity,
          }}
        />
      ))}
      <div className={`ld-mark${a ? " in" : ""}`}>AT23</div>
      <div className={`ld-bar-wrap${a ? " in" : ""}`}>
        <div className={`ld-bar${a ? " in" : ""}`} />
      </div>
    </div>
  );
}

/* ── Hero ── */
function Hero({ onStory, storyOpen }) {
  const time = useIST(); const views = useViews();
  return (
    <section className="hero" id="hero">
      <AmbientPhoto />
      <FloatingSquares />
      <div style={{ position:"absolute", top:40, left:48, right:48, display:"flex", justifyContent:"space-between", alignItems:"flex-start", zIndex:3 }}>
        <div>
          <div style={{ fontFamily:"'Array',monospace", fontSize:"2.4rem", letterSpacing:".12em", textTransform:"uppercase", color:"#0A0A0B", lineHeight:1 }}>AT23</div>
          {views && <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".5rem", letterSpacing:".2em", textTransform:"uppercase", color:"#555", marginTop:7 }}>{views} visitors</div>}
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:12 }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".54rem", letterSpacing:".14em", color:"#555", textAlign:"right", lineHeight:1.7 }}>LOCAL TIME<br />{time} IST</div>
          {/* Renamed: "How I got here" → "My Journey So Far" */}
          <button className={`sb${storyOpen ? " on" : ""}`} onClick={onStory} data-cursor="Story">
            My Journey So Far
          </button>
        </div>
      </div>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", display:"flex", flexDirection:"column", alignItems:"center", zIndex:3 }}>
        <ParticleSathvik />
        <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:"clamp(.85rem,1.3vw,.95rem)", color:"#777", textAlign:"center", maxWidth:500, lineHeight:1.8, marginTop:22, padding:"0 16px" }}>
          Hey, I am Sathvik. I love building systems that simplify complex problems. Most recently, I built an end-to-end AI product for the Consumer Insights team, along with analytics and AI voice-agent workflows.
        </div>
      </div>

      {/* Influences diamond — mid-left, above where location box will sit */}
      <div style={{ position: "absolute", top: "38%", left: 48, transform: "translateY(-50%)", zIndex: 3 }}>
        <InfluencesDiamond />
      </div>
    </section>
  );
}

/* ── App ── */
export default function App() {
  const [phase, setPhase] = useState("init");
  const [show,  setShow]  = useState(false);
  const [story, setStory] = useState(false);
  useLenis();
  useGsapReveal();

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("active"),  300);
    const t2 = setTimeout(() => setPhase("fadeout"), 2600);
    const t3 = setTimeout(() => setShow(true),       2900);
    const t4 = setTimeout(() => setPhase("done"),    3400);
    return () => [t1,t2,t3,t4].forEach(clearTimeout);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <CursorPill />
      {phase !== "done" && <Loader phase={phase} />}
      <StoryPopup isOpen={story} onClose={() => setStory(false)} />
      <div style={{ opacity:show ? 1 : 0, transition:"opacity .55s ease" }}>
        <OrbMenu />
        <Hero onStory={() => setStory(s => !s)} storyOpen={story} />
        <Work />
        <Projects />
        <Writing />
        <Frames />
        <Footer />
      </div>
    </>
  );
}