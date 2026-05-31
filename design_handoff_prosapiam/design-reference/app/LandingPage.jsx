// LandingPage.jsx — Public-facing marketing surface
// Per Page Architecture Brief + Design System v1.1, with the updated
// typography system: Young Serif (display) · Cormorant Garamond (narrative)
// · Plus Jakarta Sans (UI chrome). No mixing on the same line.
//
// All sections are exported on window so the host HTML can compose desktop
// and mobile artboards inside the DesignCanvas.

const { useState: useLP } = React;

// ============================================================
// Tokens — local, so the landing page can use Young Serif for
// display headlines without rewiring the rest of the project.
// All color values match design-system tokens exactly.
// ============================================================
const LP = {
  ink: '#1C1A17',
  inkSoft: '#3D3A35',
  warmMid: '#7A6F63',
  warmLight: '#C4B9A8',
  parchment: '#F7F4EE',
  surface1: '#EDE8E0',
  surface2: '#E5DDD2',
  surface3: '#D9D0C4',
  gold: '#8C7355',
  goldLight: '#BFA882',
  sage: '#5A6B5C',
  sageTint: '#E4EDE5',
  border: '#D6CFC4',
  borderInverse: 'rgba(247,244,238,0.15)',
  fontDisplay: 'var(--font-display)',
  fontUI: 'var(--font-ui)',
  fontBody: 'var(--font-body)'
};

// ============================================================
// Small primitives
// ============================================================

function LPWordmark({ size = 20, color = LP.ink }) {
  // Young Serif Light wordmark — quiet, unhurried.
  return (
    <span style={{ ...{
        fontFamily: LP.fontDisplay,
        fontWeight: 300,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: '0.005em',
        color
      }, fontFamily: "var(--font-ui)" }}>PROSAPIAM</span>);

}

function LPSectionLabel({ children, color = LP.gold, align = 'center' }) {
  return (
    <div style={{
      fontFamily: LP.fontUI,
      fontWeight: 500,
      fontSize: 11,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      textAlign: align
    }}>{children}</div>);

}

function LPPrimaryButton({ children, size = 'md', variant = 'ink', fullWidth, icon }) {
  // ink: ink fill / parchment text  · parchment: parchment fill / ink text
  const heights = { md: 36, lg: 48 };
  const fontSizes = { md: 13, lg: 15 };
  const bg = variant === 'parchment' ? LP.parchment : LP.ink;
  const fg = variant === 'parchment' ? LP.ink : LP.parchment;
  const [hover, setHover] = useLP(false);
  const [press, setPress] = useLP(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {setHover(false);setPress(false);}}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      style={{
        fontFamily: LP.fontUI, fontWeight: 500, fontSize: fontSizes[size],
        letterSpacing: '0.02em',
        height: heights[size], padding: '0 20px',
        background: bg, color: fg,
        border: 'none', borderRadius: 4,
        cursor: 'pointer',
        opacity: hover ? 0.88 : 1,
        transform: press ? 'scale(0.98)' : 'scale(1)',
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1), transform 100ms cubic-bezier(.22,1,.36,1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: fullWidth ? '100%' : 'auto',
        WebkitTapHighlightColor: 'transparent',
        whiteSpace: 'nowrap'
      }}>
      
      {icon}{children}
    </button>);

}

function LPSecondaryButton({ children, size = 'md', fullWidth, icon, dark }) {
  const heights = { md: 36, lg: 44 };
  const fontSizes = { md: 13, lg: 13 };
  const [hover, setHover] = useLP(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: LP.fontUI, fontWeight: 500, fontSize: fontSizes[size],
        letterSpacing: '0.02em',
        height: heights[size], padding: '0 20px',
        background: hover ? LP.surface1 : LP.parchment,
        color: LP.ink,
        border: `0.5px solid ${LP.border}`,
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'background 150ms cubic-bezier(.22,1,.36,1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: fullWidth ? '100%' : 'auto',
        WebkitTapHighlightColor: 'transparent',
        whiteSpace: 'nowrap'
      }}>
      
      {icon}{children}
    </button>);

}

function LPGhostLink({ children, color = LP.ink, fontSize = 13 }) {
  const [hover, setHover] = useLP(false);
  return (
    <a
      href="#" onClick={(e) => e.preventDefault()}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: LP.fontUI, fontWeight: 500, fontSize,
        letterSpacing: '0.02em',
        color,
        textDecoration: 'underline',
        textUnderlineOffset: 3,
        textDecorationThickness: '0.5px',
        opacity: hover ? 0.70 : 1,
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
        cursor: 'pointer',
        whiteSpace: 'nowrap'
      }}>
      {children}</a>);

}

// ----- Google logo (multi-color, allowed exception inside Google button) -----
function GoogleG({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.6 12.227c0-.709-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.232-2.51c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.596-4.123H3.064v2.59A9.996 9.996 0 0 0 12 22z" fill="#34A853" />
      <path d="M6.404 13.9a6.005 6.005 0 0 1 0-3.8V7.51H3.064a9.996 9.996 0 0 0 0 8.98l3.34-2.59z" fill="#FBBC05" />
      <path d="M12 5.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C16.96 3.026 14.696 2 12 2A9.996 9.996 0 0 0 3.064 7.51l3.34 2.59C7.19 7.737 9.395 5.977 12 5.977z" fill="#EA4335" />
    </svg>);

}

// ============================================================
// Global Navigation
// ============================================================

function LPNav({ variant = 'desktop' }) {
  if (variant === 'mobile') {
    return (
      <header style={{
        height: 52,
        background: LP.parchment,
        borderBottom: `0.5px solid ${LP.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px',
        flexShrink: 0
      }}>
        <LPWordmark size={17} />
        <LPGhostLink>Sign in</LPGhostLink>
      </header>);

  }
  return (
    <header style={{
      height: 64,
      background: LP.parchment,
      borderBottom: `0.5px solid ${LP.border}`,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px',
      flexShrink: 0
    }}>
      <LPWordmark size={20} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <LPGhostLink>Sign in</LPGhostLink>
        <LPPrimaryButton size="md">Create account</LPPrimaryButton>
      </div>
    </header>);

}

// ============================================================
// Sign-in / Create-account panel (lives in hero, right column desktop /
// below headline on mobile)
// ============================================================

function LPAuthPanel({ variant = 'desktop' }) {
  const [mode, setMode] = useLP('signin');
  const [emailFocus, setEmailFocus] = useLP(false);
  const [pwFocus, setPwFocus] = useLP(false);
  const [reveal, setReveal] = useLP(false);

  const card = {
    background: LP.surface1,
    border: `0.5px solid ${LP.border}`,
    borderRadius: 10,
    padding: 32,
    width: '100%',
    maxWidth: variant === 'desktop' ? 400 : 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={card}>
      {/* Card header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ ...{
            fontFamily: LP.fontDisplay, fontWeight: 300, fontSize: 18,
            color: LP.ink, lineHeight: 1.1, letterSpacing: '0.005em'
          }, fontFamily: "var(--font-ui)" }}>PROSAPIAM
        </div>
        <div style={{ marginTop: 6,
          fontFamily: LP.fontBody, fontStyle: 'italic', fontWeight: 400,
          fontSize: 14, color: LP.warmMid, lineHeight: 1.5
        }}>A place for the people who made you.</div>
      </div>

      {/* Divider */}
      <div style={{ height: 0.5, background: LP.border, margin: '16px 0' }} />

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: `0.5px solid ${LP.border}`
      }}>
        {[
        { value: 'signin', label: 'Sign in' },
        { value: 'signup', label: 'Create account' }].
        map((it) => {
          const active = mode === it.value;
          return (
            <button
              key={it.value}
              onClick={() => setMode(it.value)}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                fontFamily: LP.fontUI, fontWeight: 500, fontSize: 13,
                letterSpacing: '0.02em',
                height: 40,
                color: active ? LP.ink : LP.warmMid,
                borderBottom: active ? `2px solid ${LP.gold}` : '2px solid transparent',
                marginBottom: -0.5, cursor: 'pointer',
                transition: 'color 200ms'
              }}>
              {it.label}</button>);

        })}
      </div>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 20 }}>
        <LPField
          label="Email" placeholder="you@example.com"
          focus={emailFocus} setFocus={setEmailFocus} />
        
        <div>
          <LPField
            label="Password"
            type={reveal ? 'text' : 'password'}
            placeholder="••••••••"
            focus={pwFocus} setFocus={setPwFocus}
            suffix={
            <button
              type="button" aria-label="Show password"
              onClick={() => setReveal((r) => !r)}
              style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: 4, color: LP.warmMid, display: 'flex'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            } />
          
          {mode === 'signin' &&
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <a href="#" onClick={(e) => e.preventDefault()} style={{
              fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
              color: LP.ink, textDecoration: 'underline',
              textUnderlineOffset: 3, textDecorationThickness: '0.5px'
            }}>Forgotten password?</a>
            </div>
          }
        </div>

        <div style={{ marginTop: 2 }}>
          <LPPrimaryButton size="lg" fullWidth>
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </LPPrimaryButton>
        </div>

        {/* OR divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '4px 0' }}>
          <span style={{ flex: 1, height: 0.5, background: LP.border }} />
          <span style={{
            fontFamily: LP.fontUI, fontWeight: 500, fontSize: 10,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: LP.warmMid
          }}>or</span>
          <span style={{ flex: 1, height: 0.5, background: LP.border }} />
        </div>

        <LPSecondaryButton size="lg" fullWidth icon={<GoogleG size={16} />}>
          Continue with Google
        </LPSecondaryButton>
      </div>

      {/* Footer */}
      <div style={{
        marginTop: 24, textAlign: 'center',
        fontFamily: LP.fontUI, fontWeight: 400, fontSize: 11,
        color: LP.warmMid, lineHeight: 1.6
      }}>
        {mode === 'signin' ?
        <>New to PROSAPIAM? <a href="#" onClick={(e) => {e.preventDefault();setMode('signup');}} style={{
            color: LP.ink, textDecoration: 'underline', textUnderlineOffset: 3,
            textDecorationThickness: '0.5px'
          }}>Create an account</a></> :

        <>Already have an account? <a href="#" onClick={(e) => {e.preventDefault();setMode('signin');}} style={{
            color: LP.ink, textDecoration: 'underline', textUnderlineOffset: 3,
            textDecorationThickness: '0.5px'
          }}>Sign in</a></>
        }
      </div>
    </div>);

}

function LPField({ label, type = 'text', placeholder, focus, setFocus, suffix }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span style={{
        fontFamily: LP.fontUI, fontWeight: 500, fontSize: 10,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        color: LP.warmMid
      }}>{label}</span>
      <span style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 44, padding: '0 12px',
        background: focus ? '#FFFEFB' : LP.surface2,
        border: `0.5px solid ${focus ? LP.gold : LP.border}`,
        borderRadius: 4,
        transition: 'background 150ms, border-color 150ms'
      }}>
        <input
          type={type}
          placeholder={placeholder}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: LP.fontUI, fontWeight: 400, fontSize: 14,
            color: LP.ink, minWidth: 0,
            letterSpacing: '0.005em'
          }} />
        
        {suffix}
      </span>
    </label>);

}

// ============================================================
// SECTION 01 — HERO
// ============================================================

function LPHero({ variant = 'desktop' }) {
  const subhead = 'Gather your family\u2019s stories. Preserve the people behind your name. Celebrate the lives that made you — and make sure they\u2019re never forgotten.';

  if (variant === 'mobile') {
    return (
      <section style={{
        position: 'relative',
        background: LP.ink,
        padding: '40px 24px 48px 24px',
        overflow: 'hidden'
      }}>
        <LPNoiseOverlay />
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h1 style={{
            margin: 0,
            fontFamily: LP.fontDisplay, fontWeight: 300,
            fontSize: 44, lineHeight: 1.1,
            letterSpacing: '-0.02em',
            color: LP.parchment,
            textAlign: 'center',
            textWrap: 'balance'
          }}>Preserve, protect and remember your family's legacy.</h1>
          <p style={{
            margin: '16px 0 0 0',
            fontFamily: LP.fontBody, fontWeight: 400,
            fontSize: 17, lineHeight: 1.65,
            color: LP.warmLight,
            textAlign: 'center',
            maxWidth: 340,
            textWrap: 'pretty'
          }}>{subhead}</p>
          <div style={{ marginTop: 32, width: '100%' }}>
            <LPAuthPanel variant="mobile" />
          </div>
        </div>
      </section>);

  }

  return (
    <section style={{
      position: 'relative',
      background: LP.ink,
      minHeight: 760,
      display: 'flex',
      overflow: 'hidden'
    }}>
      <LPNoiseOverlay />

      {/* Left — emotional */}
      <div style={{
        position: 'relative',
        flex: '0 0 53%',
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '80px 60px 80px 80px',
        boxSizing: 'border-box', fontWeight: "300"
      }}>
        <h1 style={{
          margin: 0,
          fontFamily: LP.fontDisplay,
          fontSize: 84,
          letterSpacing: '-0.02em',
          color: LP.parchment,
          textWrap: 'balance', fontWeight: "200", lineHeight: "0.85"
        }}>Preserve, protect and remember your family's legacy.
        </h1>
        <p style={{ margin: '28px 0 0 0',
          fontFamily: LP.fontBody, fontWeight: 400,
          fontSize: 22, lineHeight: 1.6,
          color: LP.warmLight,
          maxWidth: 540,
          textWrap: 'pretty'
        }}>{subhead}</p>

        {/* Trust indicators */}
        <div style={{
          marginTop: 48,
          display: 'flex', alignItems: 'center', gap: 12,
          fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
          letterSpacing: '0.04em',
          color: LP.warmLight
        }}>
          <span>Trusted by families in 40 countries</span>
          <span style={{ color: LP.gold }}>·</span>
          <span>Every memory, beautifully kept.</span>
        </div>
      </div>

      {/* Right — auth panel */}
      <div style={{
        position: 'relative',
        flex: '0 0 47%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '80px 80px 80px 40px',
        boxSizing: 'border-box'
      }}>
        <LPAuthPanel variant="desktop" />
      </div>
    </section>);

}

// Subtle archival noise overlay on Ink hero — 4-6% opacity.
// Drawn as inline SVG turbulence so we don't depend on external assets.
function LPNoiseOverlay() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        opacity: 0.05, pointerEvents: 'none', mixBlendMode: 'screen'
      }}>
      <defs>
        <filter id="lp-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix values="0 0 0 0 0.97  0 0 0 0 0.96  0 0 0 0 0.93  0 0 0 0.8 0" />
        </filter>
      </defs>
      <rect width="100%" height="100%" filter="url(#lp-noise)" />
    </svg>);

}

// ============================================================
// SECTION 02 — PRODUCT VISUAL MOMENT
// ============================================================

function LPProductMoment({ variant = 'desktop' }) {
  const isMobile = variant === 'mobile';
  const chips = ['Family Tree Canvas', 'Person Profiles', 'Memory Archive'];

  return (
    <section style={{
      background: LP.parchment,
      padding: isMobile ? '64px 0' : '96px 0'
    }}>
      <div style={{
        maxWidth: 1040, margin: '0 auto',
        padding: isMobile ? '0 24px' : '0 40px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LPSectionLabel>The Product</LPSectionLabel>
          <h2 style={{
            margin: '16px 0 0 0',
            fontFamily: LP.fontDisplay, fontWeight: 500,
            fontSize: isMobile ? 36 : 52, lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: LP.ink,
            textWrap: 'balance'
          }}>Hold onto your family’s memory.</h2>
          <p style={{
            margin: '24px auto 0 auto',
            fontFamily: LP.fontBody, fontWeight: 400,
            fontSize: isMobile ? 17 : 19, lineHeight: 1.65,
            color: LP.warmMid,
            maxWidth: 580,
            textWrap: 'pretty'
          }}>A living family tree that grows with every story you add — connecting generations, preserving faces, and keeping the people you love close forever.</p>
        </div>

        {/* Product illustration */}
        <div style={{
          marginTop: isMobile ? 40 : 56,
          border: `0.5px solid ${LP.border}`,
          borderRadius: isMobile ? 10 : 16,
          background: LP.parchment,
          overflow: 'hidden',
          position: 'relative'
        }}>
          <LPTreeIllustration variant={variant} />
        </div>

        {/* Caption chips */}
        <div style={{
          marginTop: isMobile ? 28 : 32,
          display: 'flex',
          flexWrap: isMobile ? 'nowrap' : 'wrap',
          overflowX: isMobile ? 'auto' : 'visible',
          gap: 12,
          justifyContent: isMobile ? 'flex-start' : 'center',
          paddingLeft: isMobile ? 0 : 0
        }}>
          {chips.map((c) =>
          <span key={c} style={{
            flexShrink: 0,
            display: 'inline-flex', alignItems: 'center',
            height: 32, padding: '0 16px',
            background: LP.surface1,
            border: `0.5px solid ${LP.border}`,
            borderRadius: 10,
            fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
            letterSpacing: '0.02em',
            color: LP.warmMid
          }}>{c}</span>
          )}
        </div>
      </div>
    </section>);

}

// ----- Tree illustration: warm rendering of the Walsh family tree canvas
//       using P01 node + P02 connector conventions. -----
function LPTreeIllustration({ variant }) {
  const isMobile = variant === 'mobile';
  // Use SVG with viewBox so it scales cleanly on every breakpoint.
  // Sized to roughly the proportions of the S3 Family Tree View.
  const w = 960,h = isMobile ? 380 : 480;

  // Hand-laid node positions (px, in viewBox coords).
  const nodes = [
  // Top generation
  { id: 'g1a', x: 280, y: 90, name: 'Patrick Walsh', sub: '1908 – 1982', status: 'deceased', initials: 'PW' },
  { id: 'g1b', x: 480, y: 90, name: 'Margaret Walsh', sub: '1912 – 1998', status: 'deceased', initials: 'MW', spouseOf: 'g1a' },
  { id: 'g1c', x: 740, y: 90, name: 'Eileen Walsh', sub: '1915 – 2001', status: 'deceased', initials: 'EW' },
  // Middle generation
  { id: 'g2a', x: 180, y: 240, name: 'Sean Walsh', sub: '1938 – 2019', status: 'deceased', initials: 'SW' },
  { id: 'g2b', x: 380, y: 240, name: 'Mary Walsh', sub: '1942', status: 'living', initials: 'MW' },
  { id: 'g2c', x: 580, y: 240, name: 'Brian Walsh', sub: '1946 – 2011', status: 'deceased', initials: 'BW' },
  { id: 'g2d', x: 780, y: 240, name: 'Niamh Walsh', sub: '1950', status: 'living', initials: 'NW', spouseOf: 'g2c' },
  // Bottom generation (focused branch)
  { id: 'g3a', x: 130, y: 390, name: 'Margaret W.', sub: '1972', status: 'living', initials: 'MW', viewing: true },
  { id: 'g3b', x: 290, y: 390, name: 'Daniel Walsh', sub: '1975', status: 'living', initials: 'DW' },
  { id: 'g3c', x: 510, y: 390, name: 'Aoife Walsh', sub: '1980', status: 'living', initials: 'AW' },
  { id: 'g3d', x: 670, y: 390, name: 'Conor Walsh', sub: '1983', status: 'living', initials: 'CW' }];


  const NODE_W = 132,NODE_H = 70;

  // Helpers for node anchor points
  const top = (n) => ({ x: n.x, y: n.y - NODE_H / 2 });
  const bot = (n) => ({ x: n.x, y: n.y + NODE_H / 2 });
  const lef = (n) => ({ x: n.x - NODE_W / 2, y: n.y });
  const rig = (n) => ({ x: n.x + NODE_W / 2, y: n.y });

  const get = (id) => nodes.find((n) => n.id === id);

  // Connectors:
  // - Spouse: gold-light 2px between rig(a) and lef(b)
  // - Parent-child (orthogonal): exit bottom, sibling bar, rise to top
  const spousePairs = [['g1a', 'g1b'], ['g2c', 'g2d']];
  const families = [
  // Patrick & Margaret -> Sean, Mary, Brian
  { parents: ['g1a', 'g1b'], children: ['g2a', 'g2b', 'g2c'] },
  // Brian & Niamh -> Aoife, Conor
  { parents: ['g2c', 'g2d'], children: ['g3c', 'g3d'] },
  // Sean -> Margaret, Daniel (single-parent demo line)
  { parents: ['g2a'], children: ['g3a', 'g3b'] }];


  return (
    <div style={{ width: '100%', background: LP.parchment, position: 'relative' }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} style={{ display: 'block' }}>
        {/* Faint dot grid on canvas — matches Family Tree View. */}
        <defs>
          <pattern id="lp-dotgrid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill={LP.warmLight} opacity="0.5" />
          </pattern>
        </defs>
        <rect width={w} height={h} fill={LP.parchment} />
        <rect width={w} height={h} fill="url(#lp-dotgrid)" />

        {/* Connectors below nodes */}
        {/* Spouse lines */}
        {spousePairs.map(([a, b], i) => {
          const A = get(a),B = get(b);
          return (
            <line key={'sp' + i}
            x1={rig(A).x} y1={rig(A).y}
            x2={lef(B).x} y2={lef(B).y}
            stroke={LP.goldLight} strokeWidth="2"
            strokeLinecap="round" />);


        })}

        {/* Parent-child orthogonal trees */}
        {families.map((f, i) => {
          // Determine the parent anchor: midpoint between spouse pair if two
          // parents, otherwise bottom of the single parent.
          const ps = f.parents.map(get);
          const parentY = ps[0].y + NODE_H / 2;
          const parentMidX = ps.length === 2 ?
          (ps[0].x + ps[1].x) / 2 :
          ps[0].x;
          const childY = get(f.children[0]).y - NODE_H / 2;
          const barY = (parentY + childY) / 2;

          // Drop from parent
          const dropX = parentMidX;
          // Sibling bar spans first → last child
          const cxs = f.children.map((id) => get(id).x);
          const barX1 = Math.min(...cxs);
          const barX2 = Math.max(...cxs);

          return (
            <g key={'fam' + i} stroke={LP.warmLight} strokeWidth="1" fill="none" strokeLinecap="round">
              {/* parent drop */}
              <line x1={dropX} y1={parentY} x2={dropX} y2={barY} />
              {/* sibling bar */}
              <line x1={Math.min(dropX, barX1)} y1={barY} x2={Math.max(dropX, barX2)} y2={barY} />
              {/* child rises */}
              {cxs.map((cx, j) =>
              <line key={j} x1={cx} y1={barY} x2={cx} y2={childY} />
              )}
            </g>);

        })}

        {/* Nodes */}
        {nodes.map((n) =>
        <LPNode key={n.id} node={n} w={NODE_W} h={NODE_H} />
        )}
      </svg>
    </div>);

}

function LPNode({ node, w, h }) {
  const isViewing = node.viewing;
  const isDeceased = node.status === 'deceased';
  const x = node.x - w / 2;
  const y = node.y - h / 2;

  const fill = isViewing ? LP.surface2 : LP.surface1;
  const stroke = isViewing ? LP.gold : LP.border;
  const strokeWidth = isViewing ? 1 : 0.5;

  const avatarBg = isDeceased ? LP.surface3 : LP.surface2;
  const dotColor = isDeceased ? LP.warmLight : '#7C8B7E'; // Sage muted

  return (
    <g>
      {/* Node card */}
      <rect
        x={x} y={y} width={w} height={h}
        rx={10} ry={10}
        fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      
      {/* Avatar circle (initials only — keeps illustration warm and readable) */}
      <circle cx={node.x} cy={y + 22} r={14} fill={avatarBg} stroke={LP.border} strokeWidth="0.5" />
      <text
        x={node.x} y={y + 26}
        textAnchor="middle"
        fontFamily={LP.fontUI} fontWeight="500" fontSize="9"
        letterSpacing="0.05em"
        fill={LP.warmMid}>
        {node.initials}</text>

      {/* Name */}
      <text
        x={node.x} y={y + h - 22}
        textAnchor="middle"
        fontFamily={LP.fontUI} fontWeight="500" fontSize="10"
        letterSpacing="0.01em"
        fill={LP.ink}>
        {node.name}</text>
      {/* Years */}
      <text
        x={node.x} y={y + h - 9}
        textAnchor="middle"
        fontFamily={LP.fontUI} fontWeight="400" fontSize="8.5"
        letterSpacing="0.02em"
        fill={LP.warmMid}>
        {node.sub}</text>

      {/* Status dot — outside boundary, bottom-center */}
      <circle cx={node.x} cy={y + h + 4} r={2.5} fill={dotColor} />
    </g>);

}

// ============================================================
// SECTION 03 — THREE CORE FEATURES
// ============================================================

function LPFeatures({ variant = 'desktop' }) {
  const isMobile = variant === 'mobile';
  const items = [
  {
    icon: <LPIconTree size={48} />,
    title: 'Gather every story',
    body: 'Add memories, photographs, and moments for every person in your family. A childhood summer. A wedding day. A recipe passed down three generations. Nothing is too small to keep.'
  },
  {
    icon: <LPIconPortrait size={48} />,
    title: 'Connect across generations',
    body: 'Build a living family tree that grows with you — linking people, places, and times across your entire family history. See where you came from. Understand who you are.'
  },
  {
    icon: <LPIconBook size={48} />,
    title: 'Celebrate who they were',
    body: 'Every person in your tree gets a beautiful, dedicated profile — a space for their life, their character, and everything that made them themselves. A biography worthy of them.'
  }];


  return (
    <section style={{
      background: LP.surface1,
      padding: isMobile ? '64px 0' : '96px 0'
    }}>
      <div style={{
        maxWidth: 1040, margin: '0 auto',
        padding: isMobile ? '0 24px' : '0 40px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LPSectionLabel>Why PROSAPIAM</LPSectionLabel>
          <h2 style={{
            margin: '16px 0 0 0',
            fontFamily: LP.fontDisplay, fontWeight: 300,
            fontSize: isMobile ? 36 : 48, lineHeight: 1.1,
            letterSpacing: '-0.005em',
            color: LP.ink,
            textWrap: 'balance'
          }}>Everything your family deserves.</h2>
        </div>

        {/* Columns */}
        <div style={{
          marginTop: isMobile ? 40 : 64,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? 40 : 32
        }}>
          {items.map((it, i) =>
          <div key={i} style={{
            display: 'flex', flexDirection: 'column',
            alignItems: isMobile ? 'center' : 'flex-start'
          }}>
              <div style={{ marginBottom: 20 }}>{it.icon}</div>
              <h3 style={{
              margin: 0,
              fontFamily: LP.fontDisplay, fontWeight: 500,
              fontSize: 24, lineHeight: 1.2,
              letterSpacing: '-0.005em',
              color: LP.ink,
              textAlign: isMobile ? 'center' : 'left'
            }}>{it.title}</h3>
              <p style={{
              margin: '12px 0 0 0',
              fontFamily: LP.fontBody, fontWeight: 400,
              fontSize: 17, lineHeight: 1.75,
              color: LP.inkSoft,
              textAlign: isMobile ? 'center' : 'left',
              textWrap: 'pretty'
            }}>{it.body}</p>
            </div>
          )}
        </div>
      </div>
    </section>);

}

// ----- Small editorial-feel illustrations (Ink stroke + Gold-Light accent) -----
function LPIconTree({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Trunk */}
      <path d="M24 44 L24 30" stroke={LP.ink} strokeWidth="1.25" strokeLinecap="round" />
      {/* Branches */}
      <path d="M24 30 L14 22 M24 30 L34 22 M24 24 L18 18 M24 24 L30 18" stroke={LP.ink} strokeWidth="1.25" strokeLinecap="round" />
      {/* Crown — soft tonal leaves */}
      <circle cx="14" cy="22" r="3" fill={LP.surface3} stroke={LP.ink} strokeWidth="1.25" />
      <circle cx="34" cy="22" r="3" fill={LP.surface3} stroke={LP.ink} strokeWidth="1.25" />
      <circle cx="18" cy="18" r="2.5" fill={LP.goldLight} stroke={LP.ink} strokeWidth="1.25" />
      <circle cx="30" cy="18" r="2.5" fill={LP.surface3} stroke={LP.ink} strokeWidth="1.25" />
      <circle cx="24" cy="13" r="3.5" fill={LP.surface3} stroke={LP.ink} strokeWidth="1.25" />
      {/* Roots */}
      <path d="M24 44 L18 46 M24 44 L30 46" stroke={LP.warmMid} strokeWidth="1" strokeLinecap="round" />
    </svg>);

}
function LPIconPortrait({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Oval frame */}
      <rect x="9" y="6" width="30" height="36" rx="15"
      fill={LP.surface3} stroke={LP.ink} strokeWidth="1.25" />
      {/* Inner edge */}
      <rect x="11.5" y="8.5" width="25" height="31" rx="12.5"
      fill="none" stroke={LP.goldLight} strokeWidth="0.75" />
      {/* Silhouette — shoulders + head */}
      <path d="M14.5 36 C 16 28, 19 26, 24 26 C 29 26, 32 28, 33.5 36"
      fill={LP.ink} stroke="none" />
      <circle cx="24" cy="20.5" r="5" fill={LP.ink} />
      {/* Frame hanger */}
      <circle cx="24" cy="3.5" r="1.25" fill={LP.warmMid} />
      <path d="M24 4.5 L18 6 M24 4.5 L30 6" stroke={LP.warmMid} strokeWidth="0.75" />
    </svg>);

}
function LPIconBook({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      {/* Open book */}
      <path d="M6 12 C 12 11, 20 12, 24 16 C 28 12, 36 11, 42 12 L42 38 C 36 37, 28 38, 24 42 C 20 38, 12 37, 6 38 Z"
      fill={LP.surface3} stroke={LP.ink} strokeWidth="1.25" strokeLinejoin="round" />
      {/* Spine */}
      <path d="M24 16 L24 42" stroke={LP.ink} strokeWidth="1.25" strokeLinecap="round" />
      {/* Lines on left page */}
      <path d="M10 19 L20 19.5 M10 23 L20 23 M10 27 L18 27" stroke={LP.warmMid} strokeWidth="0.75" strokeLinecap="round" />
      {/* Lines on right page */}
      <path d="M28 19.5 L38 19 M28 23 L38 23 M28 27 L36 27" stroke={LP.warmMid} strokeWidth="0.75" strokeLinecap="round" />
      {/* Bookmark */}
      <path d="M32 16 L32 28 L34.5 26 L37 28 L37 16" fill={LP.goldLight} stroke={LP.ink} strokeWidth="1" />
    </svg>);

}

// ============================================================
// SECTION 04 — PLANS (Remembrance · Heritage · Legacy)
// Sits between Features (Surface-1) and Human Moment (Parchment) —
// the second Ink surface on the page. Warm pricing, not a SaaS table.
// ============================================================

function LPPlans({ variant = 'desktop' }) {
  const isMobile = variant === 'mobile';
  const [billing, setBilling] = useLP('monthly'); // 'monthly' | 'annual'

  const plans = {
    remembrance: {
      key: 'remembrance',
      name: 'Remembrance',
      description: 'For families just beginning to gather their story.',
      price: 'Free',
      period: 'Forever',
      annualPrice: null,
      ctaVariant: 'secondary',
      ctaLabel: 'Begin for free',
      storage: '500MB storage',
      storageNote: 'Plenty of room for your first family stories',
      features: [
      'Unlimited family members',
      'Unlimited written memories and stories',
      'Family tree canvas',
      'Profile thumbnails for each family member',
      'One family tree',
      'Community support'],

      checkColor: LP.sage,
      featured: false
    },
    heritage: {
      key: 'heritage',
      name: 'Heritage',
      description: 'For families ready to preserve their full story — photographs, voices, and all.',
      price: '$7.99',
      period: '/month',
      annualPrice: 76.70,
      ctaVariant: 'primary',
      ctaLabel: 'Start with Heritage',
      storage: '50GB storage',
      storageNote: 'Room for thousands of family photographs',
      features: [
      'Everything in Remembrance',
      'Full photo galleries per profile',
      'Audio uploads — voice recordings and oral histories',
      'Up to 3 family trees',
      'Invite up to 10 family collaborators',
      'Export family tree as PDF',
      'Priority email support'],

      checkColor: LP.sage,
      featured: true
    },
    legacy: {
      key: 'legacy',
      name: 'Legacy',
      description: 'For the dedicated family historian. Everything, unlimited, forever.',
      price: '$14.99',
      period: '/month',
      annualPrice: 143.90,
      ctaVariant: 'secondary',
      ctaLabel: 'Start with Legacy',
      storage: 'Unlimited storage',
      storageNote: 'No limits — every photo, video, and voice, kept forever',
      features: [
      'Everything in Heritage',
      'Video uploads — family films and recordings',
      'Unlimited family trees',
      'Unlimited collaborators',
      'Advanced export — PDF, GEDCOM, full archive download',
      'Early access to new features',
      'Dedicated support'],

      checkColor: LP.gold,
      featured: false
    }
  };

  // Mobile order: Heritage first, then Remembrance, then Legacy
  const order = isMobile ?
  [plans.heritage, plans.remembrance, plans.legacy] :
  [plans.remembrance, plans.heritage, plans.legacy];

  return (
    <section style={{
      background: LP.ink,
      padding: isMobile ? '64px 0' : '96px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <LPNoiseOverlay />
      <div style={{
        position: 'relative',
        maxWidth: 1040, margin: '0 auto',
        padding: isMobile ? '0 24px' : '0 40px'
      }}>
        {/* Section header */}
        <div style={{ textAlign: 'center' }}>
          <LPSectionLabel>Plans</LPSectionLabel>
          <h2 style={{
            margin: '16px 0 0 0',
            fontFamily: LP.fontDisplay, fontWeight: 300,
            fontSize: isMobile ? 36 : 52, lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: LP.parchment,
            textWrap: 'balance'
          }}>Find the right plan for your family.</h2>
          <p style={{
            margin: '16px auto 0 auto',
            fontFamily: LP.fontBody, fontWeight: 400,
            fontSize: isMobile ? 17 : 19, lineHeight: 1.65,
            color: LP.warmLight,
            maxWidth: 560,
            textWrap: 'pretty'
          }}>Start for free and build at your own pace. Upgrade when your family&rsquo;s story is ready to grow.</p>

          {/* Billing toggle */}
          <div style={{
            marginTop: 24,
            display: 'inline-flex',
            alignItems: 'center',
            padding: 4,
            background: 'rgba(247,244,238,0.06)',
            border: `0.5px solid ${LP.borderInverse}`,
            borderRadius: 999
          }}>
            <LPBillingTab active={billing === 'monthly'} onClick={() => setBilling('monthly')}>Monthly</LPBillingTab>
            <LPBillingTab active={billing === 'annual'} onClick={() => setBilling('annual')}>Annual</LPBillingTab>
          </div>

          {/* Sage encouragement badge — only when Annual */}
          {billing === 'annual' &&
          <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center' }}>
              <span style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '4px 10px',
              background: LP.sageTint,
              color: LP.sage,
              fontFamily: LP.fontUI, fontWeight: 500, fontSize: 10,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              borderRadius: 2
            }}>Save up to 20%</span>
            </div>
          }
        </div>

        {/* Cards row */}
        <div style={{
          marginTop: 48,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 24,
          alignItems: 'stretch'
        }}>
          {order.map((p) =>
          <LPPlanCard
            key={p.key}
            plan={p}
            billing={billing}
            isMobile={isMobile} />

          )}
        </div>

        {/* Footnote */}
        <div style={{ marginTop: 32, textAlign: 'center' }}>
          <p style={{
            margin: 0,
            fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
            letterSpacing: '0.02em',
            color: LP.warmLight,
            lineHeight: 1.6,
            maxWidth: 560,
            marginLeft: 'auto', marginRight: 'auto',
            textWrap: 'pretty'
          }}>All plans include end-to-end encryption and full data ownership. Your family&rsquo;s stories are yours, always.</p>
          <div style={{ marginTop: 12 }}>
            <LPGhostLink color={LP.parchment} fontSize={12}>Compare all plan features →</LPGhostLink>
          </div>
        </div>
      </div>
    </section>);
}

function LPBillingTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        padding: '0 16px',
        background: active ? LP.surface2 : 'transparent',
        color: active ? LP.parchment : LP.warmLight,
        border: 'none',
        borderRadius: 999,
        fontFamily: LP.fontUI,
        fontWeight: active ? 500 : 400,
        fontSize: 13,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        transition: 'background 150ms cubic-bezier(.22,1,.36,1), color 150ms',
        WebkitTapHighlightColor: 'transparent'
      }}>{children}</button>);

}

function LPPlanCard({ plan, billing, isMobile }) {
  const featured = plan.featured;
  const showAnnual = billing === 'annual' && plan.annualPrice != null;

  // Desktop featured-lift: Heritage extends 4px up and 4px down (8px taller).
  // We give the two flanking cards 4px top+bottom margin and Heritage 0.
  const liftWrapperStyle = !isMobile ?
  { margin: featured ? '0' : '4px 0' } :
  {};

  // Annual price (monthly equivalent for headline; real billing note below)
  // Apply 20% discount on annual for the headline price display.
  const annualMonthly = plan.annualPrice != null ?
  plan.annualPrice / 12 :
  null;
  const displayPrice = showAnnual && annualMonthly != null ?
  `$${annualMonthly.toFixed(2)}` :
  plan.price;

  return (
    <div style={liftWrapperStyle}>
      <article style={{
        position: 'relative',
        background: LP.surface1,
        border: featured ? `1px solid ${LP.gold}` : `0.5px solid ${LP.border}`,
        borderRadius: 10,
        padding: 32,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Featured badge */}
        {featured &&
        <span style={{
          position: 'absolute',
          top: -1, right: 16,
          transform: 'translateY(-50%)',
          background: LP.gold,
          color: LP.parchment,
          fontFamily: LP.fontUI, fontWeight: 500, fontSize: 10,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          padding: '3px 8px',
          borderRadius: 2,
          whiteSpace: 'nowrap'
        }}>Most popular</span>
        }

        {/* Plan name */}
        <h3 style={{
          margin: 0,
          fontFamily: LP.fontDisplay, fontWeight: 500,
          fontSize: 24, lineHeight: 1.2,
          letterSpacing: '-0.005em',
          color: LP.ink
        }}>{plan.name}</h3>

        {/* Description (Cormorant — the one italic line per spec) */}
        <p style={{
          margin: '8px 0 0 0',
          fontFamily: LP.fontBody, fontWeight: 400,
          fontSize: 15, lineHeight: 1.6,
          color: LP.warmMid,
          textWrap: 'pretty'
        }}>{plan.description}</p>

        {/* Divider */}
        <div style={{
          height: 0.5, background: LP.border,
          margin: '16px 0'
        }} />

        {/* Price block */}
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: LP.fontDisplay, fontWeight: 300,
              fontSize: 48, lineHeight: 1,
              letterSpacing: '-0.01em',
              color: LP.ink
            }}>{displayPrice}</span>
            <span style={{
              fontFamily: LP.fontUI, fontWeight: 400, fontSize: 13,
              letterSpacing: '0.02em',
              color: LP.warmMid
            }}>{plan.period}</span>
          </div>
          {showAnnual &&
          <div style={{
            marginTop: 6,
            fontFamily: LP.fontUI, fontWeight: 400, fontSize: 11,
            letterSpacing: '0.04em',
            color: LP.sage
          }}>Billed ${plan.annualPrice.toFixed(2)} annually</div>
          }
        </div>

        {/* CTA */}
        <div style={{ marginTop: 16 }}>
          {plan.ctaVariant === 'primary' ?
          <LPPlanPrimaryCTA>{plan.ctaLabel}</LPPlanPrimaryCTA> :
          <LPPlanSecondaryCTA>{plan.ctaLabel}</LPPlanSecondaryCTA>}
        </div>

        {/* Divider */}
        <div style={{
          height: 0.5, background: LP.border,
          margin: '24px 0'
        }} />

        {/* Storage callout */}
        <div style={{
          background: LP.surface2,
          borderRadius: 6,
          padding: 12,
          display: 'flex', alignItems: 'flex-start', gap: 10
        }}>
          <LPIconStorage size={16} color={LP.warmMid} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: LP.fontUI, fontWeight: 500, fontSize: 13,
              letterSpacing: '0.01em',
              color: LP.ink, lineHeight: 1.3
            }}>{plan.storage}</div>
            <div style={{
              marginTop: 4,
              fontFamily: LP.fontUI, fontWeight: 400, fontSize: 11,
              letterSpacing: '0.02em',
              color: LP.warmMid, lineHeight: 1.45
            }}>{plan.storageNote}</div>
          </div>
        </div>

        {/* Feature list */}
        <ul style={{
          margin: '16px 0 0 0', padding: 0, listStyle: 'none',
          display: 'flex', flexDirection: 'column', gap: 12
        }}>
          {plan.features.map((f, i) =>
          <li key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12
          }}>
              <span style={{
              flexShrink: 0,
              width: 16, height: 16,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              marginTop: 1
            }}>
                <LPIconCheck size={16} color={plan.checkColor} />
              </span>
              <span style={{
              fontFamily: LP.fontUI, fontWeight: 400, fontSize: 13,
              letterSpacing: '0.01em',
              color: LP.inkSoft, lineHeight: 1.5
            }}>{f}</span>
            </li>
          )}
        </ul>
      </article>
    </div>);

}

// ----- Plan CTA buttons (full-width, height 48px, radius 4) -----
function LPPlanPrimaryCTA({ children }) {
  const [hover, setHover] = useLP(false);
  const [press, setPress] = useLP(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {setHover(false);setPress(false);}}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      style={{
        width: '100%', height: 48,
        background: LP.ink, color: LP.parchment,
        border: 'none', borderRadius: 4,
        fontFamily: LP.fontUI, fontWeight: 500, fontSize: 15,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        opacity: hover ? 0.88 : 1,
        transform: press ? 'scale(0.98)' : 'scale(1)',
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1), transform 100ms cubic-bezier(.22,1,.36,1)',
        WebkitTapHighlightColor: 'transparent'
      }}>{children}</button>);

}

function LPPlanSecondaryCTA({ children }) {
  const [hover, setHover] = useLP(false);
  const [press, setPress] = useLP(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {setHover(false);setPress(false);}}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      style={{
        width: '100%', height: 48,
        background: hover ? LP.surface2 : 'transparent',
        color: LP.ink,
        border: `0.5px solid ${LP.border}`,
        borderRadius: 4,
        fontFamily: LP.fontUI, fontWeight: 500, fontSize: 15,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        transform: press ? 'scale(0.98)' : 'scale(1)',
        transition: 'background 150ms cubic-bezier(.22,1,.36,1), transform 100ms cubic-bezier(.22,1,.36,1)',
        WebkitTapHighlightColor: 'transparent'
      }}>{children}</button>);

}

// ----- Plans-only icons -----
function LPIconCheck({ size = 16, color }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.25 8.25 L6.5 11.25 L12.75 4.75"
      stroke={color} strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" />
    </svg>);

}

function LPIconStorage({ size = 16, color }) {
  // A simple stacked-disk glyph — archive volume, not cloud.
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <ellipse cx="8" cy="4" rx="5.25" ry="1.75"
      stroke={color} strokeWidth="1.25" />
      <path d="M2.75 4 V8 C 2.75 8.97, 5.1 9.75, 8 9.75 C 10.9 9.75, 13.25 8.97, 13.25 8 V4"
      stroke={color} strokeWidth="1.25" strokeLinecap="round" />
      <path d="M2.75 8 V12 C 2.75 12.97, 5.1 13.75, 8 13.75 C 10.9 13.75, 13.25 12.97, 13.25 12 V8"
      stroke={color} strokeWidth="1.25" strokeLinecap="round" />
    </svg>);

}

// ============================================================
// SECTION 05 — HUMAN MOMENT
// ============================================================

function LPHumanMoment({ variant = 'desktop' }) {
  const isMobile = variant === 'mobile';

  const memory = {
    date: 'August 1974',
    title: 'The summer we moved to Cork.',
    excerpt: 'We arrived in Cork on a Sunday in late June, all our things in two trunks and a hatbox that had belonged to my mother. Margaret stood at the door of the new house and said nothing for a long time.',
    author: { name: 'Margaret Walsh', status: 'deceased' },
    timestamp: 'Added April 2024',
    tags: ['Migration']
  };

  const pullquote =
  <h2 style={{
    margin: 0,
    fontFamily: LP.fontDisplay, fontWeight: 300,
    fontSize: isMobile ? 32 : 48, lineHeight: 1.1,
    letterSpacing: '-0.01em',
    color: LP.ink,
    textAlign: isMobile ? 'center' : 'left',
    textWrap: 'balance'
  }}>She deserved more than a photograph in a drawer.</h2>;


  const description =
  <p style={{
    margin: isMobile ? '24px 0 0 0' : '24px 0 0 0',
    fontFamily: LP.fontBody, fontWeight: 400,
    fontSize: 17, lineHeight: 1.75,
    color: LP.warmMid,
    maxWidth: 420,
    textAlign: isMobile ? 'center' : 'left',
    textWrap: 'pretty'
  }}>PROSAPIAM gives every person in your family the space they deserve — a living record of who they were, told in their own stories, photographs, and memories.</p>;


  const card =
  <MemoryCard
    date={memory.date}
    title={memory.title}
    excerpt={memory.excerpt}
    media={null} // placeholder rendered via mediaSlot below
    author={memory.author}
    timestamp={memory.timestamp}
    tags={memory.tags}
    variant="standard" />;



  // We bypass the built-in media param and slot in a warm SVG placeholder
  // so the landing page doesn't depend on an external image.
  const cardWithPlaceholder =
  <article style={{
    background: LP.surface1,
    border: `0.5px solid ${LP.border}`,
    borderRadius: 10,
    overflow: 'hidden',
    width: '100%'
  }}>
      <LPSepiaPhotoPlaceholder caption="Walsh family · Cork · 1974" />
      <div style={{ padding: 24 }}>
        <div style={{
        fontFamily: LP.fontUI, fontWeight: 500, fontSize: 11,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        color: LP.warmMid
      }}>{memory.date}</div>
        <h3 style={{
        margin: '6px 0 0 0',
        fontFamily: LP.fontDisplay, fontWeight: 500,
        fontSize: 22, lineHeight: 1.25,
        letterSpacing: '-0.005em',
        color: LP.ink
      }}>{memory.title}</h3>
        <p style={{
        margin: '14px 0 0 0',
        fontFamily: LP.fontBody, fontStyle: 'italic', fontWeight: 400,
        fontSize: 17, lineHeight: 1.75,
        color: LP.inkSoft,
        textWrap: 'pretty'
      }}>{memory.excerpt}</p>

        <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, marginTop: 20, paddingTop: 16,
        borderTop: `0.5px solid ${LP.border}`
      }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: LP.surface3,
            border: `0.5px solid ${LP.border}`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: LP.fontUI, fontWeight: 500, fontSize: 11,
            color: LP.warmMid,
            filter: 'grayscale(0.25)'
          }}>MW</span>
            <span style={{
            fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
            color: LP.warmMid
          }}>{memory.author.name}</span>
          </span>
          <span style={{
          fontFamily: LP.fontUI, fontWeight: 400, fontSize: 11,
          color: LP.warmMid
        }}>{memory.timestamp}</span>
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {memory.tags.map((t) =>
        <span key={t} style={{
          display: 'inline-flex', alignItems: 'center',
          height: 22, padding: '0 8px',
          background: LP.surface2,
          border: `0.5px solid ${LP.border}`,
          borderRadius: 2,
          fontFamily: LP.fontUI, fontWeight: 500, fontSize: 11,
          letterSpacing: '0.06em',
          color: LP.inkSoft
        }}>{t}</span>
        )}
        </div>
      </div>
    </article>;


  if (isMobile) {
    return (
      <section style={{
        background: LP.parchment,
        padding: '64px 24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <LPSectionLabel>A memory, kept</LPSectionLabel>
          <div style={{ marginTop: 16 }}>{pullquote}</div>
          <div>{description}</div>
        </div>
        <div style={{ marginTop: 32 }}>{cardWithPlaceholder}</div>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <LPGhostLink>See how profiles work →</LPGhostLink>
        </div>
      </section>);

  }

  return (
    <section style={{
      background: LP.parchment,
      padding: '96px 0'
    }}>
      <div style={{
        maxWidth: 1040, margin: '0 auto',
        padding: '0 40px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 64,
        alignItems: 'center'
      }}>
        <div>
          <LPSectionLabel align="left">A memory, kept</LPSectionLabel>
          <div style={{ marginTop: 16 }}>{pullquote}</div>
          <div>{description}</div>
          <div style={{ marginTop: 32 }}>
            <LPGhostLink>See how profiles work →</LPGhostLink>
          </div>
        </div>
        <div>{cardWithPlaceholder}</div>
      </div>
    </section>);

}

// ----- Warm sepia photograph placeholder (single tone — not a gradient) -----
function LPSepiaPhotoPlaceholder({ caption }) {
  // The illustration evokes an archival family photograph — a kitchen table,
  // a window, three figures. Single warm-sepia base, ink line work, no
  // gradients. Deliberately rough and warm — it should feel like a memory.
  return (
    <div style={{
      position: 'relative',
      width: '100%',
      paddingTop: '60%',
      background: '#C7A98A',
      overflow: 'hidden',
      borderBottom: `0.5px solid ${LP.border}`
    }}>
      <svg
        viewBox="0 0 400 240"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        
        <defs>
          <filter id="lp-photo-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.35 0" />
          </filter>
        </defs>
        {/* Sepia base — flat, not a gradient. Subtle radial inset of darker sepia
                                         isn't a gradient — it's two stacked flats. */}
        <rect width="400" height="240" fill="#C7A98A" />
        <rect width="400" height="240" fill="#B89472" opacity="0.35" />
        {/* Window of light, far back */}
        <rect x="240" y="40" width="90" height="80" fill="#E0C9A8" opacity="0.85" />
        <line x1="285" y1="40" x2="285" y2="120" stroke="#7A5A3D" strokeWidth="1.2" opacity="0.55" />
        <line x1="240" y1="80" x2="330" y2="80" stroke="#7A5A3D" strokeWidth="1.2" opacity="0.55" />
        {/* Floor + table */}
        <rect x="0" y="170" width="400" height="70" fill="#9B7651" opacity="0.55" />
        <rect x="50" y="155" width="160" height="14" fill="#7A5A3D" opacity="0.7" />
        <rect x="65" y="169" width="6" height="60" fill="#7A5A3D" opacity="0.7" />
        <rect x="190" y="169" width="6" height="60" fill="#7A5A3D" opacity="0.7" />
        {/* Figures — three, soft silhouettes */}
        {/* Adult standing left */}
        <g fill="#4A382A" opacity="0.85">
          <circle cx="105" cy="95" r="14" />
          <path d="M85 165 C 85 130, 125 130, 125 165 L 125 175 L 85 175 Z" />
        </g>
        {/* Adult standing right */}
        <g fill="#4A382A" opacity="0.85">
          <circle cx="170" cy="100" r="13" />
          <path d="M153 165 C 153 133, 187 133, 187 165 L 187 175 L 153 175 Z" />
        </g>
        {/* Child, seated at table */}
        <g fill="#3A2A1E" opacity="0.85">
          <circle cx="138" cy="135" r="10" />
          <path d="M125 160 C 125 145, 151 145, 151 160 L 151 168 L 125 168 Z" />
        </g>
        {/* Hatbox in foreground left */}
        <ellipse cx="36" cy="200" rx="24" ry="6" fill="#4A382A" opacity="0.5" />
        <rect x="12" y="178" width="48" height="22" rx="3" fill="#7A5A3D" />
        <path d="M12 178 L60 178" stroke="#4A382A" strokeWidth="1" />
        {/* Photo edge vignette — flat dark rim */}
        <rect x="0" y="0" width="400" height="4" fill="#4A382A" opacity="0.35" />
        <rect x="0" y="236" width="400" height="4" fill="#4A382A" opacity="0.35" />
        <rect x="0" y="0" width="4" height="240" fill="#4A382A" opacity="0.35" />
        <rect x="396" y="0" width="4" height="240" fill="#4A382A" opacity="0.35" />
        {/* Grain overlay */}
        <rect width="400" height="240" filter="url(#lp-photo-grain)" opacity="0.55" />
      </svg>
      {/* Caption — small, lower-left, archival */}
      <span style={{
        position: 'absolute', left: 14, bottom: 10,
        fontFamily: LP.fontUI, fontWeight: 400, fontSize: 10,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        color: 'rgba(247,244,238,0.85)'
      }}>{caption}</span>
    </div>);

}

// ============================================================
// SECTION 05 — FINAL CTA
// ============================================================

function LPFinalCTA({ variant = 'desktop' }) {
  const isMobile = variant === 'mobile';
  const sub = 'Gather your family\u2019s stories. Preserve the people behind your name. Celebrate the lives that made you — and make sure they\u2019re never forgotten.';

  return (
    <section style={{
      background: LP.ink,
      padding: isMobile ? '64px 24px' : '120px 0',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <LPNoiseOverlay />
      <div style={{
        position: 'relative',
        maxWidth: 680, margin: '0 auto',
        textAlign: 'center',
        padding: isMobile ? 0 : '0 40px'
      }}>
        <LPSectionLabel>Begin</LPSectionLabel>
        <h2 style={{
          margin: '16px 0 0 0',
          fontFamily: LP.fontDisplay, fontWeight: 300,
          fontSize: isMobile ? 40 : 64, lineHeight: 1.1,
          letterSpacing: '-0.02em',
          color: LP.parchment,
          textWrap: 'balance'
        }}>Your family&rsquo;s story is waiting.</h2>
        <p style={{
          margin: '24px auto 0 auto',
          fontFamily: LP.fontBody, fontWeight: 400,
          fontSize: isMobile ? 17 : 19, lineHeight: 1.65,
          color: LP.warmLight,
          maxWidth: 560,
          textWrap: 'pretty'
        }}>{sub}</p>

        {/* Buttons */}
        {isMobile ?
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <LPPrimaryButton size="lg" variant="parchment" fullWidth>Create your account</LPPrimaryButton>
            <LPInverseGhostButton fullWidth>Sign in</LPInverseGhostButton>
          </div> :

        <div style={{
          marginTop: 40,
          display: 'inline-flex', gap: 16, justifyContent: 'center'
        }}>
            <LPPrimaryButton size="lg" variant="parchment">Create your account</LPPrimaryButton>
            <LPInverseGhostButton>Sign in</LPInverseGhostButton>
          </div>
        }

        <p style={{
          margin: isMobile ? '24px 0 0 0' : '32px 0 0 0',
          fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
          letterSpacing: '0.02em',
          color: LP.warmLight,
          opacity: 0.85
        }}>No subscription required to begin. Your family&rsquo;s stories are yours, always.</p>
      </div>
    </section>);

}

function LPInverseGhostButton({ children, fullWidth }) {
  const [hover, setHover] = useLP(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: LP.fontUI, fontWeight: 500, fontSize: 15,
        letterSpacing: '0.02em',
        height: fullWidth ? 44 : 48, padding: '0 20px',
        background: 'transparent',
        color: LP.parchment,
        border: 'none',
        cursor: 'pointer',
        textDecoration: 'underline',
        textUnderlineOffset: 3,
        textDecorationThickness: '0.5px',
        opacity: hover ? 0.70 : 1,
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
        width: fullWidth ? '100%' : 'auto',
        WebkitTapHighlightColor: 'transparent'
      }}>{children}</button>);

}

// ============================================================
// FOOTER
// ============================================================

function LPFooter({ variant = 'desktop' }) {
  const isMobile = variant === 'mobile';
  const links = ['About', 'Privacy', 'Terms', 'Contact'];

  if (isMobile) {
    return (
      <footer style={{
        background: LP.ink,
        borderTop: `0.5px solid ${LP.borderInverse}`,
        padding: '32px 24px',
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center'
      }}>
        <LPWordmark size={16} color={LP.parchment} />
        <span style={{
          fontFamily: LP.fontBody, fontWeight: 400,
          fontSize: 13, color: LP.warmLight
        }}>For the people who made you.</span>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          {links.map((l) =>
          <a key={l} href="#" onClick={(e) => e.preventDefault()} style={{
            fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
            color: LP.warmLight, textDecoration: 'none'
          }}>{l}</a>
          )}
        </div>
        <span style={{
          fontFamily: LP.fontUI, fontWeight: 400, fontSize: 11,
          color: LP.warmLight, opacity: 0.7
        }}>© 2026 PROSAPIAM. Made with care.</span>
      </footer>);

  }

  return (
    <footer style={{
      background: LP.ink,
      borderTop: `0.5px solid ${LP.borderInverse}`,
      padding: '48px 0'
    }}>
      <div style={{
        maxWidth: 1040, margin: '0 auto',
        padding: '0 40px',
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: 32, alignItems: 'flex-start'
      }}>
        {/* Left */}
        <div>
          <LPWordmark size={16} color={LP.parchment} />
          <div style={{
            marginTop: 10,
            fontFamily: LP.fontBody, fontWeight: 400,
            fontSize: 13, color: LP.warmLight, lineHeight: 1.55
          }}>For the people who made you.</div>
        </div>
        {/* Center */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
          {links.map((l) =>
          <a key={l} href="#" onClick={(e) => e.preventDefault()} style={{
            fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
            color: LP.warmLight, textDecoration: 'none',
            transition: 'color 150ms'
          }}>{l}</a>
          )}
        </div>
        {/* Right */}
        <div style={{ textAlign: 'right' }}>
          <div style={{
            fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
            color: LP.warmLight, lineHeight: 1.6
          }}>© 2026 PROSAPIAM. All rights reserved.</div>
          <div style={{
            marginTop: 8,
            fontFamily: LP.fontUI, fontWeight: 400, fontSize: 12,
            color: LP.warmLight, opacity: 0.75, lineHeight: 1.6
          }}>Made with care for families everywhere.</div>
        </div>
      </div>
    </footer>);

}

// ============================================================
// Composite artboards
// ============================================================

function LPDesktopArtboard() {
  return (
    <div data-screen-label="Landing · Desktop" style={{
      width: '100%',
      background: LP.parchment,
      fontFamily: LP.fontUI,
      color: LP.inkSoft
    }}>
      <LPNav variant="desktop" />
      <LPHero variant="desktop" />
      <LPProductMoment variant="desktop" />
      <LPFeatures variant="desktop" />
      <LPPlans variant="desktop" />
      <LPHumanMoment variant="desktop" />
      <LPFinalCTA variant="desktop" />
      <LPFooter variant="desktop" />
    </div>);

}

function LPMobileArtboard() {
  return (
    <div data-screen-label="Landing · Mobile" style={{
      width: '100%',
      background: LP.parchment,
      fontFamily: LP.fontUI,
      color: LP.inkSoft
    }}>
      <LPNav variant="mobile" />
      <LPHero variant="mobile" />
      <LPProductMoment variant="mobile" />
      <LPFeatures variant="mobile" />
      <LPPlans variant="mobile" />
      <LPHumanMoment variant="mobile" />
      <LPFinalCTA variant="mobile" />
      <LPFooter variant="mobile" />
    </div>);

}

Object.assign(window, {
  LPDesktopArtboard, LPMobileArtboard,
  LPNav, LPHero, LPProductMoment, LPFeatures, LPPlans, LPHumanMoment, LPFinalCTA, LPFooter
});