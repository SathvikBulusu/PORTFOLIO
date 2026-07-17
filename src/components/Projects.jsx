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
        border: "1px solid rgba(10,10,11,0.15)",
        borderRadius: 14,
        padding: "72px 60px 80px",
        background: "linear-gradient(180deg, #FBFAF7 0%, #F5F3EE 100%)",
        boxShadow: "0 24px 60px rgba(10,10,11,0.08), 0 8px 20px rgba(10,10,11,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        <div ref={headingRef} style={{ marginBottom: 64, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: ".6rem", letterSpacing: ".28em", textTransform: "uppercase", color: "#666", marginBottom: 10, fontWeight: 700 }}>
            Building
          </div>
          <div style={{ fontFamily: ARRAY, fontSize: "clamp(2.6rem,5.5vw,4.4rem)", letterSpacing: ".04em", textTransform: "uppercase", color: "#0A0A0B", lineHeight: 1 }}>
            Projects
          </div>
        </div>

        {/* Single Miso Labs card — centered */}
        <div
          ref={cardRef}
          data-cursor="In Progress"
          style={{
            border: "1.5px solid #0A0A0B",
            padding: "36px 32px",
            width: "100%", maxWidth: 420,
            marginBottom: 32,
            cursor: "pointer",
            background: "linear-gradient(180deg, #FFFFFF 0%, #F5F3EE 100%)",
            borderRadius: 6,
            boxShadow: "0 18px 40px rgba(10,10,11,0.16), 0 6px 14px rgba(10,10,11,0.10), inset 0 1px 0 rgba(255,255,255,0.9)",
            transition: "background .2s, transform .2s, box-shadow .2s",
            opacity: 0,
            textAlign: "center",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#0A0A0B";
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 20px 48px rgba(10,10,11,0.25), 0 6px 18px rgba(10,10,11,0.15)";
            e.currentTarget.querySelector(".pn").style.color   = "#F9F9F7";
            e.currentTarget.querySelector(".pname").style.color = "#F9F9F7";
            e.currentTarget.querySelector(".pdesc").style.color = "#888";
            e.currentTarget.querySelector(".ptag").style.color  = "#9333EA";
            e.currentTarget.querySelector(".ptag").style.borderColor = "#9333EA";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#F9F9F7";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 12px 32px rgba(10,10,11,0.10), 0 4px 12px rgba(10,10,11,0.06)";
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