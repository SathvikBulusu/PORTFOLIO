/* src/components/LocationBox.jsx */
import { useState, useRef, useEffect } from "react";

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

/* ⚠️ PUT YOUR DEVTOLS COORDINATES HERE ⚠️ */
const INDIA_X = 691; 
const INDIA_Y = 414; 

export default function LocationBox() {
  const [open, setOpen] = useState(false);
  const [particles, setParticles] = useState([]);
  const [viewBox, setViewBox] = useState({ w: 1000, h: 500 });
  
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const rafRef    = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });
  
  const transformRef = useRef({ sx: 1, sy: 1, panX: 0, panY: 0, dpr: 1 });

  /* 1. Load SVG, extract land points */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/world.svg");
        const svgText = await res.text();

        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const src = doc.querySelector("svg");
        if (!src) return;

        const vb = src.getAttribute("viewBox")?.split(/\s+/).map(Number) || [0, 0, 1000, 500];
        const [, , vbW, vbH] = vb;

        const stage = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        stage.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
        stage.style.position = "absolute";
        stage.style.visibility = "hidden";
        stage.style.width  = `${vbW}px`;
        stage.style.height = `${vbH}px`;
        Array.from(src.querySelectorAll("path")).forEach(p => stage.appendChild(p.cloneNode()));
        document.body.appendChild(stage);

        const STEP = 5; 
        const paths = Array.from(stage.querySelectorAll("path"));
        const pts = [];
        
        for (let y = 0; y < vbH; y += STEP) {
          for (let x = 0; x < vbW; x += STEP) {
            const pt = new DOMPoint(x, y);
            for (const p of paths) {
              try {
                if (p.isPointInFill(pt)) {
                  pts.push({ x, y, homeX: x, homeY: y, vx: 0, vy: 0 });
                  break;
                }
              } catch (e) {}
            }
          }
        }

        document.body.removeChild(stage);
        if (!cancelled) {
          setViewBox({ w: vbW, h: vbH });
          setParticles(pts);
        }
      } catch (e) {
        console.error("world.svg load failed:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /* 2. Physics loop */
  useEffect(() => {
    if (!particles.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* ---> REDUCED SIZE TO 290PX TO MATCH THE RIGHT-HAND SIDE ORB <--- */
    const CSS_W = 290; 
    const CSS_H = Math.round(CSS_W * viewBox.h / viewBox.w);
    canvas.style.width  = `${CSS_W}px`;
    canvas.style.height = `${CSS_H}px`;
    canvas.width  = Math.round(CSS_W * dpr);
    canvas.height = Math.round(CSS_H * dpr);

    const baseSx = canvas.width  / viewBox.w;
    const baseSy = canvas.height / viewBox.h;
    
    const ZOOM = 2.8; 
    const sx = baseSx * ZOOM;
    const sy = baseSy * ZOOM;

    const PAN_X = (canvas.width * 0.40) - (INDIA_X * sx);
    const PAN_Y = (canvas.height * 0.50) - (INDIA_Y * sy);

    transformRef.current = { sx, sy, panX: PAN_X, panY: PAN_Y, dpr };

    const onMove = e => {
      const r = canvas.getBoundingClientRect();
      mouseRef.current.x = (e.clientX - r.left) * dpr;
      mouseRef.current.y = (e.clientY - r.top)  * dpr;
    };
    const onLeave = () => { mouseRef.current.x = -9999; mouseRef.current.y = -9999; };
    
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const REPEL_R = 40 * dpr;
    const REPEL   = 3.0;
    const SPRING  = 0.09;
    const DAMP    = 0.80;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouseRef.current.x, my = mouseRef.current.y;
      
      const indiaCx = (INDIA_X * sx) + PAN_X;
      const indiaCy = (INDIA_Y * sy) + PAN_Y;

      for (const p of particles) {
        const px = (p.x * sx) + PAN_X;
        const py = (p.y * sy) + PAN_Y;

        const dx = px - mx, dy = py - my;
        const d2 = dx*dx + dy*dy;
        if (d2 < REPEL_R * REPEL_R && d2 > 0) {
          const d = Math.sqrt(d2);
          const f = ((REPEL_R - d) / REPEL_R) * REPEL;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        p.vx += (p.homeX - p.x) * SPRING;
        p.vy += (p.homeY - p.y) * SPRING;
        p.vx *= DAMP; p.vy *= DAMP;
        p.x  += p.vx / sx;
        p.y  += p.vy / sy;

        ctx.fillStyle = "rgba(10,10,11,0.55)";
        ctx.beginPath();
        ctx.arc((p.x * sx) + PAN_X, (p.y * sy) + PAN_Y, 1.1 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      const t = performance.now() / 1000;
      const pulse = 1 + Math.sin(t * 2.4) * 0.3;

      ctx.fillStyle = "rgba(147,51,234,0.28)";
      ctx.beginPath();
      ctx.arc(indiaCx, indiaCy, 7 * dpr * pulse, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#9333EA";
      ctx.shadowColor = "#9333EA"; ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(indiaCx, indiaCy, 3 * dpr, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [particles, viewBox]);

  /* 3. Click detection with coordinate logger retained */
  const onCanvasClick = e => {
    const r = canvasRef.current.getBoundingClientRect();
    const { sx, sy, panX, panY, dpr } = transformRef.current;
    
    const clickX = (e.clientX - r.left) * dpr;
    const clickY = (e.clientY - r.top)  * dpr;

    const px = (clickX - panX) / sx;
    const py = (clickY - panY) / sy;
    
    console.log(`📍 Map clicked! Set INDIA_X = ${Math.round(px)} and INDIA_Y = ${Math.round(py)}`);
    
    const HIT = 40; 
    if (Math.abs(px - INDIA_X) < HIT && Math.abs(py - INDIA_Y) < HIT) {
      setOpen(o => !o);
    }
  };

  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div 
      ref={wrapRef} 
      style={{ 
        position: "relative", 
        display: "inline-block",
        /* ---> PUSH THE WHOLE COMPONENT UP (Change -30px to tweak height) <--- */
        transform: "translateY(-30px)" 
      }}
    >
      <div style={{
        padding: 0,
        background: "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(240,238,230,0.78) 100%)",
        border: "1px solid rgba(10,10,11,0.14)",
        borderRadius: 14,
        boxShadow:
          "0 20px 44px rgba(10,10,11,0.18)," +
          "0 6px 14px rgba(10,10,11,0.08)," +
          "inset 0 1px 0 rgba(255,255,255,0.95)," +
          "inset 0 -1px 0 rgba(10,10,11,0.06)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        overflow: "hidden", 
      }}>
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          style={{ display: "block", cursor: "crosshair" }}
        />
      </div>

      {open && (
        <div style={{
          position: "absolute",
          bottom: `calc(100% + 12px)`,
          left: "calc(40% - 120px)", 
          zIndex: 10,
          background: "#0A0A0B",
          border: "1px solid #9333EA",
          borderRadius: 10,
          padding: "12px 16px",
          minWidth: 240,
          boxShadow: "0 12px 32px rgba(147,51,234,0.35), 0 6px 16px rgba(0,0,0,0.4)",
        }}>
          <div style={{ fontFamily: ARRAY, fontSize: ".82rem", letterSpacing: ".06em", textTransform: "uppercase", color: "#F9F9F7", fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🇮🇳</span> Bangalore, India
          </div>
          <div style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: ".8rem", color: "#c8b5e8", lineHeight: 1.55 }}>
            If you're in Bangalore, hit me up. Let's grab coffee.
          </div>
          <div style={{
            position: "absolute", top: "100%", left: 114,
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