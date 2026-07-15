/* src/components/Projects.jsx */

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ARRAY = "'Array', monospace";
const MONO  = "'Space Mono', monospace";
const NIPPO = "'Nippo', sans-serif";

export default function Projects() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);
  const cardRef    = useRef(null);
  const noteRef    = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(headingRef.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1, y: 0, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: headingRef.current, start: "top 82%" },
        }
      );
      gsap.fromTo(cardRef.current,
        { opacity: 0, y: 22 },
        {
          opacity: 1, y: 0, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: cardRef.current, start: "top 82%" },
        }
      );
      gsap.fromTo(noteRef.current,
        { opacity: 0 },
        {
          opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.15,
          scrollTrigger: { trigger: noteRef.current, start: "top 82%" },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="projects" style={{
      background: "#F9F9F7", padding: "120px 56px 100px", borderTop: "1px solid #ECEAE4",
    }}>
      {/* Subtle outer container outline */}
      <div style={{
        maxWidth: 1400, margin: "0 auto",
        border: "1px solid #ECEAE4", borderRadius: 12,
        padding: "72px 60px 80px",
        background: "#F9F9F7",
      }}>
        <div ref={headingRef} style={{ marginBottom: 64 }}>
          <div style={{ fontFamily: MONO, fontSize: ".6rem", letterSpacing: ".28em", textTransform: "uppercase", color: "#666", marginBottom: 10, fontWeight: 700 }}>
            Building
          </div>
          <div style={{ fontFamily: ARRAY, fontSize: "clamp(2.6rem,5.5vw,4.4rem)", letterSpacing: ".04em", textTransform: "uppercase", color: "#0A0A0B", lineHeight: 1 }}>
            Projects
          </div>
        </div>

        {/* Single Miso Labs card */}
        <div
          ref={cardRef}
          data-cursor="In Progress"
          style={{
            border: "1px solid #0A0A0B",
            padding: "36px 32px",
            maxWidth: 420,
            marginBottom: 32,
            cursor: "pointer",
            background: "#F9F9F7",
            transition: "background .2s, transform .2s",
            opacity: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#0A0A0B";
            e.currentTarget.querySelector(".pn").style.color   = "#F9F9F7";
            e.currentTarget.querySelector(".pname").style.color = "#F9F9F7";
            e.currentTarget.querySelector(".pdesc").style.color = "#888";
            e.currentTarget.querySelector(".ptag").style.color  = "#9333EA";
            e.currentTarget.querySelector(".ptag").style.borderColor = "#9333EA";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#F9F9F7";
            e.currentTarget.querySelector(".pn").style.color   = "#666";
            e.currentTarget.querySelector(".pname").style.color = "#0A0A0B";
            e.currentTarget.querySelector(".pdesc").style.color = "#666";
            e.currentTarget.querySelector(".ptag").style.color  = "#0A0A0B";
            e.currentTarget.querySelector(".ptag").style.borderColor = "#0A0A0B";
          }}
        >
          <div className="pn" style={{
            fontFamily: MONO, fontSize: ".54rem", letterSpacing: ".22em",
            textTransform: "uppercase", color: "#666", marginBottom: 14, fontWeight: 700,
            transition: "color .2s",
          }}>
            01
          </div>
          <div className="pname" style={{
            fontFamily: ARRAY, fontSize: "1.8rem", letterSpacing: ".03em",
            textTransform: "uppercase", color: "#0A0A0B", marginBottom: 16, lineHeight: 1.1,
            transition: "color .2s",
          }}>
            Miso Labs
          </div>
          <div className="pdesc" style={{
            fontFamily: NIPPO, fontWeight: 300, fontSize: ".95rem",
            color: "#666", lineHeight: 1.7, marginBottom: 20,
            transition: "color .2s",
          }}>
            Building.
          </div>
          <span className="ptag" style={{
            display: "inline-block",
            fontFamily: MONO, fontSize: ".5rem", letterSpacing: ".18em",
            textTransform: "uppercase", color: "#0A0A0B",
            border: "1px solid #0A0A0B", padding: "5px 12px",
            transition: "color .2s, border-color .2s",
          }}>
            In Progress
          </span>
        </div>

        {/* Simple note — no empty boxes */}
        <div ref={noteRef} style={{
          fontFamily: MONO, fontSize: ".58rem", letterSpacing: ".22em",
          textTransform: "uppercase", color: "#999", fontWeight: 600,
          opacity: 0,
        }}>
          — More coming soon
        </div>
      </div>
    </section>
  );
}