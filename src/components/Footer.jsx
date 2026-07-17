/* Footer — the ONLY other place contact links appear besides the orb.
   Small, quiet typography. Not a repeat of the orb — a signature. */
export default function Footer() {
  const links = [
    { l:"GitHub",   h:"https://github.com/SathvikBulusu" },
    { l:"Resume",   h:"/resume.pdf" },
    { l:"LinkedIn", h:"https://www.linkedin.com/in/bulusu-sathvik/" },
    { l:"Email",    h:"mailto:bulususathvik7890@email.com" },
  ];

  return (
    <footer style={{
      background:"#F9F9F7", borderTop:"1px solid #ECEAE4",
      padding:"56px 48px 40px",
      display:"flex", justifyContent:"space-between", alignItems:"center",
      flexWrap:"wrap", gap:20,
    }}>
      <div style={{ fontFamily:"'Array',monospace", fontSize:".85rem", letterSpacing:".14em", color:"#CCC", textTransform:"uppercase" }}>
        AT23
      </div>

      <div style={{ display:"flex", gap:26, flexWrap:"wrap" }}>
        {links.map(({l,h}) => (
          <a key={l} href={h} target="_blank" rel="noopener noreferrer" data-cursor={l}
            style={{
              fontFamily:"'Space Mono',monospace", fontSize:".58rem", letterSpacing:".16em",
              textTransform:"uppercase", color:"#999", textDecoration:"none",
              transition:"color .2s ease",
            }}
            onMouseEnter={e=>e.currentTarget.style.color="#0A0A0B"}
            onMouseLeave={e=>e.currentTarget.style.color="#999"}
          >{l}</a>
        ))}
      </div>
    </footer>
  );
}