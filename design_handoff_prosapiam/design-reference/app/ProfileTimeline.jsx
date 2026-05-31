// ProfileTimeline.jsx — P11 Profile Timeline / Memory List
// Per Component Library Brief, Page Architecture Brief, Design System v1.1.
//
// Typography substitution note (per Design System v1.1):
//   The brief calls for Avenir Next + Adobe Caslon Pro. The system in this
//   project uses Plus Jakarta Sans (UI face) and Cormorant Garamond (story
//   face). All weights, sizes, casing, spacing, and layout rules from the P11
//   brief are honored exactly.
//
// Anatomy (top → bottom):
//   Toolbar row  (sort left · filter right) — sits on Parchment, no surface
//   Year divider (with label, "1974")  — Divider component, with-label variant
//   P05 Memory cards — stacked, 24px gap, Standard or Featured
//   Year divider ("1981")
//   P05 cards
//   "Add a memory for [first name]" — Ghost link
//
// Variants exposed in this build:
//   • Populated   — two year groups, Featured first card under second group
//   • Empty       — Caslon italic line + Primary CTA
//   • Load more   — Ghost "Load more memories" below last card
//
// MemoryCard (P05) is loaded from MemoryCard.jsx (window.MemoryCard).
// The Divider — "with label" variant — is rendered inline by YearDivider here,
// using the same hairline + label vocabulary as DividerLabel in atoms.jsx.

const { useState: useTL } = React;

// ---- Lucide-style icons used by toolbar + load-more spinner ----
function TLIcon({ name, size = 14, color = 'currentColor', strokeWidth = 1.5, style = {} }) {
  const c = {
    width: size, height: size, viewBox: '0 0 24 24', fill: 'none',
    stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style,
  };
  switch (name) {
    case 'chevron-down': return (<svg {...c}><path d="M6 9l6 6 6-6" /></svg>);
    case 'chevron-up':   return (<svg {...c}><path d="M6 15l6-6 6 6" /></svg>);
    case 'filter':       return (<svg {...c}><path d="M3 5h18l-7 9v6l-4-2v-4z" /></svg>);
    case 'plus':         return (<svg {...c}><path d="M12 5v14M5 12h14" /></svg>);
    case 'check':        return (<svg {...c}><path d="M5 12l5 5L20 7" /></svg>);
    default: return null;
  }
}

// =============================================================
// Toolbar — sort (left) + filter (right). Lives directly on Parchment.
// No background, no border, no card container.
// =============================================================
function TimelineToolbar({
  sort = 'newest',           // 'newest' | 'oldest'
  onSortChange,
  activeFilters = [],        // string[]
  onFiltersChange,
}) {
  const [sortOpen, setSortOpen]     = useTL(false);
  const [filterOpen, setFilterOpen] = useTL(false);
  const [hoverSort, setHoverSort]     = useTL(false);
  const [hoverFilter, setHoverFilter] = useTL(false);

  const FILTER_TAGS = [
    'Childhood', 'Migration', 'Family gathering',
    'Wartime generation', 'Garden', 'Work',
  ];

  const sortLabel = sort === 'newest' ? 'Newest first' : 'Oldest first';

  const ghostBtn = (extra = {}) => ({
    display: 'inline-flex', alignItems: 'center', gap: 8,
    background: 'transparent', border: 'none', padding: '6px 8px',
    fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 13,
    color: '#7A6F63', cursor: 'pointer', borderRadius: 2,
    transition: 'opacity 150ms cubic-bezier(.22,1,.36,1), color 150ms cubic-bezier(.22,1,.36,1)',
    WebkitTapHighlightColor: 'transparent',
    ...extra,
  });

  // ---- Floating menu (sort) ----
  const sortMenu = (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)', left: 0,
      minWidth: 180, padding: 6,
      background: '#F7F4EE',
      border: '0.5px solid #D6CFC4',
      borderRadius: 6,
      boxShadow: '0 4px 16px rgba(28,26,23,0.10), 0 1px 4px rgba(28,26,23,0.06)',
      zIndex: 5,
    }}>
      {[
        { id: 'newest', label: 'Newest first' },
        { id: 'oldest', label: 'Oldest first' },
      ].map(opt => {
        const active = sort === opt.id;
        return (
          <button key={opt.id} type="button"
            onClick={() => { onSortChange && onSortChange(opt.id); setSortOpen(false); }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '8px 10px', borderRadius: 4,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-ui)', fontWeight: active ? 500 : 400,
              fontSize: 13, color: active ? '#1C1A17' : '#3D3A35',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#EDE8E0'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>{opt.label}</span>
            {active && <TLIcon name="check" size={14} color="#8C7355" />}
          </button>
        );
      })}
    </div>
  );

  const toggleFilter = (tag) => {
    const has = activeFilters.includes(tag);
    const next = has ? activeFilters.filter(t => t !== tag) : [...activeFilters, tag];
    onFiltersChange && onFiltersChange(next);
  };

  const filterMenu = (
    <div style={{
      position: 'absolute', top: 'calc(100% + 6px)', right: 0,
      minWidth: 220, padding: 6,
      background: '#F7F4EE',
      border: '0.5px solid #D6CFC4',
      borderRadius: 6,
      boxShadow: '0 4px 16px rgba(28,26,23,0.10), 0 1px 4px rgba(28,26,23,0.06)',
      zIndex: 5,
    }}>
      <div style={{
        padding: '6px 10px 8px',
        fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 10,
        letterSpacing: '0.10em', textTransform: 'uppercase', color: '#7A6F63',
      }}>Filter by category</div>
      {FILTER_TAGS.map(tag => {
        const on = activeFilters.includes(tag);
        return (
          <button key={tag} type="button" onClick={() => toggleFilter(tag)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '8px 10px', borderRadius: 4,
              background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: 'var(--font-ui)', fontWeight: on ? 500 : 400,
              fontSize: 13, color: on ? '#1C1A17' : '#3D3A35',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#EDE8E0'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <span>{tag}</span>
            {on && <TLIcon name="check" size={14} color="#8C7355" />}
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      width: '100%', padding: 0, background: 'transparent', border: 'none',
    }}>
      {/* Sort (left) */}
      <div style={{ position: 'relative' }}>
        <button type="button"
          onMouseEnter={() => setHoverSort(true)}
          onMouseLeave={() => setHoverSort(false)}
          onClick={() => { setSortOpen(o => !o); setFilterOpen(false); }}
          style={ghostBtn({ opacity: hoverSort ? 0.7 : 1, color: sortOpen ? '#1C1A17' : '#7A6F63' })}
          aria-haspopup="listbox" aria-expanded={sortOpen}
        >
          <span>{sortLabel}</span>
          <TLIcon name={sortOpen ? 'chevron-up' : 'chevron-down'} size={12} />
        </button>
        {sortOpen && sortMenu}
      </div>

      {/* Filter (right) */}
      <div style={{ position: 'relative' }}>
        <button type="button"
          onMouseEnter={() => setHoverFilter(true)}
          onMouseLeave={() => setHoverFilter(false)}
          onClick={() => { setFilterOpen(o => !o); setSortOpen(false); }}
          style={ghostBtn({
            opacity: hoverFilter ? 0.7 : 1,
            color: (filterOpen || activeFilters.length) ? '#1C1A17' : '#7A6F63',
          })}
          aria-haspopup="menu" aria-expanded={filterOpen}
        >
          <TLIcon name="filter" size={16} />
          <span>
            Filter by category
            {activeFilters.length > 0 && (
              <span style={{
                marginLeft: 6, fontWeight: 500, color: '#8C7355',
              }}>· {activeFilters.length}</span>
            )}
          </span>
        </button>
        {filterOpen && filterMenu}
      </div>
    </div>
  );
}

// =============================================================
// YearDivider — Divider, "with label" variant.
// Hairline rule (0.5px #D6CFC4) on each side, year centered inline.
// Label: 11px Plus Jakarta 500, ALL CAPS, 0.10em tracking, Warm-Mid.
// 16px horizontal padding from rule on each side.
// 32px above / 24px below.
// =============================================================
function YearDivider({ year }) {
  return (
    <div
      role="separator"
      aria-label={`Year ${year}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 0,
        margin: '32px 0 24px 0',
      }}
    >
      <span style={{ flex: 1, height: 0.5, background: '#D6CFC4' }} />
      <span style={{
        padding: '0 16px',
        fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 11,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        color: '#7A6F63', whiteSpace: 'nowrap',
      }}>{year}</span>
      <span style={{ flex: 1, height: 0.5, background: '#D6CFC4' }} />
    </div>
  );
}

// =============================================================
// LoadMoreButton — Ghost button, centered, 13px Plus Jakarta 400.
// Loading state: label replaced by a 16px Ink spinner.
// =============================================================
function LoadMoreButton({ loading = false, onClick }) {
  const [hover, setHover] = useTL(false);
  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      paddingTop: 32, paddingBottom: 8,
    }}>
      <button type="button"
        onClick={loading ? undefined : onClick}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        aria-busy={loading}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          minWidth: 200, height: 40, padding: '0 18px',
          background: 'transparent', border: 'none',
          fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 13,
          color: '#3D3A35', cursor: loading ? 'default' : 'pointer',
          opacity: hover && !loading ? 0.7 : 1,
          transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
          textDecoration: 'underline', textUnderlineOffset: 3,
          textDecorationThickness: '0.5px', textDecorationColor: '#C4B9A8',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {loading ? (
          <span style={{
            width: 16, height: 16, borderRadius: '50%',
            border: '1.5px solid #1C1A17', borderTopColor: 'transparent',
            animation: 'mnSpin 700ms linear infinite',
          }} />
        ) : (
          <span>Load more memories</span>
        )}
      </button>
    </div>
  );
}

// =============================================================
// AddMemoryGhostLink — desktop end-of-list ghost link.
// "Add a memory for [first name]" — Plus Jakarta 13px 400, Ink, underline 3px.
// =============================================================
function AddMemoryGhostLink({ firstName }) {
  const [hover, setHover] = useTL(false);
  return (
    <div style={{
      display: 'flex', justifyContent: 'flex-start',
      paddingTop: 32, paddingBottom: 8,
    }}>
      <a href="#"
        onClick={(e) => e.preventDefault()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 13,
          color: '#1C1A17',
          textDecoration: 'underline', textUnderlineOffset: 3,
          textDecorationThickness: '0.5px', textDecorationColor: '#C4B9A8',
          opacity: hover ? 0.7 : 1,
          transition: 'opacity 150ms cubic-bezier(.22,1,.36,1)',
        }}
      >
        <TLIcon name="plus" size={14} />
        <span>Add a memory for {firstName}</span>
      </a>
    </div>
  );
}

// =============================================================
// EmptyState — replaces the entire timeline. Centered.
// Single Caslon italic line + Primary CTA button.
// =============================================================
function TimelineEmptyState({ firstName = 'Margaret' }) {
  const [hover, setHover] = useTL(false);
  const [pressed, setPressed] = useTL(false);
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center',
      gap: 28, padding: '96px 24px',
      minHeight: 380,
    }}>
      <p style={{
        margin: 0,
        fontFamily: 'var(--font-body)',  // Cormorant — the single Caslon moment
        fontStyle: 'italic',
        fontWeight: 400,
        fontSize: 17,
        lineHeight: 1.6,
        color: '#7A6F63',
        maxWidth: 420,
      }}>
        No memories have been added yet.
      </p>
      <button type="button"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => { setHover(false); setPressed(false); }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          height: 44, padding: '0 24px',
          background: '#8C7355', color: '#F7F4EE',
          border: 'none', borderRadius: 4,
          fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 14,
          letterSpacing: 0.1, cursor: 'pointer',
          opacity: hover ? 0.85 : 1,
          transform: pressed ? 'scale(0.98)' : 'scale(1)',
          transition: 'opacity 150ms cubic-bezier(.22,1,.36,1), transform 100ms cubic-bezier(.22,1,.36,1)',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        <TLIcon name="plus" size={14} />
        <span>Add the first memory</span>
      </button>
    </div>
  );
}

// =============================================================
// ProfileTimeline — the P11 component itself.
//   props:
//     firstName     — used by ghost link + empty CTA
//     groups        — [{ year, items: [{ ...P05 props, variant }] }]
//     state         — 'populated' | 'empty' | 'loadmore'
//     loading       — boolean (load-more spinner)
//     defaultSort   — 'newest' | 'oldest'
// =============================================================
function ProfileTimeline({
  firstName = 'Margaret',
  groups = [],
  state = 'populated',     // 'populated' | 'empty' | 'loadmore'
  loading = false,
  defaultSort = 'newest',
  onLoadMore,
}) {
  const [sort, setSort] = useTL(defaultSort);
  const [filters, setFilters] = useTL([]);

  if (state === 'empty') {
    // Empty state replaces the entire timeline content.
    return (
      <div style={{ width: '100%' }}>
        <TimelineEmptyState firstName={firstName} />
      </div>
    );
  }

  const ordered = sort === 'oldest'
    ? [...groups].sort((a, b) => Number(a.year) - Number(b.year))
    : [...groups].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <div style={{ width: '100%' }}>
      {/* Toolbar row — sits on Parchment */}
      <TimelineToolbar
        sort={sort} onSortChange={setSort}
        activeFilters={filters} onFiltersChange={setFilters}
      />

      {/* Year groups */}
      {ordered.map((group) => (
        <React.Fragment key={group.year}>
          <YearDivider year={group.year} />
          <div style={{
            display: 'flex', flexDirection: 'column', gap: 24,
          }}>
            {group.items.map((item, i) => (
              <MemoryCard
                key={`${group.year}-${i}`}
                date={item.date}
                title={item.title}
                excerpt={item.excerpt}
                media={item.media}
                mediaAspect={item.mediaAspect}
                author={item.author}
                timestamp={item.timestamp}
                tags={item.tags}
                variant={item.variant || 'standard'}
              />
            ))}
          </div>
        </React.Fragment>
      ))}

      {/* Load more */}
      {state === 'loadmore' && (
        <LoadMoreButton loading={loading} onClick={onLoadMore} />
      )}

      {/* End-of-list ghost link (desktop) */}
      {state !== 'loadmore' && (
        <AddMemoryGhostLink firstName={firstName} />
      )}
    </div>
  );
}

Object.assign(window, {
  ProfileTimeline,
  TimelineToolbar,
  YearDivider,
  TimelineEmptyState,
  LoadMoreButton,
  AddMemoryGhostLink,
});
