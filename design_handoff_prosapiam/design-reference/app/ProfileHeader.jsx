// ProfileHeader.jsx — P04 Person Profile Header component
// Per Design Spec v1.1 + Component Brief + Page Architecture (S4 / P04).
// Anatomy: Avatar (128px) → Full name (Display L) → Life dates → Status badge
//          → Relationship line → Caslon biography excerpt → Action row
//
// Typography substitution note: the design system uses Plus Jakarta Sans
// (UI face, in place of Avenir Next) and Cormorant Garamond (story face,
// in place of Adobe Caslon Pro). Weights and sizes match the brief exactly.

const { useState: usePH } = React;

// ---- Lucide-style action icons used by the header ----
function PHIcon({ name, size = 16, color = 'currentColor', strokeWidth = 1.5, style = {} }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style,
  };
  switch (name) {
    case 'plus':     return (<svg {...common}><path d="M5 12h14M12 5v14"/></svg>);
    case 'edit':     return (<svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>);
    case 'more':     return (<svg {...common}><circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/></svg>);
    case 'camera':   return (<svg {...common}><path d="M3 7h4l2-2h6l2 2h4v12H3z"/><circle cx="12" cy="13" r="4"/></svg>);
    default: return null;
  }
}

// ---- Avatar (2xl / 128px) — photo or initials, deceased grayscale variant ----
function PHAvatar({ given, family, photo, status = 'living', size = 128 }) {
  const initials = ((given?.[0] || '') + (family?.[0] || '')).toUpperCase() || '·';
  const fontSize = Math.round(size * 0.34);
  const isDeceased = status === 'deceased';
  const ring = '0.5px solid #D6CFC4';
  if (photo) {
    return (
      <span style={{
        width: size, height: size, borderRadius: '9999px', overflow: 'hidden',
        display: 'inline-block', background: '#E5DDD2', border: ring, flexShrink: 0,
        position: 'relative',
      }}>
        <img src={photo} alt={`${given} ${family}`}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            filter: isDeceased ? 'grayscale(0.25)' : 'none',
          }}/>
      </span>
    );
  }
  return (
    <span style={{
      width: size, height: size, borderRadius: '9999px',
      background: isDeceased ? '#D9D0C4' : '#E5DDD2',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize, color: '#7A6F63',
      letterSpacing: '0.04em', border: ring, flexShrink: 0,
    }}>{initials}</span>
  );
}

// ---- Status badge (Sage / Terra) ----
function PHStatusBadge({ status }) {
  const sage  = { bg: '#E4EDE5', fg: '#5A6B5C' };
  const terra = { bg: '#F2E4E1', fg: '#8C4A38' };
  const s = status === 'deceased' ? terra : sage;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 10,
      letterSpacing: '0.10em', textTransform: 'uppercase',
      padding: '4px 8px', borderRadius: 2, // --radius-xs
      background: s.bg, color: s.fg,
    }}>{status === 'deceased' ? 'Deceased' : 'Living'}</span>
  );
}

// ---- Header action button (Primary Ink / Secondary outlined / Ghost) ----
function PHButton({ variant = 'primary', icon, iconOnly, children, onClick }) {
  const [hover, setHover] = usePH(false);
  const [pressed, setPressed] = usePH(false);
  const base = {
    fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 13,
    height: 36, padding: iconOnly ? '0' : '0 16px', borderRadius: 4, // --radius-sm
    width: iconOnly ? 36 : 'auto',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    cursor: 'pointer', whiteSpace: 'nowrap', lineHeight: 1,
    transition: 'opacity 150ms cubic-bezier(.22,1,.36,1), background 150ms cubic-bezier(.22,1,.36,1), border-color 150ms cubic-bezier(.22,1,.36,1), transform 100ms cubic-bezier(.22,1,.36,1)',
    transform: pressed ? 'scale(0.98)' : 'scale(1)',
    WebkitTapHighlightColor: 'transparent',
  };
  let style = {};
  if (variant === 'primary') {
    style = { ...base, background: '#1C1A17', color: '#F7F4EE', border: 'none', opacity: hover ? 0.85 : 1 };
  } else if (variant === 'secondary') {
    style = {
      ...base, background: hover ? '#EDE8E0' : 'transparent',
      color: '#1C1A17', border: `0.5px solid ${hover ? '#C4B9A8' : '#D6CFC4'}`,
    };
  } else { // ghost
    style = {
      ...base, background: hover ? '#EDE8E0' : 'transparent',
      color: '#3D3A35', border: 'none',
    };
  }
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => { setHover(false); setPressed(false); }}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)}
      style={style} aria-label={iconOnly ? 'More actions' : undefined}>
      {icon && <PHIcon name={icon} size={iconOnly ? 18 : 14} />}
      {!iconOnly && <span>{children}</span>}
    </button>
  );
}

// ============================================================
// ProfileHeader — P04
// ============================================================
function ProfileHeader({
  given,
  family,
  middle,
  photo,
  status = 'living',          // 'living' | 'deceased'
  birthYear,
  deathYear,                  // only when deceased
  relationship,               // e.g. 'Paternal grandmother · Walsh family'
  bio,                        // 2–4 lines, italicized Caslon
  layout = 'desktop',         // 'desktop' | 'mobile'
}) {
  const isDeceased = status === 'deceased';
  const dates = isDeceased
    ? `${birthYear} – ${deathYear}`
    : `b. ${birthYear}`;

  const fullName = [given, middle, family].filter(Boolean).join(' ');
  const isMobile = layout === 'mobile';

  // Layout: avatar centered above name on mobile, left-aligned on desktop
  return (
    <header
      style={{
        // Header spans full content width, no constraint to reading width.
        // Background: Surface-1 (#EDE8E0). No shadow, no border on header itself.
        background: '#EDE8E0',
        padding: isMobile ? '40px 24px 32px' : '56px 64px 40px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'center' : 'flex-start',
        gap: isMobile ? 20 : 40,
        textAlign: isMobile ? 'center' : 'left',
        width: '100%',
        boxSizing: 'border-box',
        position: 'relative',
      }}
    >
      {/* Cover-photo slot — reserved for future build, NOT rendered here.
          Documented placement: full-width band, 240px, gradient fade to Surface-1. */}

      <PHAvatar given={given} family={family} photo={photo} status={status} size={128}/>

      <div style={{
        flex: 1, minWidth: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: isMobile ? 'center' : 'flex-start',
        // Constrain text column on desktop so the bio doesn't run beyond
        // a comfortable measure even though the header itself spans full width.
      }}>
        {/* Name — Display L, light weight 300, Ink. The largest element on the page. */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 300,
          fontSize: 40,
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          color: '#1C1A17',
          margin: 0,
        }}>{fullName}</h1>

        {/* Life dates — 14px, Warm-Mid */}
        <div style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 400,
          fontSize: 14,
          color: '#7A6F63',
          marginTop: 8,
          letterSpacing: '0.01em',
        }}>{dates}</div>

        {/* Status badge */}
        <div style={{ marginTop: 14 }}>
          <PHStatusBadge status={status}/>
        </div>

        {/* Relationship context line — sits below the badge */}
        {relationship && (
          <div style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 400,
            fontSize: 13,
            color: '#7A6F63',
            marginTop: 10,
            lineHeight: 1.5,
          }}>{relationship}</div>
        )}

        {/* Biography excerpt — Cormorant Garamond italic, 17px, --color-text-body
            The only Caslon element in the header. Carries the emotional weight. */}
        {bio && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: 17,
            lineHeight: 1.75,
            color: '#3D3A35',
            margin: '24px 0 0 0',
            maxWidth: 640,
            textWrap: 'pretty',
          }}>{bio}</p>
        )}

        {/* Action row — gap 12px (--space-3) */}
        <div style={{
          display: 'flex',
          gap: 12,
          marginTop: 28,
          flexWrap: 'wrap',
          justifyContent: isMobile ? 'center' : 'flex-start',
        }}>
          <PHButton variant="primary" icon="plus">Add a memory</PHButton>
          <PHButton variant="secondary" icon="edit">Edit profile</PHButton>
          <PHButton variant="ghost" icon="more" iconOnly />
        </div>
      </div>
    </header>
  );
}

Object.assign(window, { ProfileHeader, PHAvatar, PHStatusBadge, PHButton });
