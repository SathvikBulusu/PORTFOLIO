import { useRef, useState, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { getLenis } from "./LenisProvider";
import { useWorkFlow } from "./useWorkFlow";
import PrimaDiagram from "./PrimaDiagram";
import mvLogo from "../images/mv.jpg";

const MV_LOGO = mvLogo;

/* ── Origin story — sits above the two category boxes, told once ── */
const ORIGIN_STORY = {
  heading: "My Moneyview Experience",
  body: "When I joined the Consumer Insights team, my objective was clear: understand how researchers worked before introducing AI into their workflow. I spent time learning how qualitative research was conducted, how responses were manually coded, and where the biggest bottlenecks existed. It quickly became apparent that the team had little to no AI infrastructure in place, so before building solutions, I had to establish the technical foundation itself. From setting up access to LLM providers and cloud services to configuring the tools that would eventually power our AI workflows, this phase wasn't just about onboarding it was about creating the ecosystem that would enable everything we built afterward. Here's how each tool became an essential part of that journey.",
};

const TOOL_ACCESS = [
  { tool: "Metabase",    role: "Viz Tool To share Dashboards Across teams,i genuinely loved building dashboards cause creating tables and calling it in metabase felt supremely easy." },
  { tool: "BigQuery",    role: "I majorly used it as a syntax hub for my sql when i went wrong in metabase, but if i had to run Huge Queries i used to run my queries here." },
  { tool: "Cloud Anix",  role: "One of the Major Tool that gives control for users to get access to any prod databases ( major help for getting those transcripts for analysis in AI Calling.) " },
  { tool: "Confluence",  role: "This was one of the good documentation tools i have used ,love how theres whiteboard & different ways for sharing the respective docs and edit them for projects , majorly every SOP and runbook got documented here, so research stopped getting lost in Google Drive" },
];

/* ── Bucket 1: Applied AI & Voice Agents ── */
const AI_TAGS = ["Python", "Gemini", "Multi-Provider", "JSON Schema", "Prompt Engineering"];
const AI_ENTRIES = [
  {
    name: "PRIMA",
    isFlagship: true,
    problem: "A typical research study means 300-500 people answering 15-20 open-ended questions. Every response needs manual classification. Before PRIMA, that meant one of three things: a team hand-coding responses for days, a colleague's fragile one-column Google Sheets script, or pasting into ChatGPT with no structure, no batching, and no cost tracking.",
    techniques: ["Multi-provider inference (Gemini/Claude/Ollama)", "Enum-constrained JSON schema", "Few-shot classification", "Server-side parallel processing", "Prompt caching via systemInstruction"],
    impact: [
      "71× faster after moving processing server-side — the same dataset went from 9.5 hours to 8 minutes once the browser's 6-connection limit stopped throttling parallelism.",
      "84% fewer reasoning tokens after tuning the model's thinking-level default, with zero accuracy loss on classification.",
    ],
    why: "Building PRIMA changed how I think about AI engineering. Production systems succeed or fail on prompt design, structured outputs, and iteration — not on which model you picked. Used by 6 researchers daily, replacing a process that used to take 2-3 days with one that takes minutes.",
  },
  {
    name: "AI Voice Agents",
    problem: "The team needed a scalable way to collect qualitative feedback without manually calling every user.",
    solution: "Built and optimized voice bot workflows for Product Retention and Superhome Drop-off, prompt design, extraction logic, and Metabase dashboards, processing 45,000+ calls.",
    why: "Voice is a different failure mode than text. I wanted to see where LLMs break when input is spoken and messy, not typed and clean.",
  },
  {
    name: "Transcript Intelligence",
    problem: "The internal transcript tool split identical issues into duplicate buckets, e.g. \"network issue\" and \"network issues\" from unstructured prompting.",
    solution: "Rebuilt the pipeline with few-shot examples and JSON schema outputs on Gemini 3.1 Pro, producing one consistent taxonomy that fed straight into the support dashboard.",
    why: "This was a tool other people relied on every day. I wanted to fix what was actually broken, not just ship something new next to it.",
  },
  {
    name: "Internal Tooling & Automation",
    problem: "The same manual, repetitive data-prep work kept eating hours across different research projects, every week.",
    solution: "Built a JSON formatter, an automated cohort-splitting pipeline (25 minutes down to 20 seconds), and a few-shot coding pipeline that scaled 5 labeled examples into 400+ AI-coded responses.",
    why: "I noticed the same bottleneck showing up in every project. Instead of fixing it once, I built something reusable.",
  },
];

/* ── Bucket 2: Analytics ── */
const ANALYTICS_TAGS = ["Streamlit", "Metabase", "BigQuery", "SQL"];
const ANALYTICS_ENTRIES = [
  {
    name: "Support Intelligence Dashboard",
    problem: "Leadership had no consolidated view of customer support trends across pre and post-disbursal issues.",
    solution: "Built a Streamlit dashboard combining LLM-categorized tickets with month-on-month trend analysis, directly informing a regional hiring decision by the Head of Customer Support.",
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
    problem: "There was no clear internal view of repayment behavior across user segments to guide marketing spend.",
    solution: "Built a Metabase dashboard surfacing repayment patterns from internal data, which directly informed a shift toward women-focused lending campaigns.",
    why: "I wanted a dashboard that stakeholders actually opened before making a call, not one built for its own sake.",
  },
  {
    name: "FGD Analytics Dashboard",
    problem: "Focus group research was scattered across individual files with no way to compare studies or track progress.",
    solution: "Built a centralized dashboard consolidating every FGD into one place for cross-study comparison and historical review.",
    why: "Research the team already did was getting lost. I wanted it to compound instead of disappearing after one report.",
  },
];

const RESEARCH_LINE =
  "Also led primary research across six other product areas — digital gold adoption, personal loan repeat behavior, balance transfer drivers, credit accessibility, UPI activation, and partner ecosystem research — from survey design through stakeholder presentation.";

export default function Work() {
  const { step, category, open, transitionDone, select, back, close } = useWorkFlow();

  const waveOverlayRef = useRef(null);
  const revealMaskRef  = useRef(null); // clip-path reveal, left -> right
  const logoRef        = useRef(null);
  const catRef            = useRef(null);
  const detailRef         = useRef(null);
  const categoriesScrollRef = useRef(null); // scrollable container for the origin story + boxes

  useEffect(() => {
    const lenis = getLenis();
    if (step === "closed") {
      lenis?.start();
      document.body.style.overflow = "";
    } else {
      lenis?.stop();
      // Belt-and-suspenders: this is what actually guarantees the page
      // behind the overlay cannot move, independent of whatever Lenis's
      // internal stop/start state is doing. Plain CSS overflow:hidden on
      // body is unconditional — no library-specific behavior can override it.
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = ""; };
  }, [step]);

  /* Origin story arrows — reveal as the user scrolls down within the
     categories overlay itself. Scoped to that overlay's own scroll
     container via ScrollTrigger's `scroller` option, since this is a
     fixed full-screen overlay with its own overflow, not the page body
     that Lenis normally drives. */
  useGSAP(() => {
    if (step !== "categories" || !categoriesScrollRef.current) return;
    const ctx = gsap.context(() => {
      gsap.utils.toArray(".origin-row").forEach(row => {
        const line = row.querySelector(".origin-arrow-line");
        gsap.set(line, { scaleX: 0, transformOrigin: "left center" });
        gsap.set(row, { opacity: 0.3 });
        gsap.to(row, {
          opacity: 1, duration: 0.5, ease: "power2.out",
          scrollTrigger: { trigger: row, scroller: categoriesScrollRef.current, start: "top 78%" },
        });
        gsap.to(line, {
          scaleX: 1, duration: 0.6, ease: "power2.out",
          scrollTrigger: { trigger: row, scroller: categoriesScrollRef.current, start: "top 78%" },
        });
      });
    }, categoriesScrollRef);
    return () => ctx.revert();
  }, { dependencies: [step] });


  useGSAP(() => {
    if (step !== "transitioning") return;

    gsap.set(waveOverlayRef.current, { autoAlpha: 0 });
    gsap.set(revealMaskRef.current, { clipPath: "inset(0 100% 0 0)" });
    gsap.set(logoRef.current, { opacity: 0, scale: 0.8 });

    const DRAW_DUR     = 2.6; // slow, deliberate — the draw itself IS the loading moment
    const progress      = { p: 0 };
    let logoTriggered   = false;

    const tl = gsap.timeline({ onComplete: transitionDone });

    tl.to(waveOverlayRef.current, { autoAlpha: 1, duration: 0.5, ease: "power2.out" })
      .to(progress, {
        p: 100,
        duration: DRAW_DUR,
        ease: "power1.inOut",
        onUpdate: () => {
          const p = progress.p;
          revealMaskRef.current.style.clipPath = `inset(0 ${100 - p}% 0 0)`;
          // Logo appears the instant the sweep physically reaches its position
          if (!logoTriggered && p >= 50) {
            logoTriggered = true;
            gsap.to(logoRef.current, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
          }
        },
      }, "+=0.15")
      .to({}, { duration: 0.6 }) // hold — a real beat to register, not a blip
      .to(waveOverlayRef.current, { autoAlpha: 0, duration: 0.55, ease: "power2.inOut" });
  }, { dependencies: [step] });

  useGSAP(() => {
    if (step === "categories" && catRef.current) {
      gsap.fromTo(catRef.current.children, { opacity: 0, y: 18 }, { opacity: 1, y: 0, stagger: 0.1, duration: 0.5, ease: "power2.out" });
    }
  }, { dependencies: [step] });

  useGSAP(() => {
    if (step === "detail" && detailRef.current) {
      gsap.fromTo(detailRef.current, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" });
    }
  }, { dependencies: [step, category] });

  const entries = category === "ai" ? AI_ENTRIES : ANALYTICS_ENTRIES;
  const tags    = category === "ai" ? AI_TAGS    : ANALYTICS_TAGS;

  return (
    <section id="work" style={{ background:"#F9F9F7", padding:"140px 48px", borderTop:"1px solid #ECEAE4", position:"relative", overflow:"hidden", minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center" }}>

      {/* ── Faint background text — "WORK EXPERIENCE", per the original sketch ── */}
      <div style={{
        position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)",
        fontFamily:"'Array',monospace", fontSize:"clamp(3rem,11vw,10rem)", letterSpacing:".05em",
        textTransform:"uppercase", color:"rgba(10,10,11,0.05)", whiteSpace:"nowrap", userSelect:"none", pointerEvents:"none",
      }}>
        Work Experience
      </div>

      {/* ── The ONLY visible element pre-click: Moneyview wordmark, itself the button ── */}
      <button
        onClick={open}
        data-cursor="Enter"
        style={{
          all:"unset", cursor:"pointer", position:"relative", zIndex:2,
          fontFamily:"'Array',monospace", fontSize:"clamp(2.4rem,7vw,5.5rem)", letterSpacing:".04em",
          textTransform:"uppercase", color:"#0A0A0B",
        }}
      >
        Moneyview
      </button>

      {/* ── Wave transition overlay ── */}
      <div ref={waveOverlayRef} style={{
        position:"fixed", inset:0, zIndex:920, background:"#111111",
        pointerEvents: step === "transitioning" ? "auto" : "none",
        display: step === "transitioning" ? "block" : "none",
      }}>
        {}
        <div style={{ position:"absolute", top:"38%", left:0, width:"100%", height:"24%", zIndex:1 }}>
          <div ref={revealMaskRef} style={{ position:"absolute", inset:0, clipPath:"inset(0 100% 0 0)" }}>
            <svg width="100%" height="100%" viewBox="0 0 1200 200" preserveAspectRatio="none">
              <defs>
                {/* y=0 (top of viewBox) -> green, y=200 (bottom) -> white.
                   Stops at 30%/70% (=y60/y140) keep the peaks/troughs
                   solidly colored, blending only through the middle band
                   that straddles the seam at y=100. */}
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

        {/* Logo sits in the trough at center — fades in the instant the
           sweep's progress crosses 50%, physically synced to its position */}
        <div ref={logoRef} style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:92, height:92, borderRadius:"50%", background:"#ffffff", display:"flex", alignItems:"center", justifyContent:"center", zIndex:3 }}>
          {MV_LOGO ? (
            <img src={MV_LOGO} alt="" style={{ width:54, height:54, objectFit:"contain" }} />
          ) : (
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:".62rem", color:"#4ADE80" }}>MV</span>
          )}
        </div>
      </div>

      {/* ── Categories screen — scrollable: origin story + arrows on top, boxes below ── */}
      {step === "categories" && (
        <div ref={categoriesScrollRef} data-lenis-prevent style={{ position:"fixed", inset:0, zIndex:910, background:"rgba(15,61,42,0.97)", overflowY:"auto" }}>
          <button onClick={close} data-cursor="Close"
            style={{ position:"fixed", top:36, right:48, background:"none", border:"none", cursor:"pointer", fontFamily:"'Array',monospace", fontSize:"1.3rem", color:"#F9F9F7", zIndex:3 }}>
            Close x
          </button>

          <div style={{ minHeight:"100%", display:"flex", flexDirection:"column", alignItems:"center", padding:"120px 10vw 100px", position:"relative" }}>

            {/* ── Origin story — the "before the boxes" note ── */}
            <div style={{ maxWidth:640, width:"100%", marginBottom:80 }}>
              <div style={{ fontFamily:"'Array',monospace", fontSize:"clamp(1.6rem,3.5vw,2.4rem)", letterSpacing:".03em", textTransform:"uppercase", color:"#F9F9F7", marginBottom:20 }}>
                {ORIGIN_STORY.heading}
              </div>
              <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:"1rem", color:"#c8d8cc", lineHeight:1.8, marginBottom:48 }}>
                {ORIGIN_STORY.body}
              </div>

              {/* Tool access — each row fades in with an animated arrow as you scroll to it */}
              {TOOL_ACCESS.map((item, i) => (
                <div key={item.tool} className="origin-row" style={{ display:"flex", alignItems:"baseline", gap:16, marginBottom:22, flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Array',monospace", fontSize:"1.1rem", letterSpacing:".02em", textTransform:"uppercase", color:"#F9F9F7", flexShrink:0, minWidth:130 }}>
                    {item.tool}
                  </span>
                  <span className="origin-arrow-line" style={{ display:"inline-block", width:36, height:1, background:"#4ADE80", flexShrink:0 }} />
                  <span style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:".88rem", color:"#a8bcae", lineHeight:1.6, flex:1, minWidth:200 }}>
                    {item.role}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Horizontal faint MONEYVIEW backdrop, behind the two boxes ── */}
            <div style={{
              position:"absolute", top:"64%", left:"50%", transform:"translate(-50%,-50%)",
              fontFamily:"'Array',monospace", fontSize:"clamp(3rem,14vw,13rem)", letterSpacing:".05em",
              textTransform:"uppercase", color:"rgba(255,255,255,0.06)", whiteSpace:"nowrap", pointerEvents:"none", zIndex:0,
            }}>
              Moneyview
            </div>

            <div ref={catRef} style={{ display:"grid", gap:18, width:"min(560px,90vw)", position:"relative", zIndex:2 }}>
              {[
                { key:"ai",        label:"Applied AI & Voice Agents", tags:AI_TAGS },
                { key:"analytics", label:"Analytics",                 tags:ANALYTICS_TAGS },
              ].map(cat => (
                <div key={cat.key} onClick={() => select(cat.key)} data-cursor="Open"
                  style={{
                    border:"1px solid rgba(255,255,255,0.16)", borderRadius:12, padding:"32px 34px", cursor:"pointer",
                    transition:"border-color .2s, background .2s, box-shadow .2s",
                    background:"rgba(255,255,255,0.07)",
                    backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)",
                    boxShadow:"0 24px 60px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.2)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor="#F9F9F7"; e.currentTarget.style.background="rgba(255,255,255,0.11)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor="rgba(255,255,255,0.16)"; e.currentTarget.style.background="rgba(255,255,255,0.07)"; }}
                >
                  <div style={{ fontFamily:"'Array',monospace", fontSize:"1.7rem", letterSpacing:".03em", textTransform:"uppercase", color:"#F9F9F7", marginBottom:18, fontWeight:700 }}>
                    {cat.label}
                  </div>
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    {cat.tags.map(t => (
                      <span key={t} style={{
                        fontFamily:"'Space Mono',monospace", fontSize:".62rem", letterSpacing:".08em",
                        textTransform:"uppercase", color:"#F9F9F7", fontWeight:700,
                        border:"1px solid rgba(255,255,255,0.25)", padding:"6px 14px", borderRadius:6,
                      }}>{t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Detail panel — WHITE background, full breadth of the work ── */}
      {step === "detail" && (
        <div data-lenis-prevent style={{ position:"fixed", inset:0, zIndex:915, background:"#F9F9F7", overflowY:"auto", padding:"80px 10vw" }}>
          <button onClick={back} data-cursor="Back"
            style={{ position:"absolute", top:36, left:48, background:"none", border:"none", cursor:"pointer", fontFamily:"'Space Mono',monospace", fontSize:".6rem", letterSpacing:".2em", textTransform:"uppercase", color:"#999" }}>
            ← Back
          </button>
          <button onClick={close} data-cursor="Close"
            style={{ position:"absolute", top:36, right:48, background:"none", border:"none", cursor:"pointer", fontFamily:"'Array',monospace", fontSize:"1.3rem", color:"#0A0A0B" }}>
            Close x
          </button>

          <div ref={detailRef} style={{ maxWidth:760, margin:"0 auto" }}>
            {entries.map((e, i) => (
              <div key={e.name} style={{ marginBottom:56, paddingBottom:56, borderBottom: i < entries.length - 1 || category === "analytics" ? "1px solid #ECEAE4" : "none" }}>
                <div style={{ fontFamily:"'Array',monospace", fontSize: e.isFlagship ? "2.4rem" : "1.9rem", letterSpacing:".03em", textTransform:"uppercase", color:"#0A0A0B", marginBottom:18 }}>
                  {e.name}
                </div>

                <div style={{ marginBottom:14 }}>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".48rem", letterSpacing:".18em", textTransform:"uppercase", color:"#bbb", marginBottom:5 }}>Problem</div>
                  <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:".95rem", color:"#555", lineHeight:1.7 }}>{e.problem}</div>
                </div>

                {e.isFlagship ? (
                  <>
                    {/* Architecture — the visual, not the whole changelog */}
                    <div style={{ margin:"32px 0" }}>
                      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".48rem", letterSpacing:".18em", textTransform:"uppercase", color:"#bbb", marginBottom:14 }}>Architecture</div>
                      <div style={{ border:"1px solid #ECEAE4", borderRadius:8, padding:"24px 16px", overflowX:"auto" }}>
                        <PrimaDiagram />
                      </div>
                    </div>

                    <div style={{ marginBottom:28 }}>
                      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".48rem", letterSpacing:".18em", textTransform:"uppercase", color:"#bbb", marginBottom:10 }}>Technique</div>
                      <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                        {e.techniques.map(t => (
                          <span key={t} style={{ fontFamily:"'Space Mono',monospace", fontSize:".48rem", letterSpacing:".08em", textTransform:"uppercase", color:"#555", border:"1px solid #ECEAE4", padding:"5px 11px", borderRadius:5 }}>{t}</span>
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom:14 }}>
                      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".48rem", letterSpacing:".18em", textTransform:"uppercase", color:"#bbb", marginBottom:10 }}>Measured Impact</div>
                      {e.impact.map((line, idx) => (
                        <div key={idx} style={{ display:"flex", gap:12, marginBottom:10 }}>
                          <span style={{ color:"#0A0A0B", flexShrink:0 }}>—</span>
                          <span style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:".92rem", color:"#555", lineHeight:1.65 }}>{line}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".48rem", letterSpacing:".18em", textTransform:"uppercase", color:"#bbb", marginBottom:5 }}>Solution</div>
                    <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:".95rem", color:"#555", lineHeight:1.7 }}>{e.solution}</div>
                  </div>
                )}

                <div>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".48rem", letterSpacing:".18em", textTransform:"uppercase", color:"#bbb", marginBottom:5 }}>Why I did this</div>
                  <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:".9rem", color:"#888", lineHeight:1.7, fontStyle:"italic" }}>{e.why}</div>
                </div>
              </div>
            ))}

            {category === "analytics" && (
              <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:".9rem", color:"#888", lineHeight:1.75 }}>
                {RESEARCH_LINE}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}