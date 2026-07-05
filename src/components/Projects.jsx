export default function Projects() {
  return (
    <section id="projects" style={{ background:"#F9F9F7", padding:"96px 48px", borderTop:"1px solid #ECEAE4" }}>
      <div className="rv" style={{ marginBottom:52 }}>
        <h2 style={{ fontFamily:"'Array',monospace", fontSize:"clamp(2rem,5vw,4rem)", letterSpacing:".04em", textTransform:"uppercase", color:"#0A0A0B", lineHeight:1.05 }}>
          Projects.
        </h2>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
        {/* Speed Run — active project */}
        <div className="rv" data-cursor="Active" style={{ border:"1px solid #0A0A0B", padding:"28px 24px" }}>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".46rem", letterSpacing:".18em", textTransform:"uppercase", color:"#0A0A0B", marginBottom:8 }}>01 - Active</div>
          <div style={{ fontFamily:"'Array',monospace", fontSize:"1.4rem", letterSpacing:".04em", textTransform:"uppercase", color:"#0A0A0B", marginBottom:12, lineHeight:1.1 }}>AI Speed Run</div>
          <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:".92rem", color:"#888", lineHeight:1.65, marginBottom:16 }}>
            Public documentation of a sprint from DS fundamentals to production AI engineering. No AI-generated code.
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            {["NumPy","Pandas","ML","DL","NLP","RAG"].map(t => (
              <span key={t} style={{ fontFamily:"'Space Mono',monospace", fontSize:".44rem", letterSpacing:".1em", textTransform:"uppercase", color:"#aaa", border:"1px solid #ECEAE4", padding:"2px 7px" }}>{t}</span>
            ))}
          </div>
        </div>

        {[2,3].map(n => (
          <div key={n} className="rv" data-cursor="Coming Soon" style={{ border:"1px solid #ECEAE4", padding:"28px 24px" }}>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".46rem", letterSpacing:".18em", textTransform:"uppercase", color:"#ccc", marginBottom:8 }}>0{n} - Soon</div>
            <div style={{ fontFamily:"'Array',monospace", fontSize:"1.4rem", letterSpacing:".04em", textTransform:"uppercase", color:"#ccc", lineHeight:1.1 }}>Coming Soon</div>
          </div>
        ))}
      </div>
    </section>
  );
}