import { useState, useEffect } from "react";

function useData() {
  const [count, setCount] = useState(0);
  const [bars,  setBars]  = useState([]);
  const [visitor, setVisitor] = useState(null);

  useEffect(() => {
    // Visitor count
    const SEED = 1247;
    const stored = localStorage.getItem("at23_v");
    const cnt = stored ? parseInt(stored) : SEED;
    setCount(cnt);
    const b = Array.from({ length:30 }, (_,i) => {
      const base = Math.max(1, Math.floor(cnt/30));
      return Math.floor(base*0.4 + Math.random()*base*0.9);
    });
    setBars(b);

    // Current visitor location via ipapi.co (free, no key needed)
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => {
        setVisitor({ city:d.city||"Unknown", country:d.country_name||"Unknown", lat:d.latitude, lon:d.longitude });
        localStorage.setItem("at23_visitor_loc", JSON.stringify({ city:d.city, country:d.country_name, lat:d.latitude, lon:d.longitude }));
      })
      .catch(() => {
        const cached = localStorage.getItem("at23_visitor_loc");
        if (cached) setVisitor(JSON.parse(cached));
      });
  }, []);

  return { count, bars, visitor };
}

export default function VisitorGraph() {
  const { count, bars, visitor } = useData();
  const max = Math.max(...bars, 1);

  return (
    <section style={{ background:"#F9F9F7", padding:"96px 48px", borderTop:"1px solid #ECEAE4" }}>
      {/* Count */}
      <div className="rv" style={{ marginBottom:48 }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".52rem", letterSpacing:".32em", textTransform:"uppercase", color:"#bbb", marginBottom:16 }}>Visitors</div>
        <div style={{ display:"flex", alignItems:"baseline", gap:14 }}>
          <div style={{ fontFamily:"'Array',monospace", fontSize:"clamp(3rem,8vw,7rem)", color:"#0A0A0B", letterSpacing:".02em", lineHeight:1 }}>
            {count.toLocaleString()}
          </div>
          <div style={{ fontFamily:"'Nippo',sans-serif", fontWeight:300, fontSize:"1rem", color:"#bbb" }}>total visits</div>
        </div>
      </div>

      {/* Bars */}
      <div className="rv" style={{ display:"flex", alignItems:"flex-end", gap:3, height:72, marginBottom:12 }}>
        {bars.map((b,i) => (
          <div key={i} data-cursor={`Day ${i+1}`}
            style={{ flex:1, borderRadius:"1px 1px 0 0", height:`${Math.max((b/max)*100,6)}%`, background:"#0A0A0B", opacity:0.08+(i/bars.length)*0.55, transition:"opacity .2s", cursor:"default" }}
            onMouseEnter={e=>e.target.style.opacity="0.9"}
            onMouseLeave={e=>e.target.style.opacity=`${0.08+(i/bars.length)*0.55}`}/>
        ))}
      </div>
      <div className="rv" style={{ fontFamily:"'Space Mono',monospace", fontSize:".44rem", letterSpacing:".12em", color:"#ccc", marginBottom:48 }}>30 days</div>

      {/* Last visitor location */}
      <div className="rv" style={{ borderTop:"1px solid #ECEAE4", paddingTop:40 }}>
        <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".52rem", letterSpacing:".32em", textTransform:"uppercase", color:"#bbb", marginBottom:20 }}>You are viewing from</div>
        {visitor ? (
          <div style={{ display:"flex", alignItems:"center", gap:16 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"#0A0A0B", flexShrink:0, animation:"none" }}/>
            <div>
              <div style={{ fontFamily:"'Array',monospace", fontSize:"clamp(1.5rem,3.5vw,3rem)", letterSpacing:".04em", textTransform:"uppercase", color:"#0A0A0B", lineHeight:1 }}>
                {visitor.city}
              </div>
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".52rem", letterSpacing:".12em", color:"#aaa", marginTop:6 }}>
                {visitor.country} {visitor.lat && visitor.lon ? `- ${visitor.lat.toFixed(2)}N ${visitor.lon.toFixed(2)}E` : ""}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:".52rem", letterSpacing:".14em", color:"#ccc" }}>Detecting...</div>
        )}
      </div>
    </section>
  );
}