// Dashboard.jsx — S2 Dashboard compositions.
// Re-uses approved P03 Person Summary Card, P05 Memory Card, and TV* primitives
// (sidebar / icons / bottom nav / top bar). No restyles of approved components.
//
// Content per spec: Margaret Walsh's hearth.
//   - Welcome greeting + last visit + Add a memory (Ink primary, 36px)
//   - Recently Viewed strip: Aoife, Thomas, Ciarán, Siobhán (P03 compact horizontal)
//   - Tree preview card (60%) + Stat cards 2×2 + Recent memories (40%)
//   - Quick actions ghost bar
//
// Mobile drops the stat cards and surfaces a 56px Ink FAB.

const { useState: useDB } = React;

// ============================================================
// Section label — Plus Jakarta 500, 11px, ALL CAPS, Warm-Mid,
//                 letter-spacing-label, --space-3 (12px) margin bottom.
// ============================================================
function DBSectionLabel({ children, style = {} }) {
  return (
    <div style={{
      fontFamily: 'var(--font-ui)',
      fontWeight: 500,
      fontSize: 11,
      letterSpacing: '0.10em',
      textTransform: 'uppercase',
      color: '#7A6F63',
      marginBottom: 12,
      ...style,
    }}>{children}</div>
  );
}

// ============================================================
// Welcome header — desktop variant.
// Greeting (Plus Jakarta 400 / 28px / Ink) + last-activity timestamp.
// Right: "Add a memory" Primary button (Ink fill, 36px, radius 4).
// ============================================================
function DBWelcomeHeader({
  name = 'Margaret',
  lastVisit = 'Last visited 2 days ago.',
  primaryLabel = 'Add a memory',
  variant = 'desktop',
}) {
  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <h1 style={{
            margin: 0,
            fontFamily: 'var(--font-ui)',
            fontWeight: 400,
            fontSize: 22,
            lineHeight: 1.25,
            color: '#1C1A17',
            letterSpacing: '-0.005em',
          }}>Welcome back, {name}.</h1>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 400,
            fontSize: 12,
            color: '#7A6F63',
            letterSpacing: '0.005em',
          }}>{lastVisit}</span>
        </div>
        <DBPrimaryButton fullWidth height={48} fontSize={14}>{primaryLabel}</DBPrimaryButton>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      gap: 24, flexWrap: 'nowrap',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <h1 style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 28,
          lineHeight: 1.2,
          color: '#1C1A17',
          letterSpacing: '-0.01em',
        }}>Welcome back, {name}.</h1>
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 400,
          fontSize: 13,
          color: '#7A6F63',
          letterSpacing: '0.005em',
        }}>{lastVisit}</span>
      </div>
      <DBPrimaryButton>{primaryLabel}</DBPrimaryButton>
    </div>
  );
}

// ============================================================
// Primary button — Ink fill, Parchment text. Plus Jakarta 500 / 13px.
// Height 36 (default) or 48 (mobile lg). radius-sm 4px.
// ============================================================
function DBPrimaryButton({ children, height = 36, fontSize = 13, fullWidth = false, icon }) {
  const [hover, setHover] = useDB(false);
  return (
    <button type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height, padding: '0 18px',
        background: '#1C1A17', color: '#F7F4EE',
        border: 'none', borderRadius: 4,
        fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize,
        letterSpacing: '0.005em',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: fullWidth ? '100%' : 'auto',
        opacity: hover ? 0.85 : 1,
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0,
      }}>
      {icon}
      {children}
    </button>
  );
}

// ============================================================
// Secondary button — transparent, hairline border, Ink text.
// Used on the tree preview card.
// ============================================================
function DBSecondaryButton({ children, fullWidth = false, height = 36 }) {
  const [hover, setHover] = useDB(false);
  return (
    <button type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height, padding: '0 16px',
        background: hover ? '#E5DDD2' : 'transparent',
        color: '#1C1A17',
        border: '0.5px solid #D6CFC4',
        borderRadius: 4,
        fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 13,
        letterSpacing: '0.005em',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: fullWidth ? '100%' : 'auto',
        transition: 'background 150ms cubic-bezier(.22,1,.36,1)',
        WebkitTapHighlightColor: 'transparent',
        flexShrink: 0,
      }}>{children}</button>
  );
}

// ============================================================
// Stat card — anatomy defined inline per spec.
// Surface-1 bg, hairline border, radius-lg, padding --space-4.
// Plus Jakarta 300 / 32px numeral. ALL CAPS label.
// No icons. No charts. No fills. No hover. No shadow.
// ============================================================
function DBStatCard({ value, label }) {
  return (
    <div style={{
      background: '#EDE8E0',
      border: '0.5px solid #D6CFC4',
      borderRadius: 10,
      padding: 16,
      display: 'flex', flexDirection: 'column', gap: 6,
      minWidth: 0,
    }}>
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 300,
        fontSize: 32,
        lineHeight: 1.1,
        color: '#1C1A17',
        letterSpacing: '-0.02em',
        fontVariantNumeric: 'tabular-nums',
      }}>{value}</span>
      <span style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 400,
        fontSize: 11,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        color: '#7A6F63',
      }}>{label}</span>
    </div>
  );
}

// ============================================================
// Tree preview thumbnail — simplified SVG of the active family tree.
// Same vocabulary as S3 canvas (warm-light connectors, gold-light spouse line,
// Surface-2 nodes, 25% grayscale for deceased). 4:3 aspect, Parchment bg.
// Two layouts: walsh (5 members, 3 gen) and murphy (3 members, 2 gen).
// ============================================================
function DBTreeThumbnail({ tree = 'walsh' }) {
  // Geometry — viewBox 240×180 (4:3).
  const STROKE = { warmLight: '#C4B9A8', goldLight: '#BFA882' };
  const NODE_R = 12;

  // ----- Murphy layout: 1 ancestor (deceased) → 2 children -----
  if (tree === 'murphy') {
    const PADRAIG = { x: 120, y: 60 };
    const EILIS   = { x: 84,  y: 132 };
    const CAIT    = { x: 156, y: 132 };
    const BUS_Y = 96;
    return (
      <div style={{
        position: 'relative', width: '100%', paddingTop: '75%',
        background: '#F7F4EE',
        borderTopLeftRadius: 10, borderTopRightRadius: 10,
        borderBottom: '0.5px solid #D6CFC4', overflow: 'hidden',
      }}>
        <svg viewBox="0 0 240 180" preserveAspectRatio="xMidYMid meet"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {/* Drop + sibling bar */}
          <path d={`M ${PADRAIG.x} ${PADRAIG.y + NODE_R} L ${PADRAIG.x} ${BUS_Y} M ${EILIS.x} ${BUS_Y} L ${CAIT.x} ${BUS_Y} M ${EILIS.x} ${BUS_Y} L ${EILIS.x} ${EILIS.y - NODE_R} M ${CAIT.x} ${BUS_Y} L ${CAIT.x} ${CAIT.y - NODE_R}`}
            stroke={STROKE.warmLight} strokeWidth="0.75" fill="none" strokeLinecap="round" />
          {/* Pádraig — deceased, root */}
          <circle cx={PADRAIG.x} cy={PADRAIG.y} r={NODE_R}
            fill="#D9D0C4" stroke="#C4B9A8" strokeWidth="0.5" />
          <circle cx={PADRAIG.x} cy={PADRAIG.y + NODE_R + 4} r="1.5" fill="#8C4A38" />
          {/* Eilís — deceased */}
          <circle cx={EILIS.x} cy={EILIS.y} r={NODE_R}
            fill="#D9D0C4" stroke="#C4B9A8" strokeWidth="0.5" />
          <circle cx={EILIS.x} cy={EILIS.y + NODE_R + 4} r="1.5" fill="#8C4A38" />
          {/* Caitríona — living */}
          <circle cx={CAIT.x} cy={CAIT.y} r={NODE_R}
            fill="#E5DDD2" stroke="#C4B9A8" strokeWidth="0.5" />
          <circle cx={CAIT.x} cy={CAIT.y + NODE_R + 4} r="1.5" fill="#5A6B5C" />
        </svg>
      </div>
    );
  }

  // ----- Walsh layout (default) -----
  const MARGARET = { x: 96,  y: 60 };
  const THOMAS   = { x: 144, y: 60 };
  const AOIFE    = { x: 60,  y: 120 };
  const CIARAN   = { x: 120, y: 120 };
  const SIOBHAN  = { x: 180, y: 120 };
  const LIAM     = { x: 60,  y: 162 };

  const SPOUSE_MID = (MARGARET.x + THOMAS.x) / 2;   // 120
  const BUS_Y = 96;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingTop: '75%',  // 4:3
      background: '#F7F4EE',
      borderTopLeftRadius: 10,
      borderTopRightRadius: 10,
      borderBottom: '0.5px solid #D6CFC4',
      overflow: 'hidden',
    }}>
      <svg
        viewBox="0 0 240 180"
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        {/* Spouse line — Gold-Light, 1.5px */}
        <path
          d={`M ${MARGARET.x + NODE_R} ${MARGARET.y} L ${THOMAS.x - NODE_R} ${THOMAS.y}`}
          stroke={STROKE.goldLight} strokeWidth="1.5" fill="none" strokeLinecap="round" />

        {/* Drop to sibling bar */}
        <path
          d={`M ${SPOUSE_MID} ${MARGARET.y + NODE_R} L ${SPOUSE_MID} ${BUS_Y}`}
          stroke={STROKE.warmLight} strokeWidth="0.75" fill="none" strokeLinecap="round" />

        {/* Shared sibling bar */}
        <path
          d={`M ${AOIFE.x} ${BUS_Y} L ${SIOBHAN.x} ${BUS_Y}`}
          stroke={STROKE.warmLight} strokeWidth="0.75" fill="none" strokeLinecap="round" />

        {/* Per-child drops */}
        <path d={`M ${AOIFE.x}   ${BUS_Y} L ${AOIFE.x}   ${AOIFE.y - NODE_R}`}   stroke={STROKE.warmLight} strokeWidth="0.75" fill="none" strokeLinecap="round" />
        <path d={`M ${CIARAN.x}  ${BUS_Y} L ${CIARAN.x}  ${CIARAN.y - NODE_R}`}  stroke={STROKE.warmLight} strokeWidth="0.75" fill="none" strokeLinecap="round" />
        <path d={`M ${SIOBHAN.x} ${BUS_Y} L ${SIOBHAN.x} ${SIOBHAN.y - NODE_R}`} stroke={STROKE.warmLight} strokeWidth="0.75" fill="none" strokeLinecap="round" />

        {/* Aoife → Liam */}
        <path
          d={`M ${AOIFE.x} ${AOIFE.y + NODE_R} L ${LIAM.x} ${LIAM.y - NODE_R}`}
          stroke={STROKE.warmLight} strokeWidth="0.75" fill="none" strokeLinecap="round" />

        {/* Nodes — circular dots, Surface-2 fill, hairline border.
            Margaret (root, selected): Gold-Light fill + Gold border.
            Thomas (deceased): Surface-3 fill, Terra status dot below.
            Others: Surface-2. */}

        {/* Margaret — root, selected */}
        <circle cx={MARGARET.x} cy={MARGARET.y} r={NODE_R}
          fill="#BFA882" stroke="#8C7355" strokeWidth="1" />
        {/* status dot — Sage (living) */}
        <circle cx={MARGARET.x} cy={MARGARET.y + NODE_R + 4} r="1.5" fill="#5A6B5C" />

        {/* Thomas — deceased */}
        <circle cx={THOMAS.x} cy={THOMAS.y} r={NODE_R}
          fill="#D9D0C4" stroke="#C4B9A8" strokeWidth="0.5" />
        <circle cx={THOMAS.x} cy={THOMAS.y + NODE_R + 4} r="1.5" fill="#8C4A38" />

        {/* Children — Aoife, Ciarán, Siobhán (all living) */}
        {[AOIFE, CIARAN, SIOBHAN].map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={NODE_R}
              fill="#E5DDD2" stroke="#C4B9A8" strokeWidth="0.5" />
            <circle cx={p.x} cy={p.y + NODE_R + 4} r="1.5" fill="#5A6B5C" />
          </g>
        ))}

        {/* Liam */}
        <circle cx={LIAM.x} cy={LIAM.y} r={NODE_R}
          fill="#E5DDD2" stroke="#C4B9A8" strokeWidth="0.5" />
        <circle cx={LIAM.x} cy={LIAM.y + NODE_R + 4} r="1.5" fill="#5A6B5C" />
      </svg>
    </div>
  );
}

// ============================================================
// Tree preview card — Surface-1 card with full-bleed thumbnail,
// title + meta beneath, Open tree secondary button right-aligned.
// Mobile: button full-width. Updates when active tree switches.
// ============================================================
function DBTreePreviewCard({ variant = 'desktop', tree }) {
  const isMobile = variant === 'mobile';
  return (
    <div style={{
      background: '#EDE8E0',
      border: '0.5px solid #D6CFC4',
      borderRadius: 10,
      overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <DBTreeThumbnail tree={tree.id} />
      <div style={{
        padding: 16,
        display: 'flex', flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? 14 : 16,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 15,
            color: '#1C1A17', letterSpacing: '-0.005em',
          }}>{tree.name}</span>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 12,
            color: '#7A6F63',
          }}>{tree.members} family members · {tree.generations} generations</span>
        </div>
        <DBSecondaryButton fullWidth={isMobile}>Open tree</DBSecondaryButton>
      </div>
    </div>
  );
}

// ============================================================
// Stats grid — 2×2, --space-3 (12px) gap, four cards.
// ============================================================
function DBStatsGrid({ tree }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 12,
    }}>
      <DBStatCard value={String(tree.members)}     label="Family Members" />
      <DBStatCard value={String(tree.memories)}    label="Memories" />
      <DBStatCard value={String(tree.generations)} label="Generations" />
      <DBStatCard value={String(tree.photos)}      label="Photos" />
    </div>
  );
}

// ============================================================
// Quick actions bar — three ghost buttons in a row.
// Plus Jakarta 400 / 13px / Ink. 16px Warm-Mid icon at left.
// Underline offset 3px. Gap --space-6 (24px).
// ============================================================
function DBQuickAction({ icon, children }) {
  const [hover, setHover] = useDB(false);
  return (
    <a href="#" onClick={e => e.preventDefault()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 13,
        color: '#1C1A17',
        textDecoration: 'underline',
        textUnderlineOffset: 3,
        textDecorationThickness: '0.5px',
        textDecorationColor: '#C4B9A8',
        opacity: hover ? 0.70 : 1,
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
        letterSpacing: '0.005em',
      }}>
      <TVIcon name={icon} size={16} color="#7A6F63" />
      {children}
    </a>
  );
}

function DBQuickActionsBar() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', flexWrap: 'wrap',
      gap: 24,
    }}>
      <DBQuickAction icon="people">Add a person</DBQuickAction>
      <DBQuickAction icon="memories">Add a memory</DBQuickAction>
      <DBQuickAction icon="profile">Invite a family member</DBQuickAction>
    </div>
  );
}

// ============================================================
// "View all memories" ghost link
// ============================================================
function DBViewAllLink({ children }) {
  const [hover, setHover] = useDB(false);
  return (
    <a href="#" onClick={e => e.preventDefault()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        alignSelf: 'flex-start',
        fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 13,
        color: '#1C1A17',
        textDecoration: 'underline',
        textUnderlineOffset: 3,
        textDecorationThickness: '0.5px',
        textDecorationColor: '#C4B9A8',
        opacity: hover ? 0.70 : 1,
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
        letterSpacing: '0.005em',
        marginTop: 4,
      }}>{children}</a>
  );
}

// ============================================================
// Mobile top bar — Parchment, 48px.
// Left: PROSAPIAM wordmark. Right: hamburger + avatar.
// ============================================================
function DBMobileTopBar({ userInitials = 'MW' }) {
  return (
    <div style={{
      height: 48,
      background: '#F7F4EE',
      borderBottom: '0.5px solid #D6CFC4',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
      fontFamily: 'var(--font-ui)',
    }}>
      <span style={{
        fontFamily: 'var(--font-ui)', fontWeight: 300, fontSize: 16,
        color: '#1C1A17', letterSpacing: '0.02em',
      }}>PROSAPIAM</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button type="button" aria-label="Menu" style={{
          width: 24, height: 24, padding: 0,
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="#1C1A17" strokeWidth="1.5" strokeLinecap="round">
            <path d="M3 7h18 M3 12h18 M3 17h18" />
          </svg>
        </button>
        <span style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#E5DDD2',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 12,
          color: '#7A6F63', letterSpacing: '0.02em',
          border: '0.5px solid #D6CFC4',
        }}>{userInitials}</span>
      </div>
    </div>
  );
}

// ============================================================
// Floating action button — 56×56 Ink circle, "+" Parchment.
// No shadow. Bottom-right corner.
// ============================================================
function DBFAB({ right = 16, bottom = 16 }) {
  const [hover, setHover] = useDB(false);
  return (
    <button type="button"
      aria-label="Add a person or memory"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'absolute',
        right, bottom,
        width: 56, height: 56,
        borderRadius: '50%',
        background: '#1C1A17',
        border: 'none',
        cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        opacity: hover ? 0.92 : 1,
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
        zIndex: 7,
        WebkitTapHighlightColor: 'transparent',
      }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
        stroke="#F7F4EE" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 5v14 M5 12h14" />
      </svg>
    </button>
  );
}

// ============================================================
// Recent Memories list — 3 P05 Compact memory cards stacked.
// One with media thumbnail (compact variant has no media per its build),
// so for the dashboard feed we show all three as standard P05 cards in a
// dense vertical stack — content as specified:
//   "The summer we moved to Cork" (with photo, 1974)
//   "Thomas's retirement party" (no photo, 1998)
//   "Aoife's first day of school" (no photo, 1970)
// ============================================================
const WALSH_MEMORIES = [
  {
    date: 'August 1974',
    title: 'The summer we moved to Cork',
    excerpt: "We arrived in Cork on a Sunday in late June, all our things in two trunks and a hatbox that had belonged to her mother. The flat above the bakery had a window facing the river, and on the first morning she sat us at the table with bread still warm from below.",
    media: 'https://images.unsplash.com/photo-1543248939-4296e1fea89b?w=900&q=80&auto=format&fit=crop',
    author: { name: 'Margaret Walsh', status: 'living' },
    timestamp: '2 days ago',
  },
  {
    date: '14 June 1998',
    title: "Thomas's retirement party",
    excerpt: "They held it in the back room at Murphy's — forty years at the shipyard and he wanted no fuss. Of course there was fuss. The grandchildren made a cake, badly iced, that he ate two slices of because he understood what the icing was for.",
    author: { name: 'Aoife Walsh', status: 'living' },
    timestamp: 'Added April 2024',
  },
  {
    date: 'September 1970',
    title: "Aoife's first day of school",
    excerpt: "She wore the green jumper that was still slightly too big and held my hand all the way to the gate. At the gate she let go without being asked, which I had not expected, and walked in by herself with the very particular dignity of a five-year-old.",
    author: { name: 'Margaret Walsh', status: 'living' },
    timestamp: 'Added March 2024',
  },
];

// ============================================================
// Recently viewed people — content per spec.
// All four are P03 compact horizontal — interactive (with chevron).
// ============================================================
const WALSH_RECENT = [
  { name: 'Aoife Walsh',   photo: TC_PHOTO.aoife,   status: 'living',   birthYear: 1965,                relationship: 'Daughter' },
  { name: 'Thomas Walsh',  photo: TC_PHOTO.thomas,  status: 'deceased', birthYear: 1938, deathYear: 2009, relationship: 'Father' },
  { name: 'Ciarán Walsh',  photo: TC_PHOTO.ciaran,  status: 'living',   birthYear: 1968,                relationship: 'Son' },
  { name: 'Siobhán Walsh', photo: TC_PHOTO.siobhan, status: 'living',   birthYear: 1971,                relationship: 'Daughter' },
];

// ----- Murphy Research Tree — sparse 2-generation research project. -----
const MURPHY_RECENT = [
  { name: 'Caitríona Murphy', photo: null, status: 'living',   birthYear: 1956,                  relationship: 'Cousin' },
  { name: 'Eilís Murphy',     photo: null, status: 'deceased', birthYear: 1898, deathYear: 1972, relationship: 'Great-aunt' },
  { name: 'Pádraig Murphy',   photo: null, status: 'deceased', birthYear: 1872, deathYear: 1941, relationship: 'Great-grandfather' },
];

const MURPHY_MEMORIES = [
  {
    date: 'March 1968',
    title: 'Letters from Eilís in Boston',
    excerpt: "Caitríona keeps them in a tin in the dresser drawer — eighteen letters written between 1949 and her last in 1971. Most are about the weather and the price of fish at Faneuil Hall. The last one mentions a christening, and a name we are still trying to place.",
    author: { name: 'Margaret Walsh', status: 'living' },
    timestamp: 'Added last week',
  },
  {
    date: '1903',
    title: 'The deed to Murphy\u2019s Field',
    excerpt: "A registry copy of the land transfer, four acres outside Skibbereen, from Pádraig\u2019s father to him on the occasion of his marriage. The handwriting is sloped and confident; the seal is intact. We have not yet found the bride\u2019s name on any record before this one.",
    author: { name: 'Margaret Walsh', status: 'living' },
    timestamp: 'Added last month',
  },
];

// ============================================================
// Tree summaries — one entry per tree the user has.
// Every tree-scoped block on the dashboard reads from the active entry:
// stats grid, preview card title/thumbnail/meta, recently viewed strip,
// recent memories feed, section labels.
// ============================================================
const TREES = [
  {
    id: 'walsh',
    name: 'Walsh Family Tree',
    members: 5,
    generations: 3,
    memories: 12,
    photos: 8,
    recent: WALSH_RECENT,
    feed:   WALSH_MEMORIES,
  },
  {
    id: 'murphy',
    name: 'Murphy Research Tree',
    members: 3,
    generations: 2,
    memories: 4,
    photos: 1,
    recent: MURPHY_RECENT,
    feed:   MURPHY_MEMORIES,
  },
];

// ============================================================
// DBMiniTreeIcon — 24×24 warm illustration. Same visual vocabulary as
// the tree preview thumbnail, miniaturised. Surface-2 nodes + warm-light
// connectors, plus a gold-light spouse line on the walsh variant.
// ============================================================
function DBMiniTreeIcon({ variant = 'walsh' }) {
  if (variant === 'murphy') {
    // 1 ancestor → 2 children (3 members, 2 generations)
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 7v3 M7 10h10 M7 10v3 M17 10v3"
          stroke="#C4B9A8" strokeWidth="0.75" strokeLinecap="round" />
        <circle cx="12" cy="5"  r="2" fill="#D9D0C4" stroke="#C4B9A8" strokeWidth="0.5" />
        <circle cx="7"  cy="15" r="2" fill="#D9D0C4" stroke="#C4B9A8" strokeWidth="0.5" />
        <circle cx="17" cy="15" r="2" fill="#E5DDD2" stroke="#C4B9A8" strokeWidth="0.5" />
      </svg>
    );
  }
  // walsh — 2 parents + spouse line, 3 children
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 5h2" stroke="#BFA882" strokeWidth="1" strokeLinecap="round" />
      <path d="M12 7v3 M5 10h14 M5 10v4 M12 10v4 M19 10v4"
        stroke="#C4B9A8" strokeWidth="0.75" strokeLinecap="round" />
      <circle cx="9"  cy="5"  r="2" fill="#BFA882" stroke="#8C7355" strokeWidth="0.5" />
      <circle cx="15" cy="5"  r="2" fill="#D9D0C4" stroke="#C4B9A8" strokeWidth="0.5" />
      <circle cx="5"  cy="16" r="2" fill="#E5DDD2" stroke="#C4B9A8" strokeWidth="0.5" />
      <circle cx="12" cy="16" r="2" fill="#E5DDD2" stroke="#C4B9A8" strokeWidth="0.5" />
      <circle cx="19" cy="16" r="2" fill="#E5DDD2" stroke="#C4B9A8" strokeWidth="0.5" />
    </svg>
  );
}

// ============================================================
// DBTreeChip — one entry in the tree switcher row.
//   48px tall, 160–220 wide. Surface-1 bg, hairline border.
//   Active: 1px Gold border + 3px Gold top accent bar + Ink name.
//   Inactive: default border, Warm-Mid name. Hover: Surface-3 bg,
//     border-strong, chevron appears on the right.
// ============================================================
function DBTreeChip({ tree, active = false, onClick }) {
  const [hover, setHover] = useDB(false);
  const showHoverState = hover && !active;
  return (
    <button type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={tree.name}
      style={{
        position: 'relative',
        height: 48, minWidth: 160, maxWidth: 220,
        padding: '0 16px',
        background: showHoverState ? '#D9D0C4' : '#EDE8E0',
        border: active
          ? '1px solid #8C7355'
          : (showHoverState ? '0.5px solid #C4B9A8' : '0.5px solid #D6CFC4'),
        borderRadius: 10,
        display: 'inline-flex', alignItems: 'center', gap: 12,
        cursor: 'pointer',
        textAlign: 'left',
        flexShrink: 0,
        boxSizing: 'border-box',
        transition: 'background 150ms cubic-bezier(.22,1,.36,1), border-color 150ms cubic-bezier(.22,1,.36,1)',
        WebkitTapHighlightColor: 'transparent',
        overflow: 'hidden',
      }}>
      {/* 3px Gold top accent bar — only on active chip */}
      {active && (
        <span aria-hidden="true" style={{
          position: 'absolute',
          left: 14, right: 14, top: 0, height: 3,
          background: '#8C7355',
          borderRadius: '0 0 2px 2px',
          pointerEvents: 'none',
        }} />
      )}

      <DBMiniTreeIcon variant={tree.id} />

      <span style={{
        display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1, gap: 1,
      }}>
        <span style={{
          fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 13,
          color: active ? '#1C1A17' : (showHoverState ? '#1C1A17' : '#7A6F63'),
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          transition: 'color 150ms cubic-bezier(.22,1,.36,1)',
        }}>{tree.name}</span>
        <span style={{
          fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 11,
          color: '#7A6F63', letterSpacing: '0.005em',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{tree.members} members</span>
      </span>

      {/* Chevron — only on hover, never on active */}
      <span aria-hidden="true" style={{
        opacity: showHoverState ? 1 : 0,
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="#7A6F63" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 6l6 6-6 6" />
        </svg>
      </span>
    </button>
  );
}

// ============================================================
// DBAddTreeChip — dashed hairline border, transparent bg,
// "+" icon left, "Add a tree" label. Hover: border-strong, Ink text.
// ============================================================
function DBAddTreeChip({ onClick }) {
  const [hover, setHover] = useDB(false);
  return (
    <button type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: 48, minWidth: 160, maxWidth: 220,
        padding: '0 16px',
        background: 'transparent',
        border: hover ? '0.5px dashed #C4B9A8' : '0.5px dashed #D6CFC4',
        borderRadius: 10,
        display: 'inline-flex', alignItems: 'center', gap: 8,
        cursor: 'pointer',
        color: hover ? '#1C1A17' : '#7A6F63',
        fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 13,
        letterSpacing: '0.005em',
        flexShrink: 0,
        boxSizing: 'border-box',
        transition: 'border-color 150ms cubic-bezier(.22,1,.36,1), color 150ms cubic-bezier(.22,1,.36,1)',
        WebkitTapHighlightColor: 'transparent',
      }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14 M5 12h14" />
      </svg>
      Add a tree
    </button>
  );
}

// ============================================================
// DBTreeSwitcher — the row that holds the tree chips + Add chip.
// Desktop: section label "Your Trees" + horizontal row, left-aligned.
// Mobile:  same label, horizontally scrollable row, 24px left padding,
//          bleeds right so the next chip is half-visible as a scroll
//          affordance. "Add a tree" always last.
// ============================================================
function DBTreeSwitcher({ trees, activeId, onSelect, onAdd, variant = 'desktop' }) {
  const isMobile = variant === 'mobile';

  const chips = (
    <>
      {trees.map(t => (
        <DBTreeChip key={t.id} tree={t}
          active={t.id === activeId}
          onClick={() => onSelect && onSelect(t.id)} />
      ))}
      <DBAddTreeChip onClick={onAdd} />
    </>
  );

  if (isMobile) {
    return (
      <div>
        <div style={{ padding: '0 24px' }}>
          <DBSectionLabel>Your Trees</DBSectionLabel>
        </div>
        <div className="s2-mobile-tree-scroll" style={{
          display: 'flex', gap: 12,
          overflowX: 'auto', overflowY: 'hidden',
          padding: '4px 0 4px 24px',
          scrollbarWidth: 'none',
        }}>
          {chips}
          <div aria-hidden="true" style={{ flex: '0 0 1px' }} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <DBSectionLabel>Your Trees</DBSectionLabel>
      <div style={{
        display: 'flex',
        gap: 12,
        flexWrap: 'nowrap',
        alignItems: 'stretch',
      }}>
        {chips}
      </div>
    </div>
  );
}

// ============================================================
// P03 compact horizontal — overrides the existing compact variant
// behaviour for the dashboard strip: shows the chevron (interactive)
// even at compact size. We render the approved component with variant
// "interactive" but with the compact sizing override applied via a
// thin local wrapper that swaps inline sizing — without restyling the
// component itself. Per spec: "compact horizontal variant, interactive
// — with chevron."
// We achieve this by feeding the interactive variant and tightening the
// outer wrapper width / padding through CSS only.
// ============================================================
function DBRecentPersonCard({ person, onClick }) {
  return (
    <div style={{ minWidth: 0, flex: '1 1 0' }}>
      <PersonSummaryCard
        name={person.name}
        photo={person.photo}
        status={person.status}
        birthYear={person.birthYear}
        deathYear={person.deathYear}
        relationship={person.relationship}
        variant="interactive"
        onClick={onClick}
      />
    </div>
  );
}

Object.assign(window, {
  DBWelcomeHeader, DBPrimaryButton, DBSecondaryButton,
  DBStatCard, DBStatsGrid,
  DBTreeThumbnail, DBTreePreviewCard,
  DBQuickAction, DBQuickActionsBar, DBSectionLabel,
  DBViewAllLink, DBMobileTopBar, DBFAB,
  DBRecentPersonCard,
  DBMiniTreeIcon, DBTreeChip, DBAddTreeChip, DBTreeSwitcher,
  WALSH_MEMORIES, WALSH_RECENT,
  MURPHY_MEMORIES, MURPHY_RECENT,
  TREES,
});
