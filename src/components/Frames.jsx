/* src/components/Frames.jsx */

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getLenis } from "./LenisProvider";

gsap.registerPlugin(ScrollTrigger);

const photoGlob = import.meta.glob(
  "../photos/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP}",
  { eager: true }
);
const PHOTOS = Object.values(photoGlob).map((m, i) => ({
  id:  `p${i}`,
  src: m.default,
}));

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

/* Load & save likes in localStorage — one integer per photo id */
function loadLikes() {
  try {
    return JSON.parse(localStorage.getItem("at23_likes") || "{}");
  } catch { return {}; }
}
function saveLikes(l) {
  try { localStorage.setItem("at23_likes", JSON.stringify(l)); } catch {}
}

/* Heart icon */
const Heart = ({ filled }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? "#e6396f" : "none"} stroke={filled ? "#e6396f" : "currentColor"} strokeWidth="2">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

/* ── Fullscreen photo viewer ── */
function PhotoView({ photo, likes, onLike, onClose }) {
  const ref = useRef();

  useEffect(() => {
    getLenis()?.stop();
    document.body.style.overflow = "hidden";
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    return () => { document.body.style.overflow = ""; getLenis()?.start(); };
  }, []);

  const close = () =>
    gsap.to(ref.current, { opacity: 0, duration: 0.22, ease: "power2.in", onComplete: onClose });

  const count = likes[photo.id] || 0;
  const liked = count > 0;

  return (
    <div ref={ref} onClick={close} style={{
      position: "fixed", inset: 0, zIndex: 990,
      background: "rgba(4,4,6,0.94)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 40,
    }}>
      <button onClick={close} style={{
        position: "fixed", top: 28, right: 40, zIndex: 3,
        background: "none", border: "none", cursor: "pointer",
        fontFamily: ARRAY, fontSize: "1.4rem", color: "#F9F9F7",
      }}>✕</button>

      <div onClick={e => e.stopPropagation()} style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        maxWidth: "90vw", maxHeight: "88vh", gap: 18,
      }}>
        <img src={photo.src} alt="" style={{
          maxWidth: "100%", maxHeight: "78vh", objectFit: "contain",
          boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
        }} />
        <button
          onClick={() => onLike(photo.id)}
          style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "9px 18px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 100, cursor: "pointer",
            fontFamily: MONO, fontSize: ".62rem", letterSpacing: ".14em",
            textTransform: "uppercase",
            color: liked ? "#e6396f" : "#F9F9F7",
            transition: "background .2s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
        >
          <Heart filled={liked} /> {count} {count === 1 ? "like" : "likes"}
        </button>
      </div>
    </div>
  );
}

export default function Frames() {
  const [likes, setLikes] = useState(loadLikes);
  const [openPhoto, setOpenPhoto] = useState(null);

  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const gridRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 82%" },
        }
      );
      gsap.fromTo(gridRef.current?.querySelectorAll(".ftile"),
        { opacity: 0, y: 22 },
        {
          opacity: 1, y: 0, duration: 0.55, stagger: 0.06, ease: "power2.out",
          scrollTrigger: { trigger: gridRef.current, start: "top 80%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const handleLike = (id) => {
    setLikes(prev => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      saveLikes(next);
      return next;
    });
  };

  if (!PHOTOS.length) return null;

  return (
    <section ref={sectionRef} id="frames"
      style={{ background: "#F9F9F7", padding: "120px 56px 100px", borderTop: "1px solid #ECEAE4" }}
    >
      <div ref={headingRef} style={{
        display: "flex", justifyContent: "space-between", alignItems: "baseline",
        marginBottom: 56, maxWidth: 1400, margin: "0 auto 56px",
      }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: ".6rem", letterSpacing: ".28em", textTransform: "uppercase", color: "#666", marginBottom: 10, fontWeight: 700 }}>
            Photography
          </div>
          <div style={{ fontFamily: ARRAY, fontSize: "clamp(2.6rem,5.5vw,4.4rem)", letterSpacing: ".04em", textTransform: "uppercase", color: "#0A0A0B", lineHeight: 1 }}>
            Frames
          </div>
        </div>
        <div style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: ".92rem", color: "#666", maxWidth: 280, textAlign: "right", lineHeight: 1.7 }}>
          Things I saw and thought were worth keeping.
        </div>
      </div>

      <div ref={gridRef} style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 12,
        maxWidth: 1400, margin: "0 auto",
      }}>
        {PHOTOS.map(p => {
          const count = likes[p.id] || 0;
          return (
            <div
              key={p.id}
              className="ftile"
              onClick={() => setOpenPhoto(p)}
              data-cursor="Open"
              style={{
                position: "relative",
                aspectRatio: "4/3",
                overflow: "hidden",
                background: "#ECEAE4",
                cursor: "pointer",
                opacity: 0,
              }}
              onMouseEnter={e => {
                e.currentTarget.querySelector("img").style.transform = "scale(1.05)";
                e.currentTarget.querySelector(".flike").style.opacity = "1";
              }}
              onMouseLeave={e => {
                e.currentTarget.querySelector("img").style.transform = "";
                e.currentTarget.querySelector(".flike").style.opacity = count > 0 ? "1" : "0";
              }}
            >
              <img src={p.src} alt="" draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block",
                  transition: "transform .5s ease" }}
              />
              <div
                className="flike"
                style={{
                  position: "absolute", bottom: 10, right: 10,
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "4px 10px", borderRadius: 100,
                  background: "rgba(0,0,0,0.55)",
                  color: count > 0 ? "#e6396f" : "#F9F9F7",
                  fontFamily: MONO, fontSize: ".5rem", letterSpacing: ".12em",
                  textTransform: "uppercase",
                  opacity: count > 0 ? 1 : 0,
                  transition: "opacity .2s",
                }}
              >
                <Heart filled={count > 0} /> {count}
              </div>
            </div>
          );
        })}
      </div>

      {openPhoto && (
        <PhotoView
          photo={openPhoto}
          likes={likes}
          onLike={handleLike}
          onClose={() => setOpenPhoto(null)}
        />
      )}
    </section>
  );
}