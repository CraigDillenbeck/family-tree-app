// MemoryCard.jsx — P05 Memory / Story Card component
// Per Component Library Brief, Page Architecture Brief, Design System v1.1.
//
// Typography substitution note:
//   The brief calls for Avenir Next + Adobe Caslon Pro. The design system in
//   this project is built on Plus Jakarta Sans (UI face, replacing Avenir Next)
//   and Cormorant Garamond (story face, replacing Adobe Caslon Pro). All
//   weights, sizes, line-heights, casing, and spacing rules are honored exactly.
//
// Anatomy (top → bottom):
//   [media?]  date label  ·  title  ·  story excerpt (Cormorant)
//             author row (avatar + name | timestamp)
//             tags row?
//
// Variants: standard · with-media · featured · compact

const { useState: useMC } = React;

// --- Lucide-style icons used in this card ---
function MCIcon({ name, size = 14, color = 'currentColor', strokeWidth = 1.5, style = {} }) {
  const common = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style,
  };
  switch (name) {
    case 'x':       return (<svg {...common}><path d="M6 6l12 12M18 6L6 18"/></svg>);
    case 'arrow':   return (<svg {...common}><path d="M5 12h14M13 6l6 6-6 6"/></svg>);
    default: return null;
  }
}

// ---- Avatar (xs / 24px) — photo or initials, deceased grayscale variant ----
function MCAvatar({ name, photo, status = 'living', size = 24 }) {
  const initials = (name || '·').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const fontSize = Math.round(size * 0.42);
  const isDeceased = status === 'deceased';
  const ring = '0.5px solid #D6CFC4';
  if (photo) {
    return (
      <span style={{
        width: size, height: size, borderRadius: '9999px', overflow: 'hidden',
        display: 'inline-block', background: '#E5DDD2', border: ring, flexShrink: 0,
      }}>
        <img src={photo} alt={name}
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
      letterSpacing: '0.02em', border: ring, flexShrink: 0,
    }}>{initials}</span>
  );
}

// ---- Tag — dismissible label chip, --radius-xs (2px) ----
function MCTag({ children, dismissible = true, onDismiss }) {
  const [hover, setHover] = useMC(false);
  return (
    <span
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        height: 22, padding: dismissible ? '0 6px 0 8px' : '0 8px',
        background: hover ? '#D9D0C4' : '#E5DDD2',
        border: '0.5px solid #D6CFC4',
        borderRadius: 2,
        fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 11,
        letterSpacing: '0.06em', color: '#3D3A35',
        transition: 'background 150ms cubic-bezier(.22,1,.36,1)',
        whiteSpace: 'nowrap',
      }}
    >
      <span>{children}</span>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          aria-label={`Remove ${children} tag`}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 14, height: 14, padding: 0,
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#7A6F63', borderRadius: 2,
          }}
        >
          <MCIcon name="x" size={11} />
        </button>
      )}
    </span>
  );
}

// ============================================================
// MemoryCard — P05
// ============================================================
function MemoryCard({
  date,                     // string — pre-formatted ("Summer 1967", "14 March 1982")
  title,                    // string — single-line headline
  excerpt,                  // string — story body, Cormorant Garamond
  media,                    // string|null — image URL; null = no media
  mediaAspect = '16:9',     // '16:9' | '4:3'
  author = {},              // { name, photo, status }
  timestamp,                // string — "3 days ago" / "Added June 2024"
  tags = [],                // string[]
  variant = 'standard',     // 'standard' | 'media' | 'featured' | 'compact'
  width,                    // optional fixed width
}) {
  const [hover, setHover] = useMC(false);
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';
  const hasMedia = !!media && variant !== 'compact';
  const excerptLineClamp = isCompact ? 2 : 4;

  // --- Card chrome ---
  const padBlock = isCompact ? 16 : 24;       // --space-4 vs --space-6
  const cardStyle = {
    background: hover ? '#D9D0C4' : '#EDE8E0', // surface-1 → surface-3 on hover
    border: isFeatured
      ? `1px solid #8C7355`                    // --border-featured (Gold)
      : (hover ? '0.5px solid #C4B9A8' : '0.5px solid #D6CFC4'),
    borderRadius: 10,                          // --radius-lg
    overflow: 'hidden',
    transition: 'background 150ms cubic-bezier(.22,1,.36,1), border-color 150ms cubic-bezier(.22,1,.36,1)',
    width: width || '100%',
    boxSizing: 'border-box',
    display: 'flex', flexDirection: 'column',
  };

  // --- Media thumbnail bleeds to top edge; bottom rounds to 0 so the card's
  // 10px radius continues unbroken ---
  const aspectPad = mediaAspect === '4:3' ? '75%' : '56.25%';

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={cardStyle}
    >
      {hasMedia && (
        <div
          aria-hidden="false"
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: aspectPad,
            background: '#E5DDD2',
            // Top corners only inherit card radius; bottom is sharp so the
            // body sits flush against the image edge.
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            overflow: 'hidden',
            // Hairline beneath image to separate from body when surfaces are close in tone
            borderBottom: '0.5px solid #D6CFC4',
          }}
        >
          <img
            src={media}
            alt=""
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%',
              objectFit: 'cover', display: 'block',
            }}
          />
        </div>
      )}

      <div
        style={{
          // --space-6 sides + bottom; same on top when no media; --space-6 top when no media
          padding: hasMedia
            ? `${padBlock}px ${padBlock}px ${padBlock}px ${padBlock}px`
            : `${padBlock}px`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Date label — 12px, Warm-Mid, ALL CAPS, --letter-spacing-label */}
        <div
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 400,
            fontSize: 12,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: '#7A6F63',
            lineHeight: 1.4,
          }}
        >{date}</div>

        {/* Memory title — 15px, weight 500, Ink, single line */}
        <h3
          style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 500,
            fontSize: 15,
            lineHeight: 1.4,
            color: '#1C1A17',
            margin: '6px 0 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            letterSpacing: '-0.005em',
          }}
        >{title}</h3>

        {/* Story excerpt — Cormorant Garamond, 17px, line-height 1.75, 3–4 lines.
            The single most important typographic moment in this component. */}
        {excerpt && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: 17,
              lineHeight: 1.75,
              color: '#3D3A35',
              margin: `${isCompact ? 10 : 14}px 0 0 0`,
              display: '-webkit-box',
              WebkitLineClamp: excerptLineClamp,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textWrap: 'pretty',
              // Natural fade on the last visible line
              maskImage: 'linear-gradient(to bottom, #000 80%, rgba(0,0,0,0.55) 100%)',
              WebkitMaskImage: 'linear-gradient(to bottom, #000 80%, rgba(0,0,0,0.55) 100%)',
            }}
          >{excerpt}</p>
        )}

        {/* Read-more ghost link — UI face, only on non-compact when text is clamped */}
        {!isCompact && excerpt && (
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            style={{
              alignSelf: 'flex-start',
              fontFamily: 'var(--font-ui)',
              fontWeight: 500,
              fontSize: 12,
              letterSpacing: '0.04em',
              color: '#3D3A35',
              textDecoration: 'underline',
              textUnderlineOffset: 3,
              textDecorationThickness: '0.5px',
              marginTop: 10,
              cursor: 'pointer',
              transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
            }}
          >Read more</a>
        )}

        {/* Author + timestamp row — flex space-between */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            marginTop: isCompact ? 14 : 20,
            paddingTop: isCompact ? 12 : 16,
            borderTop: '0.5px solid #D6CFC4',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <MCAvatar name={author.name} photo={author.photo} status={author.status} size={24} />
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 400,
                fontSize: 12,
                color: '#7A6F63',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >{author.name}</span>
          </span>
          {timestamp && (
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 400,
                fontSize: 11,
                color: '#7A6F63',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >{timestamp}</span>
          )}
        </div>

        {/* Tag row — only when tags exist and not compact */}
        {!isCompact && tags && tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: 14,
            }}
          >
            {tags.map((t, i) => (
              <MCTag key={i}>{t}</MCTag>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

Object.assign(window, { MemoryCard, MCAvatar, MCTag });
