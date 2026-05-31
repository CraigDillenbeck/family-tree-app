// FamilyTreeNode.jsx — P01 Family Tree Node component
// Per Component Library Brief, Page Architecture Brief, Design System v1.1.
//
// Typography substitution note (per project convention):
//   The brief calls for Avenir Next. The design system in this project ships
//   Plus Jakarta Sans (UI face). Every weight, size, casing, and spacing rule
//   from the brief is honoured exactly. No Cormorant — this is a spatial
//   navigation element, not a narrative surface.
//
// Anatomy (default, full zoom):
//   ┌────────────────────┐
//   │      [avatar]      │   48px circular, deceased = grayscale 25%
//   │   First Last       │   Plus Jakarta 500 / 13px / Ink
//   │   1932 – 2011      │   Plus Jakarta 400 / 11px / Warm-Mid
//   └────────────────────┘
//          • status         6px dot, outside boundary, bottom-center
//
// Container: Surface-1 / 0.5px Warm-border / radius-lg 10 / pad space-3 12 / 120w
// Depth: tonal contrast against Parchment canvas only — no drop shadows.
//
// Variants:
//   zoom: full | medium | compact
//   state: default | hover | selected | viewing | focus | disabled
//   kind: person | add | unknown | root

const { useState: useFTN } = React;

// ----------------------------------------------------------
// Avatar — circular, photo or initials, deceased grayscale 25%
// Sizes per zoom: 48 (full) · 32 (medium) · 24 (compact)
// ----------------------------------------------------------
function FTNAvatar({ name, photo, status = 'living', size = 48, kind = 'person' }) {
  const [imgFailed, setImgFailed] = useFTN(false);

  const initials = (name || '·')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const isDeceased = status === 'deceased';
  const isUnknown = kind === 'unknown';
  const fontSize = Math.round(size * 0.36);
  const ring = '0.5px solid #D6CFC4';

  // Photo path
  if (photo && !imgFailed && !isUnknown) {
    return (
      <span style={{
        width: size, height: size, borderRadius: '9999px', overflow: 'hidden',
        display: 'inline-block', background: '#E5DDD2', border: ring,
        flexShrink: 0, position: 'relative',
      }}>
        <img
          src={photo}
          alt={name}
          onError={() => setImgFailed(true)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            filter: isDeceased ? 'grayscale(0.25)' : 'none',
          }}
        />
      </span>
    );
  }

  // Initials / unknown fallback
  // Surface-2 default · Surface-3 deceased · Warm-Mid text at weight 500
  return (
    <span style={{
      width: size, height: size, borderRadius: '9999px',
      background: isDeceased ? '#D9D0C4' : '#E5DDD2',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-ui)',
      fontWeight: 500, fontSize,
      color: isUnknown ? '#C4B9A8' : '#7A6F63',
      letterSpacing: '0.02em',
      border: ring, flexShrink: 0,
      filter: isDeceased ? 'grayscale(0.25)' : 'none',
    }}>{isUnknown ? '?' : initials}</span>
  );
}

// ----------------------------------------------------------
// Status dot — 6px, outside the node boundary, bottom-center.
// Sage (living) · Terra (deceased) · Warm-Light (unknown).
// Replaces the Badge component at this scale per brief.
// ----------------------------------------------------------
function FTNStatusDot({ status = 'living' }) {
  const color =
    status === 'deceased' ? '#8C4A38' :
    status === 'unknown'  ? '#C4B9A8' :
                            '#5A6B5C';
  return (
    <span aria-hidden="true" style={{
      position: 'absolute',
      left: '50%',
      bottom: -9, // outside the node boundary
      transform: 'translateX(-50%)',
      width: 6, height: 6, borderRadius: '9999px',
      background: color,
      // Tiny parchment ring so the dot reads cleanly against any canvas tone
      boxShadow: '0 0 0 2px #F7F4EE',
    }} />
  );
}

// ----------------------------------------------------------
// FamilyTreeNode — P01
// ----------------------------------------------------------
function FamilyTreeNode({
  name = '',
  photo = null,
  status = 'living',          // 'living' | 'deceased' | 'unknown'
  birthYear,
  deathYear,
  zoom = 'full',              // 'full' | 'medium' | 'compact'
  state = 'default',          // 'default' | 'hover' | 'selected' | 'viewing' | 'focus' | 'disabled'
  kind = 'person',            // 'person' | 'add' | 'unknown' | 'root'
  onClick,
  ariaLabel,
}) {

  // -- Add person variant — dashed circle, + icon. Standalone shape. --------
  if (kind === 'add') {
    return <FTNAddNode state={state} onClick={onClick} />;
  }

  // -- Sizing scale by zoom -------------------------------------------------
  const isFull    = zoom === 'full';
  const isMedium  = zoom === 'medium';
  const isCompact = zoom === 'compact';

  const avatarSize = isFull ? 48 : isMedium ? 32 : 24;
  const showName   = !isCompact;
  const showDates  = isFull;
  const showDot    = !isCompact; // compact has no dot per brief

  const namePx = isFull ? 13 : 11;
  const datesPx = 11;

  const nodeWidth  = isCompact ? 40 : 120;
  const nodeRadius = isCompact ? 6 : 10; // --radius-md vs --radius-lg
  const nodePad    = isCompact ? 8 : 12;  // tighter at compact

  // -- Life dates ----------------------------------------------------------
  let dates = null;
  if (kind === 'unknown') {
    dates = '?';
  } else if (status === 'deceased' && birthYear) {
    dates = `${birthYear} – ${deathYear ?? ''}`.replace(/–\s*$/, '–');
  } else if (status === 'living' && birthYear) {
    dates = `b. ${birthYear}`;
  } else if (!birthYear) {
    dates = '?';
  }

  // -- State styling -------------------------------------------------------
  // Default: Surface-1 bg + 0.5px Warm-border, no elevation.
  // Hover: Surface-3 bg + Warm-Light border.
  // Selected: 2px Gold border (the primary selected signal), Surface-1 bg.
  // Viewing: 3px Gold left accent bar.
  // Focus: 2px Ink @20% offset 2px ring.
  // Disabled: opacity 0.40.
  // Root: Gold-Light bg fill.
  const isSelected = state === 'selected';
  const isHover    = state === 'hover';
  const isViewing  = state === 'viewing';
  const isFocus    = state === 'focus';
  const isDisabled = state === 'disabled';
  const isRoot     = kind === 'root';

  const bg =
    isRoot   ? '#BFA882' :    // Gold-Light — the only colored bg
    isHover  ? '#D9D0C4' :    // Surface-3
               '#EDE8E0';     // Surface-1

  // Selected uses 2px Gold; otherwise 0.5px hairline (Warm-Light on hover).
  const borderColor =
    isSelected ? '#8C7355' :
    isHover    ? '#C4B9A8' :
                 '#D6CFC4';
  const borderWidth = isSelected ? 2 : 0.5;

  const containerStyle = {
    position: 'relative',
    width: nodeWidth,
    background: bg,
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: nodeRadius,
    padding: `${nodePad}px ${nodePad}px ${nodePad}px ${isViewing ? nodePad + 3 : nodePad}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: isFull ? 6 : isMedium ? 4 : 0,
    cursor: isDisabled ? 'default' : 'pointer',
    opacity: isDisabled ? 0.40 : 1,
    transition: 'background 150ms cubic-bezier(.22,1,.36,1), border-color 150ms cubic-bezier(.22,1,.36,1)',
    fontFamily: 'var(--font-ui)',
    color: 'inherit',
    boxSizing: 'border-box',
    // Focus ring per spec
    outline: isFocus ? '2px solid rgba(28,26,23,0.20)' : 'none',
    outlineOffset: isFocus ? 2 : 0,
    // Compact tap-target padding (44px minimum) — handled via min-height
    minHeight: isCompact ? 40 : undefined,
    // Avoid double-padding on selected: keep visual size the same as default
    // (border grows from 0.5 → 2 — compensate with margin)
    margin: isSelected ? -1.5 : 0,
  };

  // Touch target padding for compact — invisible 44px hit area
  const wrapperStyle = isCompact
    ? {
        position: 'relative',
        width: 44, minWidth: 44, minHeight: 44,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }
    : { position: 'relative', display: 'inline-block' };

  return (
    <div style={wrapperStyle}>
      <div
        role="button"
        aria-label={ariaLabel || (name ? `${name}${dates ? ', ' + dates : ''}` : 'Family tree node')}
        aria-pressed={isSelected || isViewing}
        aria-disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
        style={containerStyle}
      >
        {/* Viewing accent bar — 3px Gold, on left edge */}
        {isViewing && (
          <span aria-hidden="true" style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0,
            width: 3,
            background: '#8C7355',
            borderTopLeftRadius: nodeRadius,
            borderBottomLeftRadius: nodeRadius,
          }} />
        )}

        <FTNAvatar
          name={kind === 'unknown' ? 'Unknown' : name}
          photo={photo}
          status={status}
          size={avatarSize}
          kind={kind}
        />

        {showName && (
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            fontSize: namePx,
            lineHeight: 1.25,
            color: '#1C1A17',
            letterSpacing: '-0.005em',
            textAlign: 'center',
            // Kind: unknown — italic Warm-Mid
            fontStyle: kind === 'unknown' ? 'italic' : 'normal',
            ...(kind === 'unknown' && { color: '#7A6F63', fontWeight: 400 }),
            maxWidth: '100%',
            // Wrap to 2 lines max — truncate beyond. Per brief: "single line
            // where possible — truncate with ellipsis only if unavoidable."
            // 120px nodes with realistic surnames want 2 lines; that's
            // the graceful read of the rule.
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            wordBreak: 'break-word',
            width: '100%',
          }}>
            {kind === 'unknown' ? 'Unknown' : name}
          </span>
        )}

        {showDates && dates && (
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 400,
            fontSize: datesPx,
            lineHeight: 1.4,
            color: '#7A6F63',
            textAlign: 'center',
            whiteSpace: 'nowrap',
          }}>{dates}</span>
        )}

        {/* Status dot — outside the bottom edge */}
        {showDot && <FTNStatusDot status={status} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------
// Add-person node — dashed border circle, + icon, no text.
// Same touch target as a full node. Hover: border-strong + Ink icon.
// ----------------------------------------------------------
function FTNAddNode({ state = 'default', onClick }) {
  const [hover, setHover] = useFTN(false);
  const isHover = state === 'hover' || hover;

  const borderColor = isHover ? '#C4B9A8' : '#D6CFC4';
  const iconColor   = isHover ? '#1C1A17' : '#C4B9A8';

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <div
        role="button"
        aria-label="Add a family member"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={onClick}
        style={{
          width: 48, height: 48, borderRadius: '9999px',
          border: `1px dashed ${borderColor}`,
          background: 'transparent',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'border-color 150ms cubic-bezier(.22,1,.36,1)',
        }}
      >
        {/* + icon, 24px, stroke 1.5 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke={iconColor} strokeWidth="1.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{ transition: 'stroke 150ms cubic-bezier(.22,1,.36,1)' }}>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
      </div>
    </div>
  );
}

Object.assign(window, { FamilyTreeNode, FTNAvatar, FTNStatusDot, FTNAddNode });
