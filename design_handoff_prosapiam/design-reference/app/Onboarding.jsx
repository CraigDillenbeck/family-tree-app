// Onboarding.jsx — Responsive web onboarding flow for PROSAPIAM
//
// Four screens, post sign-up, before the user lands on the Dashboard:
//   01  Welcome           "Hello, Sarah."
//   02  Begin with yourself  — first-person form, live preview node
//   03  First leaf        — confirmation
//   04  Forgot password   — recovery flow, reachable from Landing
//
// Typography system matches the Landing Page:
//   Young Serif      → display headlines (rare; we mostly use Cormorant italic)
//   Cormorant Garamond → editorial pull-quotes (italic) + body (regular)
//   Plus Jakarta Sans   → all UI chrome (labels, buttons, captions, wordmark)
//
// Each screen exports as a function taking { variant: 'desktop' | 'mobile' }.
// The host HTML composes them inside a DesignCanvas with desktop + mobile
// artboards, the same shape as Landing Page.html.

const { useState: useOB, useEffect: useOBEffect } = React;

// ============================================================
// Tokens — local mirror of LP tokens, named OB so styles don't
// collide if both files are ever loaded together.
// ============================================================
const OB = {
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
  terra: '#8C4A38',
  terraTint: '#F2E4E1',
  border: '#D6CFC4',
  borderInverse: 'rgba(247,244,238,0.15)',
  fontDisplay: 'var(--font-display)',
  fontUI: 'var(--font-ui)',
  fontBody: 'var(--font-body)'
};

// ============================================================
// Primitives
// ============================================================

function OBWordmark({ size = 18, color = OB.ink }) {
  // Plus Jakarta Sans Light all-caps — matches Landing Page wordmark.
  return (
    <span style={{
      fontFamily: OB.fontUI,
      fontWeight: 300,
      fontSize: size,
      lineHeight: 1,
      letterSpacing: '0.06em',
      color
    }}>PROSAPIAM</span>
  );
}

function OBSectionLabel({ children, color = OB.gold, align = 'center' }) {
  return (
    <div style={{
      fontFamily: OB.fontUI,
      fontWeight: 500,
      fontSize: 11,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color,
      textAlign: align
    }}>{children}</div>
  );
}

function OBPrimaryButton({ children, onClick, fullWidth, loading, disabled, iconRight, size = 'lg' }) {
  const heights = { md: 44, lg: 48 };
  const fontSizes = { md: 14, lg: 15 };
  const [hover, setHover] = useOB(false);
  const [press, setPress] = useOB(false);
  const isDisabled = disabled || loading;
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      style={{
        fontFamily: OB.fontUI, fontWeight: 500, fontSize: fontSizes[size],
        letterSpacing: '0.02em',
        height: heights[size], padding: '0 24px',
        background: OB.ink, color: OB.parchment,
        border: 'none', borderRadius: 4,
        cursor: isDisabled ? 'default' : 'pointer',
        opacity: isDisabled ? 0.45 : (hover ? 0.88 : 1),
        transform: press ? 'scale(0.98)' : 'scale(1)',
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1), transform 100ms cubic-bezier(.22,1,.36,1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: fullWidth ? '100%' : 'auto',
        WebkitTapHighlightColor: 'transparent',
        whiteSpace: 'nowrap'
      }}>
      {loading && <OBSpinner />}
      <span>{children}</span>
      {iconRight && !loading && <OBArrowIcon size={16} />}
    </button>
  );
}

function OBSecondaryButton({ children, onClick, fullWidth, size = 'lg' }) {
  const heights = { md: 44, lg: 48 };
  const fontSizes = { md: 14, lg: 15 };
  const [hover, setHover] = useOB(false);
  const [press, setPress] = useOB(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setPress(false); }}
      onPointerDown={() => setPress(true)}
      onPointerUp={() => setPress(false)}
      style={{
        fontFamily: OB.fontUI, fontWeight: 500, fontSize: fontSizes[size],
        letterSpacing: '0.02em',
        height: heights[size], padding: '0 24px',
        background: hover ? OB.surface1 : 'transparent',
        color: OB.ink,
        border: `0.5px solid ${OB.border}`,
        borderRadius: 4,
        cursor: 'pointer',
        transform: press ? 'scale(0.98)' : 'scale(1)',
        transition: 'background 150ms cubic-bezier(.22,1,.36,1), transform 100ms cubic-bezier(.22,1,.36,1)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: fullWidth ? '100%' : 'auto',
        WebkitTapHighlightColor: 'transparent',
        whiteSpace: 'nowrap'
      }}>{children}</button>
  );
}

function OBGhostLink({ children, onClick, color = OB.warmMid, fontSize = 13 }) {
  const [hover, setHover] = useOB(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        fontFamily: OB.fontUI, fontWeight: 500, fontSize,
        letterSpacing: '0.02em',
        color,
        background: 'transparent',
        border: 'none',
        textDecoration: 'underline',
        textUnderlineOffset: 3,
        textDecorationThickness: '0.5px',
        opacity: hover ? 0.70 : 1,
        transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
        cursor: 'pointer',
        padding: 8,
        WebkitTapHighlightColor: 'transparent'
      }}>{children}</button>
  );
}

function OBSpinner({ size = 16 }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: '50%',
      border: '1.5px solid currentColor', borderTopColor: 'transparent',
      animation: 'obSpin 700ms linear infinite',
      display: 'inline-block'
    }} />
  );
}

function OBArrowIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14 M13 6l6 6-6 6"
        stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OBBackIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6l-6 6 6 6"
        stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OBCheckIcon({ size = 28, color = OB.sage }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12 L10 17 L20 7"
        stroke={color} strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function OBBackButton({ onClick, label = 'Back' }) {
  const [hover, setHover] = useOB(false);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none',
        padding: '8px 12px 8px 4px',
        color: hover ? OB.ink : OB.warmMid,
        fontFamily: OB.fontUI, fontWeight: 500, fontSize: 13,
        letterSpacing: '0.02em',
        cursor: 'pointer',
        transition: 'color 150ms',
        WebkitTapHighlightColor: 'transparent'
      }}>
      <OBBackIcon size={18} />
      <span>{label}</span>
    </button>
  );
}

// ----- Form field (matches Landing's auth-panel field style) -----
function OBField({ label, type = 'text', placeholder, value, onChange, error, hint, autoComplete, autoFocus }) {
  const [focus, setFocus] = useOB(false);
  const [reveal, setReveal] = useOB(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (reveal ? 'text' : 'password') : type;
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <span style={{
          fontFamily: OB.fontUI, fontWeight: 500, fontSize: 10,
          letterSpacing: '0.10em', textTransform: 'uppercase',
          color: error ? OB.terra : OB.warmMid
        }}>{label}</span>
      )}
      <span style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 48, padding: '0 14px',
        background: focus ? '#FFFEFB' : (error ? OB.terraTint : OB.surface2),
        border: `0.5px solid ${error ? OB.terra : (focus ? OB.gold : OB.border)}`,
        borderRadius: 4,
        transition: 'background 150ms, border-color 150ms'
      }}>
        <input
          type={inputType}
          placeholder={placeholder}
          value={value || ''}
          onChange={onChange}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: OB.fontUI, fontWeight: 400, fontSize: 15,
            letterSpacing: '0.005em',
            color: OB.ink, minWidth: 0
          }}
        />
        {isPassword && value && (
          <button type="button" onClick={() => setReveal(r => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: 4, color: OB.warmMid, display: 'flex'
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        )}
      </span>
      {(error || hint) && (
        <span style={{
          fontFamily: OB.fontUI, fontWeight: 400, fontSize: 11,
          color: error ? OB.terra : OB.warmMid,
          letterSpacing: '0.02em', lineHeight: 1.5
        }}>{error || hint}</span>
      )}
    </label>
  );
}

// ============================================================
// Page shell — the in-app surface every onboarding screen sits in.
// Desktop: full viewport, discrete wordmark top-left, optional back
// button next to it. Mobile: same shape, tighter padding.
// The shell is responsible for the parchment background, the inset
// archival border, and centering the content column.
// ============================================================
function OBShell({ variant, screenLabel, showBack, onBack, children, hideChrome = false }) {
  const isMobile = variant === 'mobile';
  const padX = isMobile ? 24 : 80;
  const padY = isMobile ? 32 : 80;

  return (
    <div data-screen-label={screenLabel} style={{
      width: '100%',
      minHeight: isMobile ? 'auto' : '100%',
      background: OB.parchment,
      fontFamily: OB.fontUI,
      color: OB.inkSoft,
      position: 'relative',
      display: 'flex', flexDirection: 'column',
      padding: `${padY}px ${padX}px`,
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Soft inset archival frame — matches the existing Welcome treatment */}
      {!hideChrome && (
        <div style={{
          position: 'absolute',
          top: isMobile ? 16 : 32,
          left: isMobile ? 16 : 32,
          right: isMobile ? 16 : 32,
          bottom: isMobile ? 16 : 32,
          border: `0.5px solid ${OB.border}`,
          pointerEvents: 'none'
        }} />
      )}

      {/* Top chrome — wordmark + optional back */}
      {!hideChrome && (
        <div style={{
          position: 'relative',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: isMobile ? 24 : 40
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {showBack && <OBBackButton onClick={onBack} />}
            {!showBack && <OBWordmark size={isMobile ? 14 : 16} />}
          </div>
          {showBack && <OBWordmark size={isMobile ? 14 : 16} />}
        </div>
      )}

      {/* Content column — vertically centered when there's room */}
      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center'
      }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// 01 — Welcome
// "Hello, Sarah." The editorial moment right after sign-up.
// ============================================================
function OBWelcome({ variant = 'desktop', name = 'Sarah', onContinue }) {
  const isMobile = variant === 'mobile';

  return (
    <OBShell variant={variant} screenLabel="01 Welcome">
      <div style={{
        maxWidth: isMobile ? '100%' : 560,
        textAlign: 'center',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <OBSectionLabel>Welcome</OBSectionLabel>

        <h1 style={{
          margin: '20px 0 0 0',
          fontFamily: OB.fontBody, fontStyle: 'italic',
          fontWeight: 400,
          fontSize: isMobile ? 40 : 56,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: OB.ink,
          textWrap: 'balance'
        }}>Hello, {name}.</h1>

        <p style={{
          margin: '28px 0 0 0',
          fontFamily: OB.fontBody, fontWeight: 400,
          fontSize: isMobile ? 18 : 20, lineHeight: 1.7,
          color: OB.inkSoft,
          maxWidth: 480,
          textWrap: 'pretty'
        }}>What you make here will outlast the screen you&rsquo;re holding. A name. A face. A summer your grandmother kept a garden on Maple Street.</p>

        <p style={{
          margin: '32px 0 0 0',
          fontFamily: OB.fontUI, fontWeight: 400, fontSize: 13,
          letterSpacing: '0.04em',
          color: OB.warmMid
        }}>Every family tree begins the same way.</p>

        <div style={{
          marginTop: isMobile ? 40 : 56,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          width: isMobile ? '100%' : 'auto'
        }}>
          <OBPrimaryButton onClick={onContinue} iconRight fullWidth={isMobile}>
            Begin with yourself
          </OBPrimaryButton>
          <OBGhostLink onClick={onContinue} fontSize={12}>I&rsquo;ll come back to it later</OBGhostLink>
        </div>
      </div>
    </OBShell>
  );
}

// ============================================================
// 02 — Begin with yourself
// First-person form with live preview node.
// Desktop: preview node + form side-by-side. Mobile: stacked.
// ============================================================
function OBBegin({ variant = 'desktop', initialGiven = '', onSave, onBack }) {
  const isMobile = variant === 'mobile';
  const [given, setGiven] = useOB(initialGiven);
  const [family, setFamily] = useOB('');
  const [year, setYear] = useOB('');
  const [place, setPlace] = useOB('');
  const [errors, setErrors] = useOB({});
  const [submitting, setSubmitting] = useOB(false);

  const initials = ((given[0] || '') + (family[0] || '')).toUpperCase() || '—';
  const filled = given.trim().length > 0;

  function submit(ev) {
    ev && ev.preventDefault && ev.preventDefault();
    const e = {};
    if (!given.trim()) e.given = 'A given name keeps the record yours.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSave && onSave({ given, family, year, place });
    }, 600);
  }

  // Step indicator (Plus Jakarta Sans label)
  const stepLabel = (
    <span style={{
      fontFamily: OB.fontUI, fontWeight: 500, fontSize: 11,
      letterSpacing: '0.18em', textTransform: 'uppercase',
      color: OB.warmMid
    }}>Step 1 of 3</span>
  );

  // Preview node — same vocabulary as the family tree node card.
  const previewNode = (
    <div style={{
      width: '100%',
      maxWidth: 360,
      background: OB.surface1,
      border: filled ? `1px solid ${OB.gold}` : `0.5px solid ${OB.border}`,
      borderRadius: 10,
      padding: '20px 22px',
      display: 'flex', alignItems: 'center', gap: 14,
      transition: 'border-color 280ms cubic-bezier(.22,1,.36,1)'
    }}>
      <span style={{
        width: 56, height: 56, borderRadius: '50%',
        background: OB.surface2, border: `0.5px solid ${OB.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: OB.fontUI, fontWeight: 500,
        fontSize: 17, letterSpacing: '0.04em',
        color: OB.warmMid, flexShrink: 0
      }}>{initials}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: OB.fontUI, fontWeight: 500, fontSize: 16,
          letterSpacing: '0.005em',
          color: OB.ink,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
        }}>
          {filled || family
            ? `${given} ${family}`.trim()
            : <span style={{ color: OB.warmLight, fontWeight: 400 }}>Your name</span>}
        </div>
        <div style={{
          fontFamily: OB.fontUI, fontWeight: 400, fontSize: 12,
          letterSpacing: '0.02em',
          color: OB.warmMid, marginTop: 5,
          display: 'flex', alignItems: 'center', gap: 6
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: OB.sage,
            display: 'inline-block'
          }} />
          <span>Living{year ? ` · Born ${year}` : ''}{place ? ` · ${place}` : ''}</span>
        </div>
      </div>
    </div>
  );

  // Form body (same on both variants — only the container width changes)
  const form = (
    <form onSubmit={submit} style={{
      display: 'flex', flexDirection: 'column', gap: 14,
      width: '100%'
    }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <OBField label="Given name" placeholder="Sarah"
            value={given} onChange={(e) => setGiven(e.target.value)}
            error={errors.given} autoComplete="given-name" autoFocus />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <OBField label="Family name" placeholder="Walsh"
            value={family} onChange={(e) => setFamily(e.target.value)}
            autoComplete="family-name" />
        </div>
      </div>
      <OBField label="Year of birth" placeholder="e.g. 1987"
        value={year}
        onChange={(e) => setYear(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
        hint="Optional. You can add the full date later." />
      <OBField label="Where you were born" placeholder="e.g. Cork, Ireland"
        value={place} onChange={(e) => setPlace(e.target.value)}
        hint="A city, a county, or just a country." />
      <div style={{ marginTop: 8 }}>
        <OBPrimaryButton onClick={submit} loading={submitting}
          disabled={!filled && !submitting} iconRight fullWidth>
          {submitting ? 'Saving…' : 'Add yourself to the tree'}
        </OBPrimaryButton>
      </div>
    </form>
  );

  return (
    <OBShell variant={variant} screenLabel="02 Begin" showBack onBack={onBack}>
      <div style={{
        width: '100%',
        maxWidth: isMobile ? '100%' : 880
      }}>
        {/* Heading row — step label centered */}
        <div style={{
          display: 'flex', justifyContent: 'center',
          marginBottom: isMobile ? 16 : 20
        }}>{stepLabel}</div>

        <h1 style={{
          margin: 0,
          fontFamily: OB.fontBody, fontStyle: 'italic',
          fontWeight: 400,
          fontSize: isMobile ? 32 : 44,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: OB.ink, textAlign: 'center',
          textWrap: 'balance'
        }}>Begin with yourself.</h1>
        <p style={{
          margin: '14px auto 0 auto',
          fontFamily: OB.fontBody, fontWeight: 400,
          fontSize: isMobile ? 17 : 19, lineHeight: 1.6,
          color: OB.warmMid,
          maxWidth: 460, textAlign: 'center',
          textWrap: 'pretty'
        }}>You are the first person in your tree. Add what feels right — you can fill in the rest later.</p>

        {/* Body: side-by-side on desktop, stacked on mobile.
            Use minmax(0,1fr) so the column can shrink below the children's
            min-content — otherwise the form's two-column inner row pushes
            the column past the artboard width on mobile. */}
        <div style={{
          marginTop: isMobile ? 32 : 48,
          display: 'grid',
          gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : '360px minmax(0, 1fr)',
          gap: isMobile ? 28 : 56,
          alignItems: 'start'
        }}>
          <div style={{
            minWidth: 0,
            display: 'flex', justifyContent: isMobile ? 'center' : 'flex-start',
            position: isMobile ? 'static' : 'sticky',
            top: 0
          }}>
            {previewNode}
          </div>
          <div style={{ minWidth: 0 }}>{form}</div>
        </div>
      </div>
    </OBShell>
  );
}

// ============================================================
// 03 — First leaf (success)
// ============================================================
function OBSuccess({ variant = 'desktop', name = 'Sarah', onContinue }) {
  const isMobile = variant === 'mobile';
  return (
    <OBShell variant={variant} screenLabel="03 First leaf">
      <div style={{
        maxWidth: isMobile ? '100%' : 520,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center'
      }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: OB.sageTint,
          border: `0.5px solid ${OB.sage}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: OB.sage,
          marginBottom: 28
        }}>
          <OBCheckIcon size={32} color={OB.sage} />
        </div>

        <OBSectionLabel>The first leaf</OBSectionLabel>

        <h1 style={{
          margin: '18px 0 0 0',
          fontFamily: OB.fontBody, fontStyle: 'italic',
          fontWeight: 400,
          fontSize: isMobile ? 36 : 52,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          color: OB.ink,
          textWrap: 'balance'
        }}>Your tree has begun, {name}.</h1>

        <p style={{
          margin: '24px 0 0 0',
          fontFamily: OB.fontBody, fontWeight: 400,
          fontSize: isMobile ? 17 : 19, lineHeight: 1.7,
          color: OB.inkSoft,
          maxWidth: 440,
          textWrap: 'pretty'
        }}>From here, every parent, sibling and grandparent you remember will find their place.</p>

        <div style={{
          marginTop: isMobile ? 36 : 48,
          width: isMobile ? '100%' : 'auto'
        }}>
          <OBPrimaryButton onClick={onContinue} iconRight fullWidth={isMobile}>
            Take me to my tree
          </OBPrimaryButton>
        </div>
      </div>
    </OBShell>
  );
}

// ============================================================
// 04 — Forgot password
// Two stages: input email → confirmation.
// ============================================================
function OBForgot({ variant = 'desktop', onBack, onDone }) {
  const isMobile = variant === 'mobile';
  const [email, setEmail] = useOB('');
  const [error, setError] = useOB('');
  const [stage, setStage] = useOB('input'); // 'input' | 'sent'
  const [submitting, setSubmitting] = useOB(false);

  function submit(ev) {
    ev && ev.preventDefault && ev.preventDefault();
    if (!email.trim()) return setError('We\u2019ll need an email to find you.');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('That doesn\u2019t look like an email.');
    setError('');
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setStage('sent');
    }, 700);
  }

  return (
    <OBShell variant={variant} screenLabel="04 Forgot" showBack onBack={onBack}>
      <div style={{
        maxWidth: isMobile ? '100%' : 460,
        width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center'
      }}>
        {stage === 'input' ? (
          <>
            <OBSectionLabel>Recover access</OBSectionLabel>
            <h1 style={{
              margin: '18px 0 0 0',
              fontFamily: OB.fontBody, fontStyle: 'italic',
              fontWeight: 400,
              fontSize: isMobile ? 32 : 44,
              lineHeight: 1.15,
              letterSpacing: '-0.01em',
              color: OB.ink,
              textWrap: 'balance'
            }}>Let&rsquo;s find you.</h1>
            <p style={{
              margin: '14px 0 0 0',
              fontFamily: OB.fontBody, fontWeight: 400,
              fontSize: isMobile ? 17 : 19, lineHeight: 1.65,
              color: OB.warmMid,
              maxWidth: 380,
              textWrap: 'pretty'
            }}>Tell us the email you used to sign up. We&rsquo;ll send a link to set a new password.</p>

            <form onSubmit={submit} style={{
              marginTop: isMobile ? 32 : 40,
              width: '100%',
              display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <OBField label="Email" type="email" placeholder="you@example.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                error={error} autoComplete="email" autoFocus />
              <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
                <OBPrimaryButton onClick={submit} loading={submitting} fullWidth>
                  {submitting ? 'Sending…' : 'Send me a link'}
                </OBPrimaryButton>
                <OBGhostLink onClick={onBack} fontSize={12}>I remembered it</OBGhostLink>
              </div>
            </form>
          </>
        ) : (
          <>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: OB.sageTint, border: `0.5px solid ${OB.sage}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: OB.sage, marginBottom: 24
            }}>
              <OBCheckIcon size={28} color={OB.sage} />
            </div>
            <OBSectionLabel>Sent</OBSectionLabel>
            <h2 style={{
              margin: '18px 0 0 0',
              fontFamily: OB.fontBody, fontStyle: 'italic',
              fontWeight: 400,
              fontSize: isMobile ? 30 : 40,
              lineHeight: 1.2,
              letterSpacing: '-0.005em',
              color: OB.ink
            }}>Check your inbox.</h2>
            <p style={{
              margin: '18px 0 0 0',
              fontFamily: OB.fontBody, fontWeight: 400,
              fontSize: isMobile ? 17 : 18, lineHeight: 1.7,
              color: OB.inkSoft,
              maxWidth: 380,
              textWrap: 'pretty'
            }}>We&rsquo;ve sent a link to <strong style={{
              fontFamily: OB.fontUI, fontWeight: 500, fontSize: 14,
              letterSpacing: '0.01em', color: OB.ink
            }}>{email}</strong>. It&rsquo;ll only work for the next hour.</p>
            <p style={{
              margin: '20px 0 0 0',
              fontFamily: OB.fontUI, fontWeight: 400, fontSize: 12,
              letterSpacing: '0.02em',
              color: OB.warmMid
            }}>Didn&rsquo;t arrive?{' '}
              <OBGhostLink onClick={() => setStage('input')} fontSize={12}>Try another email</OBGhostLink>
            </p>
            <div style={{
              marginTop: isMobile ? 36 : 48,
              width: isMobile ? '100%' : 'auto'
            }}>
              <OBSecondaryButton onClick={onDone} fullWidth={isMobile}>Back to sign in</OBSecondaryButton>
            </div>
          </>
        )}
      </div>
    </OBShell>
  );
}

// ============================================================
// Demo wiring — each artboard hosts its own screen instance with
// no-op handlers so the flows render statically for review.
// (In production, these screens are stitched into the post-signup
// route with real callbacks.)
// ============================================================
function OBWelcomeArtboard({ variant }) {
  return <OBWelcome variant={variant} name="Sarah" onContinue={() => {}} />;
}
function OBBeginArtboard({ variant }) {
  return <OBBegin variant={variant} initialGiven="Sarah" onSave={() => {}} onBack={() => {}} />;
}
function OBSuccessArtboard({ variant }) {
  return <OBSuccess variant={variant} name="Sarah" onContinue={() => {}} />;
}
function OBForgotArtboard({ variant }) {
  return <OBForgot variant={variant} onBack={() => {}} onDone={() => {}} />;
}

Object.assign(window, {
  OB,
  OBWelcome, OBBegin, OBSuccess, OBForgot,
  OBWelcomeArtboard, OBBeginArtboard, OBSuccessArtboard, OBForgotArtboard
});
