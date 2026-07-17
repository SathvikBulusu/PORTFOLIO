/* src/components/LocationBox.jsx
   Uses /public/world.svg. Samples points inside continent paths → renders
   as animated particles with mouse-interaction physics (matches SATHVIK).
*/

import { useState, useRef, useEffect } from "react";

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

/* India popup location — SVG coordinates.
   TUNE THESE two numbers to place the purple dot on the map. */
const INDIA_X = 720;   /* fraction of svg width  * viewBox width */
const INDIA_Y = 220;   /* fraction of svg height * viewBox height */

export default function LocationBox() {
  const [open, setOpen] = useState(false);
  const [particles, setParticles] = useState([]);
  const [viewBox, setViewBox] = useState({ w: 1000, h: 500 });
  const canvasRef = useRef(null);
  const wrapRef   = useRef(null);
  const rafRef    = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });

  /* Load SVG, extract land points via isPointInFill */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/world.svg");
        const svgText = await res.text();

        /* Parse into a hidden dom SVG */
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, "image/svg+xml");
        const src = doc.querySelector("svg");
        if (!src) return;

        /* Read viewBox */
        const vb = src.getAttribute("viewBox")?.split(/\s+/).map(Number)
                || [0, 0, 1000, 500];
        const [, , vbW, vbH] = vb;

        /* Attach to body invisibly so isPointInFill works */
        const stage = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        stage.setAttribute("viewBox", `0 0 ${vbW} ${vbH}`);
        stage.style.position = "absolute";
        stage.style.visibility = "hidden";
        stage.style.width  = `${vbW}px`;
        stage.style.height = `${vbH}px`;
        Array.from(src.querySelectorAll("path")).forEach(p => stage.appendChild(p.cloneNode()));
        document.body.appendChild(stage);

        /* Sample grid — density tuned to look like SATHVIK letters.
           STEP smaller = more dots. */
        const STEP = Math.max(8, Math.round(vbW / 130));
        const paths = Array.from(stage.querySelectorAll("path"));
        const pts = [];
        for (let y = 0; y < vbH; y += STEP) {
          for (let x = 0; x < vbW; x += STEP) {
            const pt = new DOMPoint(x, y);
            for (const p of paths) {
              try {
                if (p.isPointInFill(pt)) {
                  pts.push({
                    x, y,
                    homeX: x, homeY: y,
                    vx: 0, vy: 0,
                  });
                  break;
                }
              } catch (e) {/* some paths lack fill */}
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

  /* Physics loop — springs each dot back to home, repels mouse */
  useEffect(() => {
    if (!particles.length || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    /* Render size: fixed CSS width, keep aspect from viewBox */
    const CSS_W = 380;
    const CSS_H = Math.round(CSS_W * viewBox.h / viewBox.w);
    canvas.style.width  = `${CSS_W}px`;
    canvas.style.height = `${CSS_H}px`;
    canvas.width  = Math.round(CSS_W * dpr);
    canvas.height = Math.round(CSS_H * dpr);

    /* Scale from viewBox → canvas pixels */
    const sx = canvas.width  / viewBox.w;
    const sy = canvas.height / viewBox.h;

    /* Mouse listener — track in canvas coords */
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
      const indiaCx = INDIA_X * sx, indiaCy = INDIA_Y * sy;

      for (const p of particles) {
        const px = p.x * sx, py = p.y * sy;

        /* Mouse repel */
        const dx = px - mx, dy = py - my;
        const d2 = dx*dx + dy*dy;
        if (d2 < REPEL_R * REPEL_R && d2 > 0) {
          const d = Math.sqrt(d2);
          const f = ((REPEL_R - d) / REPEL_R) * REPEL;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        /* Spring back to home */
        p.vx += (p.homeX - p.x) * SPRING;
        p.vy += (p.homeY - p.y) * SPRING;
        p.vx *= DAMP; p.vy *= DAMP;
        p.x  += p.vx / sx;
        p.y  += p.vy / sy;

        ctx.fillStyle = "rgba(10,10,11,0.55)";
        ctx.beginPath();
        ctx.arc(p.x * sx, p.y * sy, 1.4 * dpr, 0, Math.PI * 2);
        ctx.fill();
      }

      /* India — purple pulsing dot */
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

  /* India dot click detection */
  const onCanvasClick = e => {
    const r = canvasRef.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width  * viewBox.w;
    const py = (e.clientY - r.top)  / r.height * viewBox.h;
    const HIT = 40;
    if (Math.abs(px - INDIA_X) < HIT && Math.abs(py - INDIA_Y) < HIT) {
      setOpen(o => !o);
    }
  };

  /* Close popup on outside click */
  useEffect(() => {
    if (!open) return;
    const close = e => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const canvasW = 380;
  const canvasH = Math.round(canvasW * viewBox.h / viewBox.w);
  const popupLeft = (INDIA_X / viewBox.w) * canvasW - 130;

  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <div style={{
        padding: 10,
        background: "rgba(10,10,11,0.03)",
        border: "1px solid rgba(10,10,11,0.08)",
        borderRadius: 10,
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
          left: popupLeft,
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
            position: "absolute", top: "100%", left: 130,
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