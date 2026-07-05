/* PrimaDiagram.jsx — PRIMA Real Architecture
   4 stages: Input → Coding → Analysis → Insights
   Redesigned for legibility — larger type, purple stage accents, proper hierarchy.
*/

export default function PrimaDiagram() {
  const S      = "#0A0A0B";
  const PURPLE = "#9333EA";
  const ARRAY  = "'Array', monospace";
  const MONO   = "'Space Mono', monospace";
  const BOX_H  = 70;

  /* Corner bracket */
  const Bracket = ({ x, y, flipX = false, flipY = false }) => {
    const dx = flipX ? -1 : 1;
    const dy = flipY ? -1 : 1;
    return (
      <path
        d={`M${x} ${y + 9 * dy} L${x} ${y} L${x + 9 * dx} ${y}`}
        stroke={S} strokeWidth="1.2" fill="none" opacity="0.4"
      />
    );
  };

  /* Standard box */
  const Box = ({ x, y, w, h = BOX_H, label, sub, hub = false }) => {
    const cy = y + h / 2;
    return (
      <g>
        <rect
          x={x} y={y} width={w} height={h}
          fill={hub ? "rgba(147,51,234,0.05)" : "none"}
          stroke={hub ? PURPLE : S}
          strokeWidth={hub ? "1.5" : "1.1"}
          opacity="0.92"
        />
        <Bracket x={x}     y={y}     />
        <Bracket x={x + w} y={y}     flipX />
        <Bracket x={x}     y={y + h} flipY />
        <Bracket x={x + w} y={y + h} flipX flipY />
        <text
          x={x + w / 2} y={sub ? cy - 6 : cy + 5}
          textAnchor="middle"
          fontFamily={ARRAY} fontSize="12" letterSpacing="0.9"
          fill={hub ? PURPLE : S}
        >
          {label}
        </text>
        {sub && (
          <text
            x={x + w / 2} y={cy + 13}
            textAnchor="middle"
            fontFamily={MONO} fontSize="8.5"
            fill={hub ? "#9333EA99" : "#666"}
          >
            {sub}
          </text>
        )}
      </g>
    );
  };

  /* Arrow — straight or curved via custom `d` path */
  const Arrow = ({ x1, y1, x2, y2, d }) => {
    const dx = x2 - x1, dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len, uy = dy / len;
    const px = -uy,  py = ux;
    const tip = `${x2},${y2}`;
    const bl  = `${x2 - ux * 7 + px * 4},${y2 - uy * 7 + py * 4}`;
    const br  = `${x2 - ux * 7 - px * 4},${y2 - uy * 7 - py * 4}`;
    return (
      <g opacity="0.5">
        {d
          ? <path d={d} stroke={S} strokeWidth="1.4" fill="none" />
          : <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={S} strokeWidth="1.4" />
        }
        <polygon points={`${tip} ${bl} ${br}`} fill={S} />
      </g>
    );
  };

  /* Stage label — purple accent bar + bold Array text */
  const Stage = ({ text, x, y }) => (
    <g>
      {/* vertical accent bar */}
      <rect x={x} y={y - 14} width="3" height="19" fill={PURPLE} opacity="0.85" />
      {/* label text */}
      <text
        x={x + 12} y={y}
        fontFamily={ARRAY} fontSize="12" letterSpacing="2.5"
        fill="#1a1a1a"
      >
        {text}
      </text>
      {/* subtle horizontal rule extending from the label */}
      <line
        x1={x + 12} y1={y + 6}
        x2={x + 12 + 60} y2={y + 6}
        stroke={PURPLE} strokeWidth="1" opacity="0.3"
      />
    </g>
  );

  /* Postgres — ellipse hub with bracket corners */
  const Postgres = ({ cx, cy, rx, ry }) => (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill="rgba(147,51,234,0.05)" stroke={PURPLE} strokeWidth="1.4" opacity="0.85" />
      <Bracket x={cx - rx} y={cy - ry} />
      <Bracket x={cx + rx} y={cy - ry} flipX />
      <Bracket x={cx - rx} y={cy + ry} flipY />
      <Bracket x={cx + rx} y={cy + ry} flipX flipY />
      <text x={cx} y={cy - 5} textAnchor="middle"
        fontFamily={ARRAY} fontSize="12" letterSpacing="1.5" fill={PURPLE}>
        DATABASE
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle"
        fontFamily={MONO} fontSize="8.5" fill="#9333EA99">
        Postgres
      </text>
    </g>
  );

  return (
    <svg viewBox="0 0 820 695" width="100%" style={{ display: "block" }}>

      {/* ══════════════════════════════════════════
          STAGE 01 · INPUT
      ══════════════════════════════════════════ */}
      <Stage text="STAGE 01 · INPUT" x={30} y={28} />

      <Box x={30}  y={40} w={82}  label="LOGIN"          sub="Auth"              />
      <Box x={128} y={40} w={158} label="PRODUCT SETUP"  sub="Research Storage"  />
      <Box x={302} y={40} w={158} label="MODEL SELECTOR" sub="Thinking Levels"   />
      <Box x={476} y={40} w={185} label="DATA UPLOAD"    sub="CSV · XLSX · Drive" />

      <Arrow x1={110} y1={75} x2={128} y2={75} />
      <Arrow x1={284} y1={75} x2={302} y2={75} />
      <Arrow x1={458} y1={75} x2={476} y2={75} />

      {/* ══════════════════════════════════════════
          STAGE 02 · CODING
      ══════════════════════════════════════════ */}
      <Stage text="STAGE 02 · CODING" x={30} y={128} />

      {/* DATA UPLOAD center (x=568, y=110) → Single / Double */}
      <Arrow x1={568} y1={110} x2={502} y2={145} />
      <Arrow x1={568} y1={110} x2={628} y2={145} />

      <Box x={436} y={145} w={128} label="SINGLE SHEET" />
      <Box x={568} y={145} w={128} label="DOUBLE SHEET" />

      {/* Double right edge → Q Selector */}
      <Arrow x1={696} y1={180} x2={710} y2={220} />
      <Box   x={700} y={220} w={114} label="Q SELECTOR" sub="Double Sheet Only" />

      {/* Single bottom → Coding Space */}
      <Arrow x1={500} y1={215} x2={462} y2={252} />

      {/* Q Selector → Coding Space (curved sweep left) */}
      <Arrow
        x1={700} y1={255} x2={548} y2={264}
        d="M 700 255 Q 626 248 548 264"
      />

      <Box x={366} y={252} w={180} label="CODING SPACE"   sub="Few-shot Examples"   />
      <Box x={152} y={252} w={178} label="CODE TEMPLATES" sub="Version Control · DB" />

      {/* Coding Space → Code Templates */}
      <Arrow x1={366} y1={287} x2={330} y2={287} />

      {/* Coding Space → Coded Results */}
      <Arrow x1={428} y1={322} x2={326} y2={352} />

      <Box x={86} y={352} w={224} label="CODED RESULTS" sub="LLM Confidence · Recode" />

      {/* ── Postgres Hub ── */}
      <Postgres cx={594} cy={392} rx={65} ry={45} />

      {/* Code Templates → Postgres */}
      <Arrow x1={330} y1={302} x2={533} y2={368} />

      {/* Coded Results → Postgres (curved arc) */}
      <Arrow
        x1={310} y1={380} x2={531} y2={392}
        d="M 310 380 Q 424 420 531 392"
      />

      {/* ══════════════════════════════════════════
          STAGE 03 · ANALYSIS
      ══════════════════════════════════════════ */}
      <Stage text="STAGE 03 · ANALYSIS" x={30} y={468} />

      {/* Postgres → Categorize (long curved arc) */}
      <Arrow
        x1={534} y1={408} x2={160} y2={480}
        d="M 534 408 Q 354 444 160 480"
      />

      {/* Postgres → Excel Export zone (direct) */}
      <Arrow x1={594} y1={437} x2={648} y2={480} />

      <Box x={30}  y={480} w={158} label="CATEGORIZE"    sub="Coded → Categories"   />
      <Box x={206} y={480} w={172} label="UNIQUE PROMPTS" sub="Project + Q Context"  />
      <Box x={396} y={480} w={168} label="BACKEND CODING" sub="Codes · Not Raw Text" />
      <Box x={582} y={480} w={178} label="EXCEL EXPORT"   sub="% Codes · Quantify"  />

      <Arrow x1={188} y1={515} x2={206} y2={515} />
      <Arrow x1={378} y1={515} x2={396} y2={515} />
      <Arrow x1={564} y1={515} x2={582} y2={515} />

      {/* ══════════════════════════════════════════
          STAGE 04 · INSIGHTS
      ══════════════════════════════════════════ */}
      <Stage text="STAGE 04 · INSIGHTS" x={30} y={582} />

      {/* Excel Export → Analytics */}
      <Arrow x1={671} y1={550} x2={671} y2={594} />

      <Box x={582} y={594} w={178} label="ANALYTICS"    sub="Research Visualisations" />
      <Box x={392} y={594} w={168} label="COST TRACKER" sub="Token · Project · Time"  />
      <Box x={200} y={594} w={165} label="DEMOGRAPHICS" sub="Cohort · User Mapping"   />

      {/* Stage 4: right → left flow */}
      <Arrow x1={582} y1={629} x2={560} y2={629} />
      <Arrow x1={392} y1={629} x2={365} y2={629} />

    </svg>
  );
}