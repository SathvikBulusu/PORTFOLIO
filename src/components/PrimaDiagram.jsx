/* PrimaDiagram.jsx — PRIMA Architecture (v4)
   viewBox 1000px wide — Stage 3/4 boxes get proper room.
   Labels only on key transitions. Zero overlapping text.
*/
export default function PrimaDiagram() {
  const S      = "#0A0A0B";
  const PURPLE = "#9333EA";
  const ARRAY  = "'Array', monospace";
  const MONO   = "'Space Mono', monospace";
  const BH     = 70;

  const Bkt = ({ x, y, fx = false, fy = false }) => {
    const dx = fx ? -1 : 1, dy = fy ? -1 : 1;
    return <path d={`M${x} ${y+10*dy} L${x} ${y} L${x+10*dx} ${y}`}
      stroke={S} strokeWidth="1.3" fill="none" opacity="0.35" />;
  };

  const Box = ({ x, y, w, h = BH, label, sub, hub = false }) => {
    const cy = y + h / 2;
    return (
      <g>
        <rect x={x} y={y} width={w} height={h}
          fill={hub ? "rgba(147,51,234,0.06)" : "none"}
          stroke={hub ? PURPLE : S}
          strokeWidth={hub ? "1.6" : "1.1"} opacity="0.9" />
        <Bkt x={x}   y={y}     /> <Bkt x={x+w} y={y}   fx />
        <Bkt x={x}   y={y+h} fy /> <Bkt x={x+w} y={y+h} fx fy />
        <text x={x+w/2} y={sub ? cy-7 : cy+5}
          textAnchor="middle" fontFamily={ARRAY}
          fontSize="12.5" letterSpacing="0.9"
          fill={hub ? PURPLE : S}>{label}</text>
        {sub && <text x={x+w/2} y={cy+14}
          textAnchor="middle" fontFamily={MONO}
          fontSize="9" fill={hub ? "#9333EAaa" : "#666"}>{sub}</text>}
      </g>
    );
  };

  /* Strict orthogonal arrow. ax/ay = direction of arrowhead. */
  const Arr = ({ d, x2, y2, ax = 0, ay = 1 }) => {
    const len = Math.sqrt(ax*ax + ay*ay) || 1;
    const ux = ax/len, uy = ay/len, px = -uy, py = ux;
    const tip = `${x2},${y2}`;
    const bl  = `${x2-ux*8+px*4.5},${y2-uy*8+py*4.5}`;
    const br  = `${x2-ux*8-px*4.5},${y2-uy*8-py*4.5}`;
    return (
      <g opacity="0.55">
        <path d={d} stroke={S} strokeWidth="1.5" fill="none" />
        <polygon points={`${tip} ${bl} ${br}`} fill={S} />
      </g>
    );
  };

  /* Label with white pill — placed carefully to never sit over box text */
  const AL = ({ x, y, text }) => {
    const tw = text.length * 5.5;
    return (
      <g>
        <rect x={x-tw/2-4} y={y-11} width={tw+8} height={13}
          fill="#F9F9F7" opacity="0.97" rx="2" />
        <text x={x} y={y} textAnchor="middle"
          fontFamily={MONO} fontSize="8" fill="#555" letterSpacing="0.2">{text}</text>
      </g>
    );
  };

  const Stage = ({ text, x = 30, y }) => (
    <g>
      <rect x={x} y={y-16} width="3.5" height="21" fill={PURPLE} opacity="0.85" />
      <text x={x+14} y={y} fontFamily={ARRAY} fontSize="13"
        letterSpacing="2.8" fill="#111">{text}</text>
    </g>
  );

  const DB = ({ cx, cy, rx, ry }) => (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry}
        fill="rgba(147,51,234,0.06)" stroke={PURPLE} strokeWidth="1.6" opacity="0.9" />
      <Bkt x={cx-rx} y={cy-ry}    /> <Bkt x={cx+rx} y={cy-ry}    fx />
      <Bkt x={cx-rx} y={cy+ry} fy /> <Bkt x={cx+rx} y={cy+ry} fx fy />
      <text x={cx} y={cy-5} textAnchor="middle"
        fontFamily={ARRAY} fontSize="13" letterSpacing="1.8" fill={PURPLE}>DATABASE</text>
      <text x={cx} y={cy+14} textAnchor="middle"
        fontFamily={MONO} fontSize="9" fill="#9333EAaa">Postgres</text>
    </g>
  );

  return (
    <svg viewBox="0 0 1000 820" width="100%" style={{ display:"block" }}>

      {/* ══ STAGE 01 · INPUT ══ */}
      <Stage text="STAGE 01 · INPUT" y={28} />
      <Box x={30}  y={40} w={110} label="LOGIN"          sub="Auth"              />
      <Box x={165} y={40} w={185} label="PRODUCT SETUP"  sub="Research Storage"  />
      <Box x={375} y={40} w={195} label="MODEL SELECTOR" sub="Thinking Levels"   />
      <Box x={595} y={40} w={220} label="DATA UPLOAD"    sub="CSV · XLSX · Drive" />

      <Arr d="M 140 75 L 165 75"  x2={165} y2={75} ax={1} ay={0} />
      <Arr d="M 350 75 L 375 75"  x2={375} y2={75} ax={1} ay={0} />
      <Arr d="M 570 75 L 595 75"  x2={595} y2={75} ax={1} ay={0} />

      {/* ══ STAGE 02 · CODING ══ */}
      <Stage text="STAGE 02 · CODING" y={132} />

      {/* DATA UPLOAD cx=705, bottom=110 → SINGLE & DOUBLE */}
      <Arr d="M 705 110 L 705 128 L 570 128 L 570 148" x2={570} y2={148} ax={0} ay={1} />
      <AL x={636} y={122} text="single sheet" />

      <Arr d="M 705 110 L 705 128 L 740 128 L 740 148" x2={740} y2={148} ax={0} ay={1} />
      <AL x={722} y={122} text="double sheet" />

      <Box x={505} y={148} w={130} label="SINGLE SHEET" />
      <Box x={675} y={148} w={130} label="DOUBLE SHEET" />
      <Box x={840} y={148} w={130} label="Q SELECTOR"   sub="Double Sheet Only" />

      {/* DOUBLE right (805) → Q SELECTOR left (840): horizontal */}
      <Arr d="M 805 183 L 840 183" x2={840} y2={183} ax={1} ay={0} />
      <AL x={822} y={177} text="double only" />

      {/* SINGLE → CODING SPACE (elbow at y=240) */}
      <Arr d="M 570 218 L 570 240 L 538 240 L 538 265" x2={538} y2={265} ax={0} ay={1} />
      <AL x={553} y={235} text="questions selected" />

      {/* Q SELECTOR → CODING SPACE (sweep left along y=240) */}
      <Arr d="M 905 218 L 905 240 L 670 240 L 670 265" x2={670} y2={265} ax={0} ay={1} />
      <AL x={787} y={235} text="question context" />

      <Box x={388} y={265} w={292} label="CODING SPACE" sub="Few-shot Examples" />

      {/* CODING SPACE → CODE TEMPLATES (exit left, down) */}
      <Arr d="M 388 300 L 200 300 L 200 388" x2={200} y2={388} ax={0} ay={1} />
      <AL x={294} y={294} text="saves template" />

      {/* CODING SPACE → CODED RESULTS (straight down) */}
      <Arr d="M 534 335 L 534 388" x2={534} y2={388} ax={0} ay={1} />
      <AL x={550} y={361} text="batch output" />

      <Box x={100} y={388} w={200} label="CODE TEMPLATES" sub="Version Control · DB" />
      <Box x={424} y={388} w={220} label="CODED RESULTS"  sub="LLM Confidence · Recode" />

      {/* ── Postgres Hub cx=390, cy=515 ── */}
      <DB cx={390} cy={515} rx={88} ry={50} />

      {/* CODE TEMPLATES (cx=200, bottom=458) → DB left (302, 515) */}
      <Arr d="M 200 458 L 200 515 L 302 515" x2={302} y2={515} ax={1} ay={0} />
      <AL x={250} y={508} text="version control" />

      {/* CODED RESULTS (cx=534, bottom=458) → DB right (478, 515) */}
      <Arr d="M 534 458 L 534 515 L 478 515" x2={478} y2={515} ax={-1} ay={0} />
      <AL x={507} y={508} text="stores coded data" />

      {/* ══ STAGE 03 · ANALYSIS ══
          4 boxes × 215px, 24px gaps, x=30 to x=962
      ══ */}
      <Stage text="STAGE 03 · ANALYSIS" y={600} />

      {/* DB bottom (390, 565) → CATEGORIZE top (137, 618) */}
      <Arr d="M 390 565 L 390 588 L 137 588 L 137 612"  x2={137} y2={612} ax={0} ay={1} />
      <AL x={263} y={582} text="retrieves results" />

      <Box x={30}  y={612} w={215} label="CATEGORIZE"     sub="Coded → Categories"   />
      <Box x={269} y={612} w={215} label="UNIQUE PROMPTS"  sub="Project + Q Context"  />
      <Box x={508} y={612} w={215} label="BACKEND CODING"  sub="Codes · Not Raw Text" />
      <Box x={747} y={612} w={215} label="EXCEL EXPORT"    sub="% Codes · Quantify"   />

      {/* Stage 3 chain — 24px gaps, arrows at box center y=647 */}
      <Arr d="M 245 647 L 269 647" x2={269} y2={647} ax={1} ay={0} />
      <Arr d="M 484 647 L 508 647" x2={508} y2={647} ax={1} ay={0} />
      <Arr d="M 723 647 L 747 647" x2={747} y2={647} ax={1} ay={0} />

      {/* ══ STAGE 04 · INSIGHTS ══
          3 boxes × 215px, right-to-left flow
      ══ */}
      <Stage text="STAGE 04 · INSIGHTS" y={714} />

      {/* EXCEL EXPORT → ANALYTICS (straight down, cx=854) */}
      <Arr d="M 854 682 L 854 726" x2={854} y2={726} ax={0} ay={1} />
      <AL x={868} y={704} text="quantified data" />

      <Box x={747} y={726} w={215} label="ANALYTICS"    sub="Research Visualisations" />
      <Box x={508} y={726} w={215} label="COST TRACKER" sub="Token · Project · Time"  />
      <Box x={269} y={726} w={215} label="DEMOGRAPHICS" sub="Cohort · User Mapping"   />

      {/* Stage 4 chain — right to left, arrows at center y=761 */}
      <Arr d="M 747 761 L 723 761" x2={723} y2={761} ax={-1} ay={0} />
      <Arr d="M 508 761 L 484 761" x2={484} y2={761} ax={-1} ay={0} />

    </svg>
  );
}