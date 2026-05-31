// RelationshipConnector.jsx — P02 Relationship Connector
// Per Component Library Brief, Page Architecture Brief, Design System v1.1.
//
// Typography substitution note (per project convention):
//   The brief calls for Avenir Next. The design system in this project ships
//   Plus Jakarta Sans (UI face). Connector labels use Plus Jakarta 400 / 10px
//   / Warm-Mid in place of "Avenir Next 400, 10px, Warm-Mid" — every other
//   spec value (weights, colors, dash arrays, opacity) is honoured exactly.
//
// Routing rules:
//   - Orthogonal only — horizontal + vertical segments. No diagonals, no curves.
//   - Parent-child: exits bottom-center of parent, drops to a shared horizontal
//     "sibling bar," then rises to top-center of each child. The sibling bar
//     is a single shared segment, not per-child duplicates.
//   - Spouse: a single horizontal line between the center-right of one node
//     and the center-left of the other. No vertical component on the same row.
//
// Variants (lineKind):
//   parent-child            — 1px   Warm-Light  solid
//   spouse                  — 2px   Gold-Light  solid
//   spouse-divorced         — 1.5px Warm-Light  dashed (6,4)
//   parent-child-adopted    — 1px   Warm-Light  dashed (4,3)
//   parent-child-uncertain  — 1px   Warm-Light  dotted (2,4)
//   sibling-bar             — 1px   Warm-Light  solid (structural; same as standard)
//
// States:
//   default | hover | selected | muted
//
// Zoom-aware: at zoom < 75% weight reduces by 0.5px; at 50% all styles
// simplify to solid 0.5px (dashed/dotted indistinguishable at that scale).

const { useState: useRC } = React;

// ----------------------------------------------------------
// Token lookup — kept tight, defined once, no inline magic strings.
// ----------------------------------------------------------
const RC_COLOR = {
  warmLight:  '#C4B9A8',
  warmMid:    '#7A6F63',
  goldLight:  '#BFA882',
  gold:       '#8C7355',
  parchment:  '#F7F4EE',
  ink:        '#1C1A17',
};

// Returns { stroke, weight, dash } for a given lineKind + state + zoom.
function rcResolveStroke(lineKind, state, zoom) {
  // Base spec
  const base = (() => {
    switch (lineKind) {
      case 'spouse':
        return { stroke: RC_COLOR.goldLight, weight: 2,   dash: null };
      case 'spouse-divorced':
        return { stroke: RC_COLOR.warmLight, weight: 1.5, dash: '6 4' };
      case 'parent-child-adopted':
        return { stroke: RC_COLOR.warmLight, weight: 1,   dash: '4 3' };
      case 'parent-child-uncertain':
        return { stroke: RC_COLOR.warmLight, weight: 1,   dash: '2 4' };
      case 'sibling-bar':
      case 'parent-child':
      default:
        return { stroke: RC_COLOR.warmLight, weight: 1,   dash: null };
    }
  })();

  // State overrides
  let { stroke, weight, dash } = base;
  if (state === 'hover') {
    stroke = RC_COLOR.warmMid;
    weight = base.weight + 0.5;
  } else if (state === 'selected') {
    stroke = RC_COLOR.gold;
    // Brief: weight increases to 2px for "standard" connectors
    weight = Math.max(base.weight, 2);
  }

  // Zoom adjustments
  if (zoom === 'medium') {
    // < 75% — reduce by 0.5px to prevent visual density
    weight = Math.max(0.5, weight - 0.5);
  } else if (zoom === 'compact') {
    // 50% — simplify to solid 0.5px
    weight = 0.5;
    dash = null;
  }

  return { stroke, weight, dash };
}

// ----------------------------------------------------------
// <RCLine> — single SVG path with the right stroke + dash array.
// Path is given as an SVG `d` string (caller computes geometry).
// ----------------------------------------------------------
function RCLine({ d, lineKind = 'parent-child', state = 'default', zoom = 'full', muted = false, opacity }) {
  const { stroke, weight, dash } = rcResolveStroke(lineKind, state, zoom);
  const finalOpacity = opacity != null ? opacity : (muted ? 0.30 : 1);
  return (
    <path
      d={d}
      stroke={stroke}
      strokeWidth={weight}
      strokeDasharray={dash || undefined}
      strokeLinecap={dash ? 'butt' : 'round'}
      fill="none"
      opacity={finalOpacity}
      style={{ transition: 'stroke 150ms cubic-bezier(.22,1,.36,1), stroke-width 150ms cubic-bezier(.22,1,.36,1)' }}
    />
  );
}

// ----------------------------------------------------------
// <RCLabel> — optional inline label on a connector.
// Plus Jakarta 400 / 10px / Warm-Mid on a Parchment pill (2px h-pad, 0 v-pad).
// Centered on the line. Use only when the line style alone is ambiguous.
// ----------------------------------------------------------
function RCLabel({ x, y, text }) {
  if (!text) return null;
  // We render via SVG <foreignObject> so the pill background is a real DOM box
  // — easier to size against actual text metrics than an SVG <rect>+<text> pair.
  const w = Math.max(28, text.length * 5.6 + 6); // estimate; pill auto-fits
  const h = 14;
  return (
    <foreignObject x={x - w / 2} y={y - h / 2} width={w} height={h} style={{ overflow: 'visible' }}>
      <div xmlns="http://www.w3.org/1999/xhtml" style={{
        fontFamily: 'var(--font-ui)',
        fontWeight: 400,
        fontSize: 10,
        lineHeight: '14px',
        color: RC_COLOR.warmMid,
        background: RC_COLOR.parchment,
        padding: '0 2px',
        textAlign: 'center',
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}>{text}</div>
    </foreignObject>
  );
}

// ----------------------------------------------------------
// Path helpers — orthogonal routing.
// ----------------------------------------------------------

// Spouse line: horizontal segment between two nodes on the same row.
// Returns the path `d` and a midpoint for label placement.
function rcSpousePath({ x1, x2, y }) {
  return {
    d: `M ${x1} ${y} L ${x2} ${y}`,
    mid: { x: (x1 + x2) / 2, y },
  };
}

// Parent-child path: from (px, py) bottom-center of parent down to busY,
// then up to (cx, cy) top-center of child.
// Used for individual child legs above/below the sibling bar.
function rcChildLegPath({ px, py, cx, cy, busY }) {
  // parent leg: drop from parent to bus
  const parentLeg = `M ${px} ${py} L ${px} ${busY}`;
  // child leg: bus → over to child x → down to child top
  const childLeg = `M ${cx} ${busY} L ${cx} ${cy}`;
  return { parentLeg, childLeg };
}

// ----------------------------------------------------------
// <RCFamilyGroup> — composes a parent pair + their children with a
// shared sibling bar, rendered as SVG paths.
// All geometry comes in as pixel coordinates (caller positions the nodes).
//
// Props:
//   parents:   [{x, y, bottom}, {x, y, bottom}] — node centers + bottom Y
//   children:  [{x, top, lineKind?, state?, label?, muted?}]
//   spouseKind: 'spouse' | 'spouse-divorced'
//   spouseState, spouseLabel
//   busOffset:  vertical pixels above children's top — where the sibling bar sits.
//   zoom, focusChildIndex (for muted demo)
// ----------------------------------------------------------
function RCFamilyGroup({
  parents,
  children,
  spouseKind = 'spouse',
  spouseState = 'default',
  spouseLabel = null,
  spouseMuted = false,
  busOffset = 32,
  zoom = 'full',
  width = 800,
  height = 400,
}) {
  if (!parents || parents.length < 2 || !children || children.length === 0) return null;

  const [pA, pB] = parents;
  // Spouse line between the two parents at their vertical center
  const spouseY = (pA.y + pB.y) / 2;
  const spouse = rcSpousePath({
    x1: Math.min(pA.right, pB.right),
    x2: Math.max(pA.left, pB.left),
    y: spouseY,
  });

  // Sibling bar Y — a fixed offset above the highest child top.
  const childTopMin = Math.min(...children.map(c => c.top));
  const busY = childTopMin - busOffset;
  // Drop from spouse midpoint to the bus
  const spouseMidX = (pA.x + pB.x) / 2;
  const parentBottomY = Math.max(pA.bottom, pB.bottom);
  const dropD = `M ${spouseMidX} ${parentBottomY} L ${spouseMidX} ${busY}`;

  // Sibling bar — single horizontal segment spanning all child x's (and the drop).
  const childXs = children.map(c => c.x);
  const barX1 = Math.min(spouseMidX, ...childXs);
  const barX2 = Math.max(spouseMidX, ...childXs);
  const barD = `M ${barX1} ${busY} L ${barX2} ${busY}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
    >
      {/* Spouse line */}
      <RCLine d={spouse.d} lineKind={spouseKind} state={spouseState} zoom={zoom} muted={spouseMuted} />
      {spouseLabel && <RCLabel x={spouse.mid.x} y={spouse.mid.y} text={spouseLabel} />}

      {/* Drop from spouse midpoint to sibling bar */}
      <RCLine d={dropD} lineKind="parent-child" zoom={zoom} muted={spouseMuted} />

      {/* Sibling bar — one shared segment */}
      <RCLine d={barD} lineKind="sibling-bar" zoom={zoom} muted={spouseMuted} />

      {/* Each child leg: bar → child top.
          Per-child lineKind/state/muted/label support. */}
      {children.map((c, i) => {
        const d = `M ${c.x} ${busY} L ${c.x} ${c.top}`;
        const labelY = (busY + c.top) / 2;
        return (
          <React.Fragment key={i}>
            <RCLine
              d={d}
              lineKind={c.lineKind || 'parent-child'}
              state={c.state || 'default'}
              zoom={zoom}
              muted={c.muted || false}
            />
            {c.label && <RCLabel x={c.x} y={labelY} text={c.label} />}
          </React.Fragment>
        );
      })}
    </svg>
  );
}

Object.assign(window, {
  RCLine,
  RCLabel,
  RCFamilyGroup,
  rcResolveStroke,
  rcSpousePath,
  rcChildLegPath,
  RC_COLOR,
});
