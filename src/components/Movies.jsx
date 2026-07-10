/* src/components/Movies.jsx
   Shows & Recommendations — fill in your actual titles below.
   Structure: category → entries with title + why.
*/

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

/* ═══════════════════════════════════════════════════════════════
   YOUR LISTS — fill these in.
   Each entry: { title: string, why: string }
═══════════════════════════════════════════════════════════════ */
const ANIME = [
  { title: "— add title —", why: "Add why you like it here." },
];

const SERIES = [
  { title: "— add title —", why: "Add why you like it here." },
];

const FILMS = [
  { title: "— add title —", why: "Add why you like it here." },
];

const CATEGORIES = [
  { key: "anime",  label: "Anime",  entries: ANIME  },
  { key: "series", label: "Series", entries: SERIES },
  { key: "films",  label: "Films",  entries: FILMS  },
];

/* ── Single recommendation card ── */
function Card({ title, why, i }) {
  return (
    <div
      className="rec-card"
      style={{
        paddingBottom: 28, marginBottom: 28,
        borderBottom: "1px solid #ECEAE4",
        opacity: 0,
      }}
    >
      <div style={{
        display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8,
      }}>
        <span style={{
          fontFamily: MONO, fontSize: ".48rem", color: "#ccc",
          letterSpacing: ".16em",
        }}>
          {String(i + 1).padStart(2, "0")}
        </span>
        <span style={{
          fontFamily: ARRAY, fontSize: "1.25rem", letterSpacing: ".03em",
          textTransform: "uppercase", color: "#0A0A0B",
        }}>
          {title}
        </span>
      </div>
      <div style={{
        fontFamily: NIPPO, fontWeight: 300, fontSize: ".92rem",
        color: "#666", lineHeight: 1.75, paddingLeft: 30,
      }}>
        {why}
      </div>
    </div>
  );
}

/* ── One category column ── */
function Category({ label, entries, colRef }) {
  return (
    <div ref={colRef} style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: MONO, fontSize: ".56rem", letterSpacing: ".26em",
        textTransform: "uppercase", color: "#999", marginBottom: 28,
        paddingBottom: 14, borderBottom: "1px solid #ECEAE4",
      }}>
        {label}
      </div>
      {entries.map((e, i) => <Card key={e.title + i} title={e.title} why={e.why} i={i} />)}
    </div>
  );
}

export default function Movies() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const col1Ref    = useRef(null);
  const col2Ref    = useRef(null);
  const col3Ref    = useRef(null);
  const colRefs    = [col1Ref, col2Ref, col3Ref];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 82%" },
        }
      );
      colRefs.forEach((ref, i) => {
        if (!ref.current) return;
        gsap.fromTo(ref.current.querySelectorAll(".rec-card"),
          { opacity: 0, y: 16 },
          {
            opacity: 1, y: 0, duration: 0.5, stagger: 0.07, ease: "power2.out",
            scrollTrigger: { trigger: ref.current, start: "top 78%" },
            delay: i * 0.08,
          }
        );
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="movies"
      style={{
        background: "#F9F9F7", padding: "120px 48px 100px",
        borderTop: "1px solid #ECEAE4",
      }}
    >
      {/* Heading */}
      <div ref={headingRef} style={{ marginBottom: 64 }}>
        <div style={{
          fontFamily: MONO, fontSize: ".58rem", letterSpacing: ".28em",
          textTransform: "uppercase", color: "#999", marginBottom: 10,
        }}>
          Recommendations
        </div>
        <div style={{
          fontFamily: ARRAY, fontSize: "clamp(2.4rem,5vw,4rem)",
          letterSpacing: ".04em", textTransform: "uppercase", color: "#0A0A0B",
          lineHeight: 1,
        }}>
          What I Watch
        </div>
      </div>

      {/* 3-column grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "0 48px",
        maxWidth: 1100,
      }}>
        {CATEGORIES.map((cat, i) => (
          <Category
            key={cat.key}
            label={cat.label}
            entries={cat.entries}
            colRef={colRefs[i]}
          />
        ))}
      </div>
    </section>
  );
}