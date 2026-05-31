// PersonSummaryCard.jsx — P03 Person Summary Card component
// Per Component Library Brief, Page Architecture Brief, Design System v1.1.
//
// Typography substitution note (per project convention):
//   The brief calls for Avenir Next. The design system in this project ships
//   Plus Jakarta Sans (UI face) — every weight, size, casing, and spacing rule
//   from the brief is honoured. No Cormorant in this component (UI surface,
//   not a narrative one).
//
// Anatomy (horizontal — primary):
//   [avatar 48 / 32]  ·  Name (15/13)
//                        Life dates (12/11) Warm-Mid
//                        [Relationship badge] [Status badge?]
//                                                              [chevron?]
//
// Variants:
//   horizontal-interactive · horizontal-static · compact · (deceased treatment overlay)

const { useState: usePSC } = React;

// ---- Lucide-style chevron ----
function PSCChevron({ size = 16, color = '#7A6F63' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

// ---- Avatar — 48 (md) or 32 (sm). Photo or initials, deceased gets 25% grayscale. ----
function PSCAvatar({ name, photo, status = 'living', size = 48 }) {
  const initials = (name || '·')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  const fontSize = Math.round(size * 0.36);
  const isDeceased = status === 'deceased';
  const ring = '0.5px solid #D6CFC4';
  const [imgFailed, setImgFailed] = usePSC(false);

  if (photo && !imgFailed) {
    return (
      <span style={{
        width: size, height: size, borderRadius: '9999px', overflow: 'hidden',
        display: 'inline-block', background: '#E5DDD2', border: ring, flexShrink: 0,
        position: 'relative',
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

  // Initials fallback — Surface-2 fill (Surface-3 if deceased), Warm-Mid text, weight 500
  return (
    <span style={{
      width: size, height: size, borderRadius: '9999px',
      background: isDeceased ? '#D9D0C4' : '#E5DDD2',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize,
      color: '#7A6F63', letterSpacing: '0.02em',
      border: ring, flexShrink: 0,
      filter: isDeceased ? 'grayscale(0.25)' : 'none',
    }}>{initials}</span>
  );
}

// ---- Badge — relationship (Default/Warm) and status (Sage/Terra) ----
// 10px ALL CAPS, weight 500, --radius-xs (2px). Hard corners — reads as label, not pill.
function PSCBadge({ children, tone = 'default' }) {
  const tones = {
    // Default — Ink-on-Surface-2, the workhorse relationship badge
    default: { bg: '#E5DDD2', color: '#1C1A17', border: '0.5px solid #D6CFC4' },
    // Warm — softer secondary relationship variant
    warm:    { bg: 'rgba(140,115,85,0.10)', color: '#7A5F3E', border: '0.5px solid rgba(140,115,85,0.30)' },
    // Sage — Living
    sage:    { bg: '#E4EDE5', color: '#5A6B5C', border: '0.5px solid rgba(90,107,92,0.30)' },
    // Terra — Deceased / errors
    terra:   { bg: '#F2E4E1', color: '#8C4A38', border: '0.5px solid rgba(140,74,56,0.30)' },
  };
  const t = tones[tone] || tones.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: 18, padding: '0 6px',
      background: t.bg, color: t.color, border: t.border,
      borderRadius: 2, // --radius-xs
      fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 10,
      letterSpacing: '0.10em', textTransform: 'uppercase',
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

// ============================================================
// PersonSummaryCard — P03
// ============================================================
function PersonSummaryCard({
  name,                     // string — full name; never truncated if avoidable
  photo,                    // string|null
  status = 'living',        // 'living' | 'deceased'
  birthYear,                // number — used to format life dates
  deathYear,                // number|null
  relationship,             // string — "Spouse" | "Mother" | etc.
  relationshipTone = 'default', // 'default' | 'warm'
  showStatus = false,       // optional Sage/Terra status badge
  variant = 'interactive',  // 'interactive' | 'static' | 'compact'
  width,
  onClick,
}) {
  const [hover, setHover] = usePSC(false);
  const isCompact = variant === 'compact';
  const isInteractive = variant === 'interactive';
  const isStatic = variant === 'static';

  // Sizing scale per variant
  const avatarSize = isCompact ? 32 : 48;
  const namePx     = isCompact ? 13 : 15;
  const datesPx    = isCompact ? 11 : 12;
  const padding    = isCompact ? 12 : 16;          // --space-3 vs --space-4
  const gap        = 12;                            // --space-3, fixed regardless of variant

  // Life dates string per spec
  let dates = null;
  if (status === 'deceased' && birthYear) {
    dates = `${birthYear} – ${deathYear || ''}`.trim().replace(/–\s*$/, '–');
  } else if (status === 'living' && birthYear) {
    dates = `b. ${birthYear}`;
  }

  // Hover styling — interactive only
  const cardStyle = {
    background: isInteractive && hover ? '#D9D0C4' : '#EDE8E0',
    border: isInteractive && hover ? '0.5px solid #C4B9A8' : '0.5px solid #D6CFC4',
    borderRadius: 10,
    padding,
    width: width || '100%',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    gap,
    cursor: isInteractive ? 'pointer' : 'default',
    transition: 'background 150ms cubic-bezier(.22,1,.36,1), border-color 150ms cubic-bezier(.22,1,.36,1)',
    textAlign: 'left',
    fontFamily: 'var(--font-ui)',
    color: 'inherit',
    appearance: 'none',
    WebkitTapHighlightColor: 'transparent',
  };

  const Tag = isInteractive ? 'button' : 'div';
  const interactiveProps = isInteractive
    ? { type: 'button', onClick, 'aria-label': `Open profile for ${name}` }
    : {};

  return (
    <Tag
      {...interactiveProps}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={cardStyle}
    >
      <PSCAvatar name={name} photo={photo} status={status} size={avatarSize} />

      {/* Text block — vertically centered with avatar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: isCompact ? 2 : 3,
        minWidth: 0,
        flex: 1,
      }}>
        {/* Name — Plus Jakarta 500, Ink, single line */}
        <span style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 500,
          fontSize: namePx,
          lineHeight: 1.3,
          color: '#1C1A17',
          letterSpacing: '-0.005em',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{name}</span>

        {/* Life dates — Warm-Mid, weight 400 */}
        {dates && (
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 400,
            fontSize: datesPx,
            lineHeight: 1.4,
            color: '#7A6F63',
            whiteSpace: 'nowrap',
          }}>{dates}</span>
        )}

        {/* Badge row — relationship (always) + status (optional, full variants only) */}
        {(relationship || (showStatus && !isCompact)) && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 6,
            marginTop: isCompact ? 4 : 6,
          }}>
            {relationship && (
              <PSCBadge tone={relationshipTone}>{relationship}</PSCBadge>
            )}
            {showStatus && !isCompact && (
              <PSCBadge tone={status === 'deceased' ? 'terra' : 'sage'}>
                {status === 'deceased' ? 'Deceased' : 'Living'}
              </PSCBadge>
            )}
          </div>
        )}
      </div>

      {/* Chevron — interactive variant only, never on static or compact */}
      {isInteractive && (
        <span style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 4,
          opacity: hover ? 1 : 0.85,
          transition: 'opacity 150ms cubic-bezier(.22,1,.36,1), transform 150ms cubic-bezier(.22,1,.36,1)',
          transform: hover ? 'translateX(1px)' : 'translateX(0)',
        }}>
          <PSCChevron size={16} color="#7A6F63" />
        </span>
      )}
    </Tag>
  );
}

Object.assign(window, { PersonSummaryCard, PSCAvatar, PSCBadge });
