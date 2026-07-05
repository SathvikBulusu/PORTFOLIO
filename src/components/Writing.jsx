import { useState } from "react";

const WRITES = {
  "May '26": [
    { title:"The AI Speed Run, why I'm doing this",            href:"#" },
    { title:"NumPy: C under the hood, arrays all the way down", href:"#" },
    { title:"Pandas: humbled by syntax, schooled by datetime",  href:"#" },
  ],
  "Jun '26": [
    { title:"EDA complete: a decade of Python in under 10 hours", href:"#" },
    { title:"ML kickoff: problem selection & the parameter split", href:"#" },
  ],
};

export default function Writing() {
  const [active, setActive] = useState(null);
  const months = Object.keys(WRITES);
  const counts = months.map(m => WRITES[m].length);
  const maxC   = Math.max(...counts, 1);

  return (
    <section id="writing" style={{ background:"#F9F9F7", padding:"96px 48px", borderTop:"1px solid #ECEAE4" }}>
      {/* Single heading only — no duplicate eyebrow label */}
      <div className="rv" style={{ marginBottom:52 }}>
        <h2 style={{ fontFamily:"'Array',monospace", fontSize:"clamp(2rem,5vw,4rem)", letterSpacing:".04em", textTransform:"uppercase", color:"#0A0A0B", lineHeight:1.05 }}>
          Writing.
        </h2>
      </div>

      {/* Month bar visualization */}
      <div className="rv" style={{ display:"flex", gap:14, alignItems:"flex-end", height:100, marginBottom:36 }}>
        {months.map((m,i) => {
          const on = active === m;
          const bH = Math.round((counts[i]/maxC)*72)+18;
          return (
            <button key={m} onClick={() => setActive(on ? null : m)}
              style={{ all:"unset", display:"flex", flexDirection:"column", alignItems:"center", gap:8, cursor:"pointer", height:"100%", justifyContent:"flex-end" }}
              data-cursor={m}>
              <div style={{ width:52, height:bH+"px", background:on?"#0A0A0B":"rgba(10,10,11,0.22)", transition:"all .22s" }}/>
              <span style={{ fontFamily:"'Space Mono',monospace", fontSize:".56rem", letterSpacing:".18em", textTransform:"uppercase", color:on?"#0A0A0B":"#888", transition:"color .22s", whiteSpace:"nowrap" }}>{m}</span>
            </button>
          );
        })}
      </div>

      {/* Posts — NOT wrapped in rv (dynamic content, would stay invisible) */}
      {!active && (
        <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:".95rem", color:"#ccc" }}>
          Select a month.
        </div>
      )}
      {active && (
        <div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".54rem", letterSpacing:".24em", textTransform:"uppercase", color:"#0A0A0B", marginBottom:24 }}>{active}</div>
          {WRITES[active].map(p => (
            <a key={p.title} href={p.href} target="_blank" rel="noopener noreferrer"
              data-cursor="Read"
              style={{ display:"block", fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:"1.12rem", color:"#0A0A0B", textDecoration:"none", padding:"13px 0", lineHeight:1.4, transition:"color .18s" }}
              onMouseEnter={e => e.currentTarget.style.color="#aaa"}
              onMouseLeave={e => e.currentTarget.style.color="#0A0A0B"}
            >{p.title}</a>
          ))}
        </div>
      )}
    </section>
  );
}