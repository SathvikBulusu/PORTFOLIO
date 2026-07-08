import { useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { getLenis } from "./LenisProvider";
import { useWorkFlow } from "./useWorkFlow";
import PrimaDiagram from "./PrimaDiagram";
import mvLogo from "../images/mv.jpg";

const MV_LOGO = mvLogo;

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */

const ORIGIN_STORY = {
  heading: "The Experience",
  body: " I joined Moneyview's Consumer Insights team to understand how primary & research actually worked before building AI Automations. Spent the first 2 Months in the process of learning how qualitative studies ran, where responses got manually coded, where time actually disappeared. Parallely Started Exploring Voice Agents Along this path and i realised there's no AI infrasturcture for the CI Team, So i started getting accesses to build the foundation first: LLM provider accesses(Gemini, Claude & Open Source Models ( Qwen 3.5 thinking , Nvidia Nemotron , llama3.1 etc)), cloud tooling(Bigquery,GCP).Got set up on Metabase, BigQuery, Cloud Anix, and Confluence. Then started building things that actually mattered.",
};

const AI_TAGS = ["Python", "Multi LLM Support", "Async Processing", "Next Js","Shadcn","Analaytics"];

const PRIMA_ENTRY = {
  name: "PRIMA",
  problem: "A typical research study means 300–500 people answering 15–20 open-ended questions. Every response needs manual classification. Before PRIMA, that meant one of three things: a team hand-coding responses for days, a colleague's fragile one-column Google Sheets script, or pasting into ChatGPT with no structure, no batching, and no cost tracking.",
  solution: "The strategy was to build a provider-agnostic research platform with structured outputs at the center — not a ChatGPT wrapper. Designed PRIMA around configurable few-shot prompts, enum-constrained JSON schema for consistent outputs, and server-side batch processing to eliminate the browser's 6-connection parallelism limit. Built as a proper product with project management, token cost tracking, and audit logs — something the team could hand off and run independently.",
  techniques: ["Multi-provider inference (Gemini/Claude/Ollama)", "Enum-constrained JSON schema", "Few-shot classification", "Server-side parallel processing", "Prompt caching via systemInstruction"],
  impact: [
    "71× faster after moving processing server-side — the same dataset went from 9.5 hours to 8 minutes once the browser's 6-connection limit stopped throttling parallelism.",
    "84% fewer reasoning tokens after tuning the model's thinking-level default, with zero accuracy loss on classification.",
    "Used by 6 researchers daily — replaced a process that used to take 2–3 days with one that takes minutes.",
  ],
};

/* Voice Agent sub-entries — Internal Tooling removed */
const VOICE_AGENT_ENTRIES = [
  {
    name: "AI Voice Agents",
    problem: "The team needed a scalable way to collect qualitative feedback without manually calling every user.",
    solution: "Built and optimised voice bot workflows for Product Retention and Superhome Drop-off — prompt design, extraction logic, and Metabase dashboards, processing 45,000+ calls.",
    why: "Voice is a different failure mode than text. I wanted to see where LLMs break when input is spoken and messy, not typed and clean.",
  },
  {
    name: "Transcript Intelligence",
    problem: "The internal transcript tool split identical issues into duplicate buckets — \"network issue\" and \"network issues\" — from unstructured prompting.",
    solution: "Rebuilt the pipeline with few-shot examples and JSON schema outputs on Gemini 2.5 Pro, producing one consistent taxonomy that fed straight into the support dashboard.",
    why: "This was a tool other people relied on every day. I wanted to fix what was actually broken, not just ship something new next to it.",
  },
  {
    name: "Cohort Splitter",
    problem: "Every study started the same way — 25 minutes of manual cohort-building before any actual research could begin. Same segmentation logic, different data, rebuilt by hand each time.",
    solution: "Automated the full pipeline. Define the parameters once, run it, cohorts ready in 20 seconds. Removed a recurring pre-study blocker from every researcher's workflow.",
    why: "The bottleneck kept showing up across projects. A one-time build was the only answer that actually scaled.",
  },
];

const ANALYTICS_TAGS = ["Streamlit", "Metabase", "BigQuery", "SQL"];

const ANALYTICS_ENTRIES = [
  {
    name: "Support Intelligence Dashboard",
    problem: "Leadership had no consolidated view of customer support trends across pre and post-disbursal issues.",
    solution: "Built a Streamlit dashboard combining LLM-categorised tickets with month-on-month trend analysis, directly informing a regional hiring decision by the Head of Customer Support.",
    why: "Analytics only matters if someone acts on it. I wanted to build something that changed a real decision, not a chart nobody opens.",
  },
  {
    name: "Income Cohort Dashboard",
    problem: "Senior researchers rebuilt income segmentation by hand for every new cohort study.",
    solution: "Built an automated dashboard that continuously updates income ranges across every Moneyview product for cohort analysis and questionnaire design.",
    why: "I wanted research teams spending their time on the questions, not reassembling the same spreadsheet.",
  },
  {
    name: "Women's Lending Cohort Dashboard",
    problem: "There was no clear internal view of repayment behaviour across user segments to guide marketing spend.",
    solution: "Built a Metabase dashboard surfacing repayment patterns from internal data, which directly informed a shift toward women-focused lending campaigns.",
    why: "I wanted a dashboard that stakeholders actually opened before making a call, not one built for its own sake.",
  },
  {
    name: "FGD Analytics Dashboard",
    problem: "Focus group research was scattered across individual files with no way to compare studies or track progress.",
    solution: "Built a centralised dashboard consolidating every FGD into one place for cross-study comparison and historical review.",
    why: "Research the team already did was getting lost. I wanted it to compound instead of disappearing after one report.",
  },
];

const RESEARCH_LINE =
  "Also led primary research across six other product areas — digital gold adoption, personal loan repeat behaviour, balance transfer drivers, credit accessibility, UPI activation, and partner ecosystem research — from survey design through stakeholder presentation.";

/* ─────────────────────────────────────────────────────────────
   STYLE TOKENS
───────────────────────────────────────────────────────────── */
const ARRAY = "'Array', monospace";
const NIPPO = "'Nippo', sans-serif";
const MONO  = "'Space Mono', monospace";

const SectionLabel = ({ text }) => (
  <div style={{
    fontFamily: MONO, fontSize: ".72rem", letterSpacing: ".16em",
    textTransform: "uppercase", color: "#555", fontWeight: 700, marginBottom: 8,
  }}>
    {text}
  </div>
);

const H2Block = ({ text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 36 }}>
    <div style={{ width: 3, minHeight: 34, background: "#9333EA", flexShrink: 0, borderRadius: 2 }} />
    <div style={{
      fontFamily: ARRAY, fontSize: "clamp(1.7rem,3vw,2.4rem)",
      letterSpacing: ".03em", textTransform: "uppercase",
      color: "#0A0A0B", fontWeight: 700,
    }}>
      {text}
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────── */
export default function Work() {
  const { step, category, open, transitionDone, select, back, close } = useWorkFlow();

  const waveOverlayRef      = useRef(null);
  const revealMaskRef       = useRef(null);
  const logoRef             = useRef(null);
  const catRef              = useRef(null);
  const detailRef           = useRef(null);
  const categoriesScrollRef = useRef(null);

  useEffect(() => {
    const lenis = getLenis();
    if (step === "closed") {
      lenis?.start();
      document.body.style.overflow = "";
    } else {
      lenis?.stop();
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [step]);

  useGSAP(() => {
    if (step !== "transitioning") return;
    gsap.set(waveOverlayRef.current, { autoAlpha: 0 });
    gsap.set(revealMaskRef.current, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(logoRef.current, { opacity: 0, scale: 0.8 });
    const DRAW_DUR = 2.6;
    const progress = { p: 0 };
    let logoTriggered = false;
    const tl = gsap.timeline({ onComplete: transitionDone });
    tl.to(waveOverlayRef.current, { autoAlpha: 1, duration: 0.5, ease: "power2.out" })
      .to(progress, {
        p: 100, duration: DRAW_DUR, ease: "power1.inOut",
        onUpdate: () => {
          const p = progress.p;
          revealMaskRef.current.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
          if (!logoTriggered && p >= 50) {
            logoTriggered = true;
            gsap.to(logoRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
          }
        },
      }, "+=0.15")
      .to({}, { duration: 0.6 })
      .to(waveOverlayRef.current, { autoAlpha: 0, duration: 0.55, ease: "power2.inOut" });
  }, { dependencies: [step] });

  useGSAP(() => {
    if (step === "categories" && catRef.current) {
      gsap.fromTo(
        Array.from(catRef.current.children).filter(c => !c.dataset.backdrop),
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, { dependencies: [step] });

  useGSAP(() => {
    if (step === "detail" && detailRef.current) {
      gsap.fromTo(detailRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }
  }, { dependencies: [step, category] });

  const hoverOn  = e => { e.currentTarget.style.borderColor="#F9F9F7"; e.currentTarget.style.background="rgba(255,255,255,0.11)"; };
  const hoverOff = e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.16)"; e.currentTarget.style.background="rgba(255,255,255,0.07)"; };

  const glassBox = {
    border: "1px solid rgba(255,255,255,0.16)", borderRadius: 12,
    padding: "32px 28px", background: "rgba(255,255,255,0.07)",
    backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
    boxShadow: "0 24px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
    transition: "border-color .2s, background .2s",
    boxSizing: "border-box",
  };

  /* Shared entry block for voice agents + analytics */
  const EntryBlock = ({ e, last = false }) => (
    <div style={{ marginBottom: last ? 0 : 44, paddingBottom: last ? 0 : 44, borderBottom: last ? "none" : "1px solid #ECEAE4" }}>
      <div style={{ fontFamily: ARRAY, fontSize: "1.5rem", letterSpacing: ".02em", textTransform: "uppercase", color: "#0A0A0B", fontWeight: 700, marginBottom: 18 }}>
        {e.name}
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel text="Problem" />
        <div style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: "1rem", color: "#444", lineHeight: 1.75 }}>{e.problem}</div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <SectionLabel text="Solution" />
        <div style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: "1rem", color: "#444", lineHeight: 1.75 }}>{e.solution}</div>
      </div>
      <div>
        <SectionLabel text="Why I did this" />
        <div style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: ".95rem", color: "#777", lineHeight: 1.75, fontStyle: "italic" }}>{e.why}</div>
      </div>
    </div>
  );

  return (
    <section id="work" style={{
      background: "#F9F9F7", padding: "140px 48px",
      borderTop: "1px solid #ECEAE4", position: "relative",
      overflow: "hidden", minHeight: "70vh",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>

      {/* Faint "Work Experience" bg text */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        fontFamily: ARRAY, fontSize: "clamp(3rem,11vw,10rem)",
        letterSpacing: ".05em", textTransform: "uppercase",
        color: "rgba(10,10,11,0.05)", whiteSpace: "nowrap",
        userSelect: "none", pointerEvents: "none",
      }}>
        Work Experience
      </div>

      <button onClick={open} data-cursor="Enter" style={{
        all: "unset", cursor: "pointer", position: "relative", zIndex: 2,
        fontFamily: ARRAY, fontSize: "clamp(2.4rem,7vw,5.5rem)",
        letterSpacing: ".04em", textTransform: "uppercase", color: "#0A0A0B",
      }}>
        Moneyview
      </button>

      {/* Wave transition overlay */}
      <div ref={waveOverlayRef} style={{
        position: "fixed", inset: 0, zIndex: 920, background: "#111111",
        pointerEvents: step === "transitioning" ? "auto" : "none",
        display: step === "transitioning" ? "block" : "none",
      }}>
        <div style={{ position: "absolute", top: "38%", left: 0, width: "100%", height: "24%", zIndex: 1 }}>
          <div ref={revealMaskRef} style={{ position: "absolute", inset: 0, clipPath: "inset(0 100% 0 0)" }}>
            <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wave-grad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="200">
                  <stop offset="0%"   stopColor="#4ADE80" />
                  <stop offset="30%"  stopColor="#4ADE80" />
                  <stop offset="70%"  stopColor="#FFFFFF" />
                  <stop offset="100%" stopColor="#FFFFFF" />
                </linearGradient>
              </defs>
              <path
                d="M0,100 C100,40 200,160 320,100 C420,50 480,150 560,100 C620,65 660,135 720,100 C820,45 900,155 1000,100 C1080,60 1140,120 1200,100"
                fill="none" stroke="url(#wave-grad)" strokeWidth="10" strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
        <div ref={logoRef} style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)",
          width: 92, height: 92, borderRadius: "50%", background: "#ffffff",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3,
        }}>
          {MV_LOGO
            ? <img src={MV_LOGO} alt="" style={{ width: 54, height: 54, objectFit: "contain" }} />
            : <span style={{ fontFamily: MONO, fontSize: ".62rem", color: "#4ADE80" }}>MV</span>
          }
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          CATEGORIES SCREEN
      ══════════════════════════════════════════════════════ */}
      {step === "categories" && (
        <div ref={categoriesScrollRef} data-lenis-prevent style={{
          position: "fixed", inset: 0, zIndex: 910,
          background: "#0F3D2A", overflowY: "auto",
        }}>
          <button onClick={close} data-cursor="Close" style={{
            position: "fixed", top: 36, right: 48,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: ARRAY, fontSize: "1.3rem", color: "#F9F9F7", zIndex: 3,
          }}>
            Close x
          </button>

          {/* MONEYVIEW backdrop — fixed to viewport center, always centered */}
          <div style={{
            position: "fixed", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: ARRAY, fontSize: "clamp(4rem,16vw,13rem)",
            letterSpacing: ".05em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.06)", whiteSpace: "nowrap",
            pointerEvents: "none", userSelect: "none", zIndex: 1,
          }}>
            Moneyview
          </div>

          <div style={{
            minHeight: "100%", display: "flex", flexDirection: "column",
            alignItems: "center", padding: "120px 8vw 100px",
            position: "relative", zIndex: 2,
          }}>
            {/* Origin story */}
            <div style={{ maxWidth: 640, width: "100%", marginBottom: 56 }}>
              <div style={{
                fontFamily: ARRAY, fontSize: "clamp(1.6rem,3.5vw,2.4rem)",
                letterSpacing: ".03em", textTransform: "uppercase",
                color: "#F9F9F7", marginBottom: 20, fontWeight: 700,
              }}>
                {ORIGIN_STORY.heading}
              </div>
              <div style={{
                fontFamily: NIPPO, fontWeight: 300, fontSize: "1rem",
                color: "#c8d8cc", lineHeight: 1.9,
              }}>
                {ORIGIN_STORY.body}
              </div>
            </div>

            {/* ── 2 centred clickable boxes ── */}
            <div
              ref={catRef}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 360px))",
                gap: 20,
                width: "100%",
                justifyContent: "center",
              }}
            >
              {[
                {
                  key: "ai",
                  label: "Applied AI & Voice Agents",
                  desc: "PRIMA · AI Voice Agents · Transcript Intelligence · Cohort Splitter",
                  tags: AI_TAGS,
                },
                {
                  key: "analytics",
                  label: "Analytics",
                  desc: "4 dashboards across Consumer Insights, Support, and Lending",
                  tags: ANALYTICS_TAGS,
                },
              ].map(cat => (
                <div
                  key={cat.key}
                  onClick={() => select(cat.key)}
                  data-cursor="Open"
                  style={{ ...glassBox, cursor: "pointer", flex: "unset" }}
                  onMouseEnter={hoverOn}
                  onMouseLeave={hoverOff}
                >
                  {/* Label */}
                  <div style={{
                    fontFamily: ARRAY, fontSize: "1.55rem", letterSpacing: ".03em",
                    textTransform: "uppercase", color: "#F9F9F7",
                    fontWeight: 700, marginBottom: 10, lineHeight: 1.2,
                  }}>
                    {cat.label}
                  </div>

                  {/* Short description */}
                  <div style={{
                    fontFamily: NIPPO, fontWeight: 300, fontSize: ".88rem",
                    color: "#a8c0b0", lineHeight: 1.6, marginBottom: 22,
                  }}>
                    {cat.desc}
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: "rgba(255,255,255,0.12)", marginBottom: 18 }} />

                  {/* Tags */}
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {cat.tags.map(t => (
                      <span key={t} style={{
                        fontFamily: MONO, fontSize: ".58rem", letterSpacing: ".08em",
                        textTransform: "uppercase", color: "#F9F9F7", fontWeight: 700,
                        border: "1px solid rgba(255,255,255,0.22)", padding: "5px 12px", borderRadius: 6,
                      }}>{t}</span>
                    ))}
                  </div>

                  {/* Click hint */}
                  <div style={{
                    marginTop: 24, fontFamily: MONO, fontSize: ".6rem",
                    letterSpacing: ".14em", textTransform: "uppercase",
                    color: "rgba(255,255,255,0.35)",
                  }}>
                    View work →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          DETAIL PANEL
      ══════════════════════════════════════════════════════ */}
      {step === "detail" && (
        <div data-lenis-prevent style={{
          position: "fixed", inset: 0, zIndex: 915,
          background: "#F9F9F7", overflowY: "auto", padding: "80px 10vw",
        }}>
          <button onClick={back} data-cursor="Back" style={{
            position: "absolute", top: 36, left: 48,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: MONO, fontSize: ".65rem", letterSpacing: ".2em",
            textTransform: "uppercase", color: "#888", fontWeight: 600,
          }}>
            ← Back
          </button>
          <button onClick={close} data-cursor="Close" style={{
            position: "absolute", top: 36, right: 48,
            background: "none", border: "none", cursor: "pointer",
            fontFamily: ARRAY, fontSize: "1.3rem", color: "#0A0A0B",
          }}>
            Close x
          </button>

          <div ref={detailRef} style={{ maxWidth: 760, margin: "0 auto" }}>

            {category === "ai" ? (
              /* ── Applied AI & Voice Agents ── */
              <>
                <div style={{
                  fontFamily: ARRAY, fontSize: "clamp(1.8rem,4vw,3rem)",
                  letterSpacing: ".03em", textTransform: "uppercase",
                  color: "#0A0A0B", fontWeight: 700,
                  paddingBottom: 28, marginBottom: 52, borderBottom: "1px solid #ECEAE4",
                }}>
                  Applied AI & Voice Agents
                </div>

                {/* ── H2: PRIMA ── */}
                <div style={{ marginBottom: 64, paddingBottom: 64, borderBottom: "1px solid #ECEAE4" }}>
                  <H2Block text="PRIMA" />

                  {/* 1. Problem */}
                  <div style={{ marginBottom: 24 }}>
                    <SectionLabel text="Problem" />
                    <div style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: "1rem", color: "#444", lineHeight: 1.75 }}>
                      {PRIMA_ENTRY.problem}
                    </div>
                  </div>

                  {/* 2. Solution — Strategy & Planning */}
                  <div style={{ marginBottom: 24 }}>
                    <SectionLabel text="Solution — Strategy & Planning" />
                    <div style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: "1rem", color: "#444", lineHeight: 1.75 }}>
                      {PRIMA_ENTRY.solution}
                    </div>
                  </div>

                  {/* 3. Architecture */}
                  <div style={{ margin: "32px 0" }}>
                    <SectionLabel text="Architecture" />
                    <div style={{ border: "1px solid #ECEAE4", borderRadius: 8, padding: "24px 16px", overflowX: "auto" }}>
                      <PrimaDiagram />
                    </div>
                  </div>

                  {/* Techniques — compact tags */}
                  <div style={{ marginBottom: 32 }}>
                    <SectionLabel text="Technique" />
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {PRIMA_ENTRY.techniques.map(t => (
                        <span key={t} style={{
                          fontFamily: MONO, fontSize: ".6rem", letterSpacing: ".08em",
                          textTransform: "uppercase", color: "#555",
                          border: "1px solid #ECEAE4", padding: "5px 11px", borderRadius: 5,
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  {/* 4. Impact — overall, at the end */}
                  <div>
                    <SectionLabel text="Impact" />
                    {PRIMA_ENTRY.impact.map((line, idx) => (
                      <div key={idx} style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <span style={{ color: "#9333EA", flexShrink: 0, fontWeight: 700 }}>—</span>
                        <span style={{ fontFamily: NIPPO, fontWeight: 300, fontSize: "1rem", color: "#444", lineHeight: 1.7 }}>{line}</span>
                      </div>
                    ))}
                  </div>

                  {/* No "Why I did this" for PRIMA */}
                </div>

                {/* ── H2: Voice Agents ── */}
                <div>
                  <H2Block text="Voice Agents" />
                  {VOICE_AGENT_ENTRIES.map((e, i) => (
                    <EntryBlock key={e.name} e={e} last={i === VOICE_AGENT_ENTRIES.length - 1} />
                  ))}
                </div>
              </>

            ) : (
              /* ── Analytics ── */
              <>
                <div style={{
                  fontFamily: ARRAY, fontSize: "clamp(1.8rem,4vw,3rem)",
                  letterSpacing: ".03em", textTransform: "uppercase",
                  color: "#0A0A0B", fontWeight: 700,
                  paddingBottom: 28, marginBottom: 52, borderBottom: "1px solid #ECEAE4",
                }}>
                  Analytics
                </div>

                <div style={{ marginBottom: 52 }}>
                  <H2Block text="Dashboards" />
                  {ANALYTICS_ENTRIES.map((e, i) => (
                    <EntryBlock key={e.name} e={e} last={i === ANALYTICS_ENTRIES.length - 1} />
                  ))}
                </div>

                <div style={{
                  borderTop: "1px solid #ECEAE4", paddingTop: 36,
                  fontFamily: NIPPO, fontWeight: 300,
                  fontSize: "1rem", color: "#777", lineHeight: 1.75,
                }}>
                  {RESEARCH_LINE}
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </section>
  );
}