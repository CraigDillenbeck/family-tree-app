// TreeViewPrimitives.jsx — small UI primitives used by S3 Family Tree View only.
// Sidebar nav, toolbar, mini-map, status bar, mobile chrome.
// All visuals follow Design System v1.1 — no shadows, 0.5px hairlines, parchment surfaces.

const { useState: useTVP } = React;

// -------------------------------------------------------------------------
// Lucide-style icons used in the tree view chrome.
// Kept inline so this file stays self-contained. Stroke 1.5, rounded caps,
// Warm-Mid default per the icon rules in the design system.
// -------------------------------------------------------------------------
const TV_ICON_PATHS = {
  // 16/20/24 grid
  home:        ['M3 11l9-7 9 7v9a2 2 0 0 1-2 2h-3v-7h-8v7H5a2 2 0 0 1-2-2v-9z'],
  tree:        [
    'M12 4a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',
    'M6 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    'M18 19a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    'M12 9v3 M12 12H6.5 M12 12h5.5 M12 12v2',
  ],
  memories:    [
    'M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7z',
    'M4 14l4-4 4 4 6-6',
    'M9 9.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z',
  ],
  people:      [
    'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2',
    'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
    'M22 21v-2a4 4 0 0 0-3-3.87',
    'M16 3.13a4 4 0 0 1 0 7.75',
  ],
  settings:    [
    'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z',
  ],
  // Toolbar
  zoomIn:      ['M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z', 'M11 8v6 M8 11h6', 'M16.5 16.5L21 21'],
  zoomOut:     ['M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z', 'M8 11h6', 'M16.5 16.5L21 21'],
  fitScreen:   ['M4 9V5a1 1 0 0 1 1-1h4', 'M20 9V5a1 1 0 0 0-1-1h-4', 'M4 15v4a1 1 0 0 0 1 1h4', 'M20 15v4a1 1 0 0 1-1 1h-4'],
  search:      ['M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z', 'M16.5 16.5L21 21'],
  plus:        ['M12 5v14 M5 12h14'],
  overflow:    ['M5 12a1 1 0 1 1 0 .01z', 'M12 12a1 1 0 1 1 0 .01z', 'M19 12a1 1 0 1 1 0 .01z'],
  close:       ['M6 6l12 12 M18 6L6 18'],
  back:        ['M15 6l-6 6 6 6'],
  arrowRight:  ['M5 12h14 M13 6l6 6-6 6'],
  // Mobile bottom tabs (filled circle variant)
  profile:     ['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', 'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'],
};

function TVIcon({ name, size = 16, color = '#7A6F63', strokeWidth = 1.5, style = {} }) {
  const paths = TV_ICON_PATHS[name] || [];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', ...style }}
      aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

// -------------------------------------------------------------------------
// Icon button — 36×36 Ghost, tooltip-ready (tooltip omitted in static mock)
// -------------------------------------------------------------------------
function TVIconButton({ icon, label, size = 16, color = '#7A6F63', active = false, onClick }) {
  const [hover, setHover] = useTVP(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 36, height: 36, borderRadius: 4,
        background: hover || active ? '#E5DDD2' : 'transparent',
        border: 'none', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 150ms cubic-bezier(.22,1,.36,1)',
        padding: 0,
      }}
    >
      <TVIcon name={icon} size={size} color={active ? '#1C1A17' : color} />
    </button>
  );
}

// -------------------------------------------------------------------------
// Sidebar — global navigation, identical across S2/S3/S4. Width 220px.
// Background Ink #1C1A17. Nav links Plus Jakarta 400 / 14px.
// Active tree link: Parchment text + 3px Gold left indicator.
// -------------------------------------------------------------------------
function TVSidebar({ active = 'tree', userName = 'Sarah Walsh', userInitials = 'SW' }) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'tree',      label: 'Tree',      icon: 'tree' },
    { id: 'memories',  label: 'Memories',  icon: 'memories' },
    { id: 'people',    label: 'People',    icon: 'people' },
    { id: 'settings',  label: 'Settings',  icon: 'settings' },
  ];

  return (
    <aside style={{
      width: 220, height: '100%',
      background: '#1C1A17',
      color: '#F7F4EE',
      display: 'flex', flexDirection: 'column',
      flexShrink: 0,
      fontFamily: 'var(--font-ui)',
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 28px 20px',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <svg width={22} height={22} viewBox="0 0 48 48" fill="none"
          stroke="#F7F4EE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="24" cy="10" r="3" />
          <path d="M24 13 L24 20" />
          <path d="M12 28 L24 20 L36 28" />
          <circle cx="12" cy="30" r="3" />
          <circle cx="36" cy="30" r="3" />
          <path d="M12 33 L12 38" />
          <path d="M36 33 L36 38" />
          <circle cx="12" cy="40" r="2" />
          <circle cx="36" cy="40" r="2" />
        </svg>
        <span style={{
          fontFamily: 'var(--font-ui)', fontWeight: 300,
          fontSize: 17, letterSpacing: '-0.01em', color: '#F7F4EE',
        }}>PROSAPIAM</span>
      </div>

      {/* Nav items */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 12px' }}>
        {items.map(it => {
          const isActive = it.id === active;
          return (
            <a key={it.id} href="#"
              onClick={e => e.preventDefault()}
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', gap: 12,
                height: 38, padding: '0 12px 0 14px',
                borderRadius: 4,
                color: isActive ? '#F7F4EE' : '#C4B9A8',
                textDecoration: 'none',
                fontFamily: 'var(--font-ui)',
                fontWeight: 400, fontSize: 14,
                letterSpacing: '0.005em',
                transition: 'color 150ms cubic-bezier(.22,1,.36,1)',
              }}>
              {isActive && (
                <span aria-hidden="true" style={{
                  position: 'absolute',
                  left: 0, top: 6, bottom: 6, width: 3,
                  background: '#8C7355',
                  borderRadius: '0 2px 2px 0',
                }} />
              )}
              <TVIcon name={it.icon} size={18} color={isActive ? '#F7F4EE' : '#C4B9A8'} />
              <span>{it.label}</span>
            </a>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      {/* User block — pinned to bottom */}
      <div style={{
        margin: '0 12px 16px 12px',
        padding: '12px 12px',
        borderTop: '0.5px solid rgba(247,244,238,0.10)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{
          width: 32, height: 32, borderRadius: '50%',
          background: '#3D3A35',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 12,
          color: '#F7F4EE', letterSpacing: '0.02em',
          border: '0.5px solid rgba(247,244,238,0.15)',
          flexShrink: 0,
        }}>{userInitials}</span>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 13,
            color: '#F7F4EE', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{userName}</span>
          <a href="#" onClick={e => e.preventDefault()} style={{
            fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 11,
            color: '#7A6F63', textDecoration: 'none',
            letterSpacing: '0.04em',
          }}>Settings</a>
        </div>
      </div>
    </aside>
  );
}

// -------------------------------------------------------------------------
// Toolbar — 48px strip above canvas.
// Background Surface-1. Border bottom hairline.
// Left: zoom controls. Center: layout toggle. Right: search · add · overflow.
// -------------------------------------------------------------------------
function TVToolbar({ zoom = 100, layout = 'auto' }) {
  return (
    <div style={{
      height: 48,
      background: '#EDE8E0',
      borderBottom: '0.5px solid #D6CFC4',
      display: 'flex', alignItems: 'center',
      padding: '0 12px',
      gap: 4,
      fontFamily: 'var(--font-ui)',
      flexShrink: 0,
    }}>
      {/* Left cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TVIconButton icon="zoomOut" label="Zoom out" />
        <span style={{
          minWidth: 44, textAlign: 'center',
          fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 12,
          color: '#7A6F63', letterSpacing: '0.02em',
          fontVariantNumeric: 'tabular-nums',
        }}>{zoom}%</span>
        <TVIconButton icon="zoomIn" label="Zoom in" />
        <span style={{ width: 1, height: 20, background: '#C4B9A8', margin: '0 6px', opacity: 0.6 }} />
        <TVIconButton icon="fitScreen" label="Fit to screen" />
      </div>

      {/* Center: Layout toggle */}
      <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: 3, background: 'transparent',
          borderRadius: 4,
        }}>
          {['auto', 'manual'].map(opt => {
            const isActive = layout === opt;
            return (
              <button key={opt} type="button"
                style={{
                  height: 28, padding: '0 14px',
                  borderRadius: 4, border: 'none',
                  background: isActive ? '#E5DDD2' : 'transparent',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: isActive ? 500 : 400,
                  fontSize: 12,
                  color: isActive ? '#1C1A17' : '#7A6F63',
                  letterSpacing: '0.02em',
                  cursor: 'pointer',
                  transition: 'background 150ms cubic-bezier(.22,1,.36,1)',
                  textTransform: 'capitalize',
                }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Right cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TVIconButton icon="search" label="Search" />
        <span style={{ width: 1, height: 20, background: '#C4B9A8', margin: '0 6px', opacity: 0.6 }} />
        {/* Add person — Secondary button */}
        <button type="button" style={{
          height: 36, padding: '0 14px',
          background: 'transparent',
          border: '0.5px solid #D6CFC4',
          borderRadius: 4,
          fontFamily: 'var(--font-ui)',
          fontWeight: 500, fontSize: 13, color: '#1C1A17',
          letterSpacing: '0.005em',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          cursor: 'pointer',
          transition: 'background 150ms cubic-bezier(.22,1,.36,1)',
        }}>
          <TVIcon name="plus" size={14} color="#1C1A17" />
          Add person
        </button>
        <span style={{ width: 6 }} />
        <TVIconButton icon="overflow" label="More" />
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Mini-map — 160×100 lower-right corner of canvas.
// Surface-1 @ 90% opacity, hairline border. Simplified tree.
// -------------------------------------------------------------------------
function TVMiniMap({ right = 16, bottom = 16 }) {
  // Simplified geometry — small warm-gray rects + 0.5px lines.
  // Coordinates inside 160×100 viewBox roughly mirror the real tree.
  return (
    <div style={{
      position: 'absolute',
      right, bottom,
      width: 160, height: 100,
      background: 'rgba(237,232,224,0.90)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      border: '0.5px solid #D6CFC4',
      borderRadius: 6,
      padding: 8,
      fontFamily: 'var(--font-ui)',
      pointerEvents: 'auto',
    }}>
      <svg width="100%" height="100%" viewBox="0 0 144 84" preserveAspectRatio="xMidYMid meet">
        {/* connectors */}
        <g stroke="#C4B9A8" strokeWidth="0.5" fill="none">
          <path d="M72 14v6" />
          <path d="M58 20h28" />
          <path d="M58 20v8" />
          <path d="M86 20v8" />
          <path d="M72 36v6" />
          <path d="M30 42h84" />
          <path d="M30 42v8" />
          <path d="M72 42v8" />
          <path d="M114 42v8" />
          <path d="M30 60v6" />
        </g>
        {/* nodes — simple warm-gray rectangles */}
        <g>
          {/* Add-person node above */}
          <rect x="68" y="6" width="8" height="8" rx="4" fill="none" stroke="#C4B9A8" strokeWidth="0.5" strokeDasharray="1 1" />
          {/* Margaret + Thomas */}
          <rect x="50"  y="20" width="16" height="10" rx="2" fill="#BFA882" />
          <rect x="78"  y="20" width="16" height="10" rx="2" fill="#C4B9A8" />
          {/* 3 children */}
          <rect x="22"  y="50" width="16" height="10" rx="2" fill="#C4B9A8" />
          <rect x="64"  y="50" width="16" height="10" rx="2" fill="#C4B9A8" />
          <rect x="106" y="50" width="16" height="10" rx="2" fill="#C4B9A8" />
          {/* Liam */}
          <rect x="22"  y="68" width="16" height="10" rx="2" fill="#C4B9A8" />
        </g>
        {/* current viewport overlay — Gold-Light frame */}
        <rect x="32" y="14" width="86" height="62"
          fill="rgba(191,168,130,0.18)"
          stroke="#BFA882"
          strokeWidth="0.75" />
      </svg>
    </div>
  );
}

// -------------------------------------------------------------------------
// Status bar — bottom of canvas, transparent, 24px.
// -------------------------------------------------------------------------
function TVStatusBar({ count = 5, zoom = 100 }) {
  return (
    <div style={{
      position: 'absolute',
      left: 0, right: 0, bottom: 0,
      height: 24,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 16px',
      pointerEvents: 'none',
      fontFamily: 'var(--font-ui)',
      fontWeight: 400, fontSize: 11,
      color: '#7A6F63',
      letterSpacing: '0.02em',
    }}>
      <span>{count} family members</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{zoom}%</span>
    </div>
  );
}

Object.assign(window, {
  TVIcon, TVIconButton, TVSidebar, TVToolbar, TVMiniMap, TVStatusBar,
});
