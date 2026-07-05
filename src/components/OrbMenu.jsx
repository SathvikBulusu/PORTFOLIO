import { useState, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import gsap from "gsap";

const photoGlob = import.meta.glob("../photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}", { eager:true });
const PHOTOS = Object.values(photoGlob).map(m => m.default);

/* ── Orb geometry — dark outer, purple inner, driven by R3F's render loop ── */
function OrbMesh() {
  const outerRef = useRef();
  const innerRef = useRef();

  useFrame((_, delta) => {
    if (outerRef.current) {
      outerRef.current.rotation.x += delta * 0.14;
      outerRef.current.rotation.y += delta * 0.22;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x -= delta * 0.28;
      innerRef.current.rotation.y -= delta * 0.32;
    }
  });

  return (
    <group>
      <lineSegments ref={outerRef}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(1.8, 1)]} />
        <lineBasicMaterial color="#0A0A0B" transparent opacity={0.5} />
      </lineSegments>
      <lineSegments ref={innerRef}>
        <edgesGeometry args={[new THREE.IcosahedronGeometry(1.1, 0)]} />
        <lineBasicMaterial color="#9333EA" transparent opacity={0.95} />
      </lineSegments>
    </group>
  );
}

function OrbCanvas({ size = 110 }) {
  return (
    <Canvas
      camera={{ position:[0,0,3.5], fov:60 }}
      style={{ width:size, height:size, filter:"drop-shadow(0 0 14px rgba(147,51,234,0.5))" }}
      gl={{ alpha:true, antialias:true }}
    >
      <OrbMesh />
    </Canvas>
  );
}

/* ── OrbMenu — trigger + popup, one module. Orb visible from page load. ── */
export default function OrbMenu() {
  const [open, setOpen] = useState(false);
  const popupRef = useRef(null);
  const orbRef   = useRef(null);
  const filmRef  = useRef(null);

  /* Orb entrance — plays once on mount, not gated behind hero scroll */
  useEffect(() => {
    gsap.fromTo(orbRef.current,
      { opacity:0, scale:0.7 },
      { opacity:1, scale:1, duration:0.9, delay:2.7, ease:"back.out(1.7)" }
    );
  }, []);

  /* Popup open/close — GSAP timeline, not CSS transition */
  useEffect(() => {
    if (!popupRef.current) return;
    if (open) {
      gsap.to(popupRef.current, { autoAlpha:1, duration:0.4, ease:"power2.out" });
      gsap.fromTo(popupRef.current.querySelectorAll(".orb-item"),
        { opacity:0, y:20 },
        { opacity:1, y:0, duration:0.5, stagger:0.05, delay:0.15, ease:"power2.out" }
      );
    } else {
      gsap.to(popupRef.current, { autoAlpha:0, duration:0.3, ease:"power2.in" });
    }
  }, [open]);

  const onMouseDown = e => {
    const el = filmRef.current; if (!el) return;
    const sx = e.pageX - el.offsetLeft, ss = el.scrollLeft;
    const mv = ev => { el.scrollLeft = ss - (ev.pageX - el.offsetLeft - sx); };
    const up = () => { window.removeEventListener("mousemove",mv); window.removeEventListener("mouseup",up); };
    window.addEventListener("mousemove", mv);
    window.addEventListener("mouseup", up);
  };

  return (
    <>
      {/* Orb trigger — fixed bottom-right, visible from page one */}
      <div
        ref={orbRef}
        data-cursor="Explore"
        onClick={() => setOpen(true)}
        style={{
          position:"fixed", bottom:28, right:28, zIndex:800,
          display:"flex", flexDirection:"column", alignItems:"center", gap:6,
          cursor:"pointer", opacity:0,
        }}
      >
        <OrbCanvas size={110} />
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:".5rem", letterSpacing:".24em", textTransform:"uppercase", color:"#888" }}>
          Menu
        </span>
      </div>

      {/* Popup — glassy black, GSAP-driven */}
      <div
        ref={popupRef}
        style={{
          position:"fixed", inset:0,
          background:"linear-gradient(135deg,rgba(6,6,10,0.97) 0%,rgba(4,4,8,0.98) 100%)",
          backdropFilter:"blur(36px)", WebkitBackdropFilter:"blur(36px)",
          zIndex:850, opacity:0, visibility:"hidden", overflow:"hidden",
        }}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            position:"absolute", top:36, right:48,
            fontFamily:"'Array',monospace", fontSize:"1.4rem", letterSpacing:".06em",
            textTransform:"uppercase", color:"#F9F9F7", background:"none", border:"none",
            cursor:"pointer", transition:"color .2s",
          }}
          onMouseEnter={e=>e.target.style.color="#555"}
          onMouseLeave={e=>e.target.style.color="#F9F9F7"}
        >
          Close x
        </button>

        <div style={{ height:"100%", display:"flex", flexDirection:"column", padding:"80px 48px 48px", overflow:"hidden" }}>
          <div className="orb-item" style={{ fontFamily:"'Array',monospace", fontSize:"1.4rem", color:"#F9F9F7", letterSpacing:".1em", marginBottom:32 }}>
            AT23
          </div>

          {/* Frames — heading, same weight as Work/Writing */}
          {PHOTOS.length > 0 && (
            <div className="orb-item" style={{ marginBottom:36, flexShrink:0 }}>
              <div style={{ fontFamily:"'Array',monospace", fontSize:"1.1rem", color:"#666", letterSpacing:".04em", textTransform:"uppercase", marginBottom:12 }}>
                Frames
              </div>
              <div ref={filmRef} onMouseDown={onMouseDown}
                style={{ display:"flex", gap:8, overflowX:"auto", scrollbarWidth:"none", cursor:"grab" }}>
                {PHOTOS.map((src,i) => (
                  <div key={i} data-cursor={`Frame ${String(i+1).padStart(2,"0")}`}
                    style={{ flexShrink:0, width:"clamp(150px,22vw,260px)", aspectRatio:"3/2", border:"1px solid rgba(255,255,255,0.06)", overflow:"hidden" }}>
                    <img src={src} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", opacity:.75, display:"block" }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation — Work / Writing / Projects */}
          <div style={{ display:"flex", flexDirection:"column", gap:0, marginBottom:28 }}>
            {[
              { l:"Work",     h:"#work" },
              { l:"Projects", h:"#projects" },
              { l:"Writing",  h:"#writing" },
            ].map(({l,h}) => (
              <a key={l} href={h} onClick={()=>setOpen(false)}
                className="orb-item" data-cursor={l}
                style={{ fontFamily:"'Array',monospace", fontSize:"clamp(2.2rem,5vw,4rem)", color:"#F9F9F7", textDecoration:"none", letterSpacing:".03em", textTransform:"uppercase", lineHeight:1.1, display:"block", transition:"color .2s" }}
                onMouseEnter={e=>e.target.style.color="#555"}
                onMouseLeave={e=>e.target.style.color="#F9F9F7"}
              >{l}</a>
            ))}
          </div>

          {/* Contact — ALL of it lives here now, nowhere else on the site */}
          <div className="orb-item" style={{ marginTop:"auto", paddingTop:20, borderTop:"1px solid rgba(255,255,255,0.06)", display:"flex", gap:28, flexWrap:"wrap" }}>
            {[
              { l:"LinkedIn", h:"https://linkedin.com/in/sathvikbulusu" },
              { l:"GitHub",   h:"https://github.com/yourusername" },
              { l:"Resume",   h:"/resume.pdf" },
              { l:"Email",    h:"mailto:your@email.com" },
            ].map(({l,h}) => (
              <a key={l} href={h} target="_blank" rel="noopener noreferrer" data-cursor={l}
                style={{ fontFamily:"'Space Mono',monospace", fontSize:".62rem", letterSpacing:".16em", textTransform:"uppercase", color:"#666", textDecoration:"none", transition:"color .2s" }}
                onMouseEnter={e=>e.target.style.color="#F9F9F7"}
                onMouseLeave={e=>e.target.style.color="#666"}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}