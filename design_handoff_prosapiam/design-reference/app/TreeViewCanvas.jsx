// TreeViewCanvas.jsx — the Walsh family tree composition.
// Uses approved P01 (FamilyTreeNode) and P02 (RelationshipConnector primitives) — no restyling.
// Renders a fixed spatial layout. Static mock; no pan/zoom interaction.
//
// Family data (Walsh):
//   - Margaret Walsh (root, b. 1943)        — Gold-Light bg, selected (Gold border)
//   - Thomas Walsh   (1938 – 2009)          — deceased, grayscale, Terra dot
//   - Aoife Walsh    (b. 1965)              — child
//   - Ciarán Walsh   (b. 1968)              — child
//   - Siobhán Walsh  (b. 1971)              — child
//   - Liam Walsh     (b. 1994)              — Aoife's son
//   - Add-person node above Thomas          — invites adding his parents
//
// Spec rules honoured:
//   - Parchment background only (the page sets it; we draw connectors over it).
//   - Connectors: 1px Warm-Light parent-child, 2px Gold-Light spouse — no curves, no arrowheads.
//   - Single shared sibling bar for the three children.
//   - No drop shadows. No gradient. No grid lines.
//   - Status dots outside the boundary.

// Archival-feeling Unsplash portraits — same vocabulary as the P01 / P02 sheets.
const TC_PHOTO = {
  margaret: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=300&q=80&auto=format&fit=crop&crop=faces',
  thomas:   'https://images.unsplash.com/photo-1545167622-3a6ac756afa4?w=300&q=80&auto=format&fit=crop&crop=faces',
  aoife:    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&q=80&auto=format&fit=crop&crop=faces',
  ciaran:   'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80&auto=format&fit=crop&crop=faces',
  siobhan:  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80&auto=format&fit=crop&crop=faces',
  liam:     'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&q=80&auto=format&fit=crop&crop=faces',
};

// ----------------------------------------------------------
// Helper — Position a P01 node by its center-x and top-y inside an
// absolutely-positioned canvas container. Width is derived from zoom
// so the connector geometry can be computed against the same numbers.
// ----------------------------------------------------------
function TCNode({ cx, top, zoom = 'full', ...props }) {
  const w = zoom === 'compact' ? 40 : 120;
  return (
    <div style={{
      position: 'absolute',
      left: cx - w / 2,
      top,
      width: w,
      pointerEvents: 'auto',
    }}>
      <FamilyTreeNode zoom={zoom} {...props} />
    </div>
  );
}

// ----------------------------------------------------------
// Tree canvas — sized to fit its container; positions chosen so Margaret
// is centered in the canvas's visible region.
// ----------------------------------------------------------
function TreeCanvas({ mode = 'desktop' }) {
  if (mode === 'mobile') return <TreeCanvasMobile />;
  return <TreeCanvasDesktop />;
}

// ===========================================================
// Desktop tree canvas
// ===========================================================
function TreeCanvasDesktop() {
  // Geometry — coordinates relative to the canvas div (top-left = 0,0).
  // Margaret is centered in the visible region of the canvas (i.e. left of
  // the right detail panel). The tree breathes — no crowding at the edges.
  const ADD     = { cx: 660, top: 72 };
  const ROW1_Y  = 230;        // gen 1 (Margaret + Thomas) top
  const ROW2_Y  = 470;        // gen 2 (three children) top
  const ROW3_Y  = 670;        // gen 3 (Liam) top
  const NODE_H  = 110;        // approximate full-zoom box height (excl. dot extension)
  const PARENT_BOTTOM = ROW1_Y + NODE_H;            // 340
  const SPOUSE_Y      = ROW1_Y + 50;                // ~280 (vertical center of nodes)
  const BUS_Y         = ROW2_Y - 38;                // 432 — single shared sibling bar
  const PARENT2_BOTTOM = ROW2_Y + NODE_H;           // 580
  const LIAM_BUS_Y    = ROW3_Y - 28;                // 642 — only one child, short stub

  const MARGARET = { cx: 460 };
  const THOMAS   = { cx: 660 };
  const AOIFE    = { cx: 300 };
  const CIARAN   = { cx: 510 };
  const SIOBHAN  = { cx: 720 };
  const LIAM     = { cx: 300 };

  // Spouse line geometry — between Margaret's right edge and Thomas's left edge.
  const NODE_HALF = 60;
  const SPOUSE_X1 = MARGARET.cx + NODE_HALF; // 520
  const SPOUSE_X2 = THOMAS.cx   - NODE_HALF; // 600
  const SPOUSE_MID_X = (MARGARET.cx + THOMAS.cx) / 2; // 560

  // Stroke style — Gold-Light spouse, Warm-Light parent-child (token values from the spec).
  const STROKE = {
    warmLight: '#C4B9A8',
    goldLight: '#BFA882',
  };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      cursor: 'grab',
      // The canvas background is set by the parent (.tree-canvas).
      // This wrapper holds tree geometry only.
    }}>
      {/* SVG connector layer — under the nodes, never above them. */}
      <svg
        viewBox="0 0 1220 852"
        preserveAspectRatio="xMinYMin meet"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', overflow: 'visible',
        }}>
        {/* Spouse line — 2px Gold-Light. Margaret ↔ Thomas. */}
        <path
          d={`M ${SPOUSE_X1} ${SPOUSE_Y} L ${SPOUSE_X2} ${SPOUSE_Y}`}
          stroke={STROKE.goldLight} strokeWidth="2" fill="none" strokeLinecap="round"
        />

        {/* Drop from spouse midpoint down to sibling bar */}
        <path
          d={`M ${SPOUSE_MID_X} ${PARENT_BOTTOM} L ${SPOUSE_MID_X} ${BUS_Y}`}
          stroke={STROKE.warmLight} strokeWidth="1" fill="none" strokeLinecap="round"
        />

        {/* Shared sibling bar — single horizontal segment spanning all 3 children. */}
        <path
          d={`M ${Math.min(AOIFE.cx, SPOUSE_MID_X)} ${BUS_Y} L ${Math.max(SIOBHAN.cx, SPOUSE_MID_X)} ${BUS_Y}`}
          stroke={STROKE.warmLight} strokeWidth="1" fill="none" strokeLinecap="round"
        />

        {/* Per-child drops from bar to top of each child */}
        <path d={`M ${AOIFE.cx}   ${BUS_Y} L ${AOIFE.cx}   ${ROW2_Y}`} stroke={STROKE.warmLight} strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d={`M ${CIARAN.cx}  ${BUS_Y} L ${CIARAN.cx}  ${ROW2_Y}`} stroke={STROKE.warmLight} strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d={`M ${SIOBHAN.cx} ${BUS_Y} L ${SIOBHAN.cx} ${ROW2_Y}`} stroke={STROKE.warmLight} strokeWidth="1" fill="none" strokeLinecap="round" />

        {/* Aoife → Liam — single-parent child. Drop from Aoife's bottom to Liam's top. */}
        <path
          d={`M ${AOIFE.cx} ${PARENT2_BOTTOM} L ${AOIFE.cx} ${LIAM_BUS_Y} L ${LIAM.cx} ${LIAM_BUS_Y} L ${LIAM.cx} ${ROW3_Y}`}
          stroke={STROKE.warmLight} strokeWidth="1" fill="none" strokeLinecap="round"
        />

        {/* Add-person stub — connects to top of Thomas. Invites adding his parents. */}
        <path
          d={`M ${ADD.cx} ${ADD.top + 48} L ${ADD.cx} ${ROW1_Y}`}
          stroke={STROKE.warmLight} strokeWidth="1" fill="none" strokeLinecap="round"
        />
      </svg>

      {/* Add-person node — above Thomas, inviting his parents */}
      <TCNode cx={ADD.cx} top={ADD.top} kind="add" />

      {/* Generation 1 — Margaret (root, selected) + Thomas (deceased) */}
      <TCNode
        cx={MARGARET.cx} top={ROW1_Y}
        name="Margaret Walsh"
        photo={TC_PHOTO.margaret}
        status="living"
        birthYear={1943}
        kind="root"
        state="selected"
      />
      <TCNode
        cx={THOMAS.cx} top={ROW1_Y}
        name="Thomas Walsh"
        photo={TC_PHOTO.thomas}
        status="deceased"
        birthYear={1938}
        deathYear={2009}
      />

      {/* Generation 2 — three living children */}
      <TCNode
        cx={AOIFE.cx} top={ROW2_Y}
        name="Aoife Walsh" photo={TC_PHOTO.aoife}
        status="living" birthYear={1965}
      />
      <TCNode
        cx={CIARAN.cx} top={ROW2_Y}
        name="Ciarán Walsh" photo={TC_PHOTO.ciaran}
        status="living" birthYear={1968}
      />
      <TCNode
        cx={SIOBHAN.cx} top={ROW2_Y}
        name="Siobhán Walsh" photo={TC_PHOTO.siobhan}
        status="living" birthYear={1971}
      />

      {/* Generation 3 — Liam (Aoife's son) */}
      <TCNode
        cx={LIAM.cx} top={ROW3_Y}
        name="Liam Walsh" photo={TC_PHOTO.liam}
        status="living" birthYear={1994}
      />
    </div>
  );
}

// ===========================================================
// Mobile tree canvas — medium-zoom nodes, tighter geometry.
// Static state, before bottom sheet overlap. Tree is positioned
// so Margaret is centered horizontally and visible above the sheet.
// ===========================================================
function TreeCanvasMobile() {
  // Medium zoom — node width 120, height ~76 (avatar 32 + name + dot).
  const NODE_H = 76;

  const ADD      = { cx: 280, top: 16 };
  const ROW1_Y   = 88;
  const ROW2_Y   = 240;
  const ROW3_Y   = 376;
  const PARENT1_BOTTOM = ROW1_Y + NODE_H;     // 164
  const SPOUSE_Y       = ROW1_Y + 38;         // 126
  const BUS_Y          = ROW2_Y - 30;         // 210
  const PARENT2_BOTTOM = ROW2_Y + NODE_H;     // 316
  const LIAM_BUS_Y     = ROW3_Y - 24;         // 352

  const MARGARET = { cx: 140 };
  const THOMAS   = { cx: 280 };
  const AOIFE    = { cx: 60  };
  const CIARAN   = { cx: 195 };
  const SIOBHAN  = { cx: 330 };
  const LIAM     = { cx: 60  };

  const NODE_HALF = 60;
  const SPOUSE_X1 = MARGARET.cx + NODE_HALF;
  const SPOUSE_X2 = THOMAS.cx   - NODE_HALF;
  const SPOUSE_MID_X = (MARGARET.cx + THOMAS.cx) / 2;

  const STROKE = {
    warmLight: '#C4B9A8',
    goldLight: '#BFA882',
  };

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {/* SVG connectors */}
      <svg
        viewBox="0 0 390 720"
        preserveAspectRatio="xMinYMin meet"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          pointerEvents: 'none', overflow: 'visible',
        }}>
        <path d={`M ${SPOUSE_X1} ${SPOUSE_Y} L ${SPOUSE_X2} ${SPOUSE_Y}`}
          stroke={STROKE.goldLight} strokeWidth="1.5" fill="none" strokeLinecap="round" />

        <path d={`M ${SPOUSE_MID_X} ${PARENT1_BOTTOM} L ${SPOUSE_MID_X} ${BUS_Y}`}
          stroke={STROKE.warmLight} strokeWidth="0.5" fill="none" strokeLinecap="round" />
        <path
          d={`M ${Math.min(AOIFE.cx, SPOUSE_MID_X)} ${BUS_Y} L ${Math.max(SIOBHAN.cx, SPOUSE_MID_X)} ${BUS_Y}`}
          stroke={STROKE.warmLight} strokeWidth="0.5" fill="none" strokeLinecap="round" />
        <path d={`M ${AOIFE.cx}   ${BUS_Y} L ${AOIFE.cx}   ${ROW2_Y}`} stroke={STROKE.warmLight} strokeWidth="0.5" fill="none" />
        <path d={`M ${CIARAN.cx}  ${BUS_Y} L ${CIARAN.cx}  ${ROW2_Y}`} stroke={STROKE.warmLight} strokeWidth="0.5" fill="none" />
        <path d={`M ${SIOBHAN.cx} ${BUS_Y} L ${SIOBHAN.cx} ${ROW2_Y}`} stroke={STROKE.warmLight} strokeWidth="0.5" fill="none" />

        <path
          d={`M ${AOIFE.cx} ${PARENT2_BOTTOM} L ${AOIFE.cx} ${LIAM_BUS_Y} L ${LIAM.cx} ${LIAM_BUS_Y} L ${LIAM.cx} ${ROW3_Y}`}
          stroke={STROKE.warmLight} strokeWidth="0.5" fill="none" strokeLinecap="round" />

        <path
          d={`M ${ADD.cx} ${ADD.top + 48} L ${ADD.cx} ${ROW1_Y}`}
          stroke={STROKE.warmLight} strokeWidth="0.5" fill="none" strokeLinecap="round" />
      </svg>

      <TCNode cx={ADD.cx} top={ADD.top} kind="add" zoom="medium" />

      <TCNode
        cx={MARGARET.cx} top={ROW1_Y}
        name="Margaret Walsh" photo={TC_PHOTO.margaret}
        status="living" birthYear={1943}
        kind="root" state="selected"
        zoom="medium"
      />
      <TCNode
        cx={THOMAS.cx} top={ROW1_Y}
        name="Thomas Walsh" photo={TC_PHOTO.thomas}
        status="deceased" birthYear={1938} deathYear={2009}
        zoom="medium"
      />

      <TCNode cx={AOIFE.cx}   top={ROW2_Y} name="Aoife Walsh"   photo={TC_PHOTO.aoife}   status="living" birthYear={1965} zoom="medium" />
      <TCNode cx={CIARAN.cx}  top={ROW2_Y} name="Ciarán Walsh"  photo={TC_PHOTO.ciaran}  status="living" birthYear={1968} zoom="medium" />
      <TCNode cx={SIOBHAN.cx} top={ROW2_Y} name="Siobhán Walsh" photo={TC_PHOTO.siobhan} status="living" birthYear={1971} zoom="medium" />

      <TCNode cx={LIAM.cx} top={ROW3_Y} name="Liam Walsh" photo={TC_PHOTO.liam} status="living" birthYear={1994} zoom="medium" />
    </div>
  );
}

Object.assign(window, { TreeCanvas, TreeCanvasDesktop, TreeCanvasMobile, TC_PHOTO });
