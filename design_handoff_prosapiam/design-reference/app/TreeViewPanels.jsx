// TreeViewPanels.jsx — detail panel (desktop) and bottom sheet (mobile) for S3.
// Both use the approved P03 Person Summary Card; no restyling.

const { useState: useTVPanel } = React;

// -------------------------------------------------------------------------
// Detail panel — right edge, 320px wide.
// Contents: vertical summary card · two ghost action links · compact list of relationships.
// -------------------------------------------------------------------------
function TVDetailPanel({
  person,                  // { name, photo, status, birthYear, deathYear, relationshipContext }
  relationships = [],      // [{ name, photo, status, birthYear, deathYear, relationship }]
  onClose,
}) {
  const dates = person.status === 'deceased'
    ? `${person.birthYear} – ${person.deathYear}`
    : `b. ${person.birthYear}`;

  return (
    <aside
      data-screen-label="S3 Detail panel · Margaret Walsh"
      style={{
        width: 320, height: '100%',
        background: '#F7F4EE',
        borderLeft: '0.5px solid #D6CFC4',
        display: 'flex', flexDirection: 'column',
        position: 'relative',
        flexShrink: 0,
        fontFamily: 'var(--font-ui)',
      }}>
      {/* Close button */}
      <button type="button" aria-label="Close detail panel" onClick={onClose}
        style={{
          position: 'absolute', top: 14, right: 14,
          width: 28, height: 28, borderRadius: 4,
          background: 'transparent', border: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 2,
        }}>
        <TVIcon name="close" size={16} color="#7A6F63" />
      </button>

      {/* Scroll body */}
      <div style={{
        padding: '24px 20px 24px 20px',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        gap: 16,
      }}>
        {/* Vertical P03 summary card — large avatar */}
        <div style={{
          background: '#EDE8E0',
          border: '0.5px solid #D6CFC4',
          borderRadius: 10,
          padding: 20,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
          textAlign: 'center',
        }}>
          <PSCAvatar
            name={person.name}
            photo={person.photo}
            status={person.status}
            size={64}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center' }}>
            <span style={{
              fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 17,
              color: '#1C1A17', letterSpacing: '-0.005em', lineHeight: 1.25,
            }}>{person.name}</span>
            <span style={{
              fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 12,
              color: '#7A6F63', letterSpacing: '0.02em',
            }}>{dates}</span>
          </div>
          <PSCBadge tone={person.status === 'deceased' ? 'terra' : 'sage'}>
            {person.status === 'deceased' ? 'Deceased' : 'Living'}
          </PSCBadge>
          {person.relationshipContext && (
            <span style={{
              fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 12,
              color: '#7A6F63', letterSpacing: '0.01em', marginTop: 2,
              fontStyle: 'italic',
            }}>{person.relationshipContext}</span>
          )}
        </div>

        {/* Action links — Ghost. Gap --space-4 (16px). */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 4px' }}>
          <a href="#" onClick={e => e.preventDefault()} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 13,
            color: '#1C1A17', textDecoration: 'none',
            letterSpacing: '0.005em',
          }}>
            <TVIcon name="arrowRight" size={14} color="#1C1A17" />
            View full profile
          </a>
          <a href="#" onClick={e => e.preventDefault()} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 13,
            color: '#1C1A17', textDecoration: 'none',
            letterSpacing: '0.005em',
          }}>
            <TVIcon name="plus" size={14} color="#1C1A17" />
            Add a memory
          </a>
        </div>

        <div style={{ height: 1, background: '#D6CFC4', opacity: 0.7, margin: '4px 0' }} />

        {/* Relationships heading */}
        <div style={{
          fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 10,
          letterSpacing: '0.16em', textTransform: 'uppercase',
          color: '#7A6F63', padding: '0 4px',
        }}>Direct relationships</div>

        {/* Compact list of 3 compact cards — no chevron */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {relationships.map((r, i) => (
            <PersonSummaryCard
              key={i}
              name={r.name}
              photo={r.photo}
              status={r.status}
              birthYear={r.birthYear}
              deathYear={r.deathYear}
              relationship={r.relationship}
              variant="compact"
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

// -------------------------------------------------------------------------
// Mobile bottom sheet — 50% of screen height.
// Drag handle + horizontal summary card + two full-width buttons.
// -------------------------------------------------------------------------
function TVMobileBottomSheet({
  person,
  height = 420,
}) {
  const dates = person.status === 'deceased'
    ? `${person.birthYear} – ${person.deathYear}`
    : `b. ${person.birthYear}`;

  return (
    <div
      data-screen-label="S3 Bottom sheet · Margaret Walsh"
      style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        height,
        background: '#F7F4EE',
        borderTop: '0.5px solid #D6CFC4',
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        display: 'flex', flexDirection: 'column',
        fontFamily: 'var(--font-ui)',
        zIndex: 5,
      }}>
      {/* Drag handle */}
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 8, paddingBottom: 4 }}>
        <span aria-hidden="true" style={{
          width: 32, height: 4, borderRadius: 9999, background: '#C4B9A8',
        }} />
      </div>

      <div style={{ padding: '12px 20px 20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Horizontal P03 summary — static, 48 avatar */}
        <PersonSummaryCard
          name={person.name}
          photo={person.photo}
          status={person.status}
          birthYear={person.birthYear}
          deathYear={person.deathYear}
          relationship={null}
          showStatus={true}
          variant="static"
        />

        {/* Two full-width buttons. Gap 12px. */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button type="button" style={{
            height: 48, width: '100%',
            background: '#5A6B5C', color: '#F7F4EE',
            border: 'none', borderRadius: 4,
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 14,
            cursor: 'pointer', letterSpacing: '0.005em',
          }}>View full profile</button>
          <button type="button" style={{
            height: 48, width: '100%',
            background: 'transparent', color: '#1C1A17',
            border: '0.5px solid #D6CFC4', borderRadius: 4,
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 14,
            cursor: 'pointer', letterSpacing: '0.005em',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <TVIcon name="plus" size={14} color="#1C1A17" />
            Add a memory
          </button>
        </div>

        {/* A few quick stats — three little relationship cells.
            Static, compact — gives the sheet body. */}
        <div style={{
          marginTop: 4,
          display: 'flex', flexDirection: 'column', gap: 6,
        }}>
          <div style={{
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 10,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            color: '#7A6F63', padding: '0 4px',
          }}>Direct family</div>
          <div style={{
            display: 'flex', flexDirection: 'column',
            border: '0.5px solid #D6CFC4', borderRadius: 6,
            background: '#EDE8E0',
            overflow: 'hidden',
          }}>
            {[
              { label: 'Spouse', name: 'Thomas Walsh', meta: '1938 – 2009' },
              { label: 'Children', name: 'Aoife, Ciarán, Siobhán', meta: '3 living' },
            ].map((row, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'baseline', gap: 12,
                padding: '10px 14px',
                borderTop: i === 0 ? 'none' : '0.5px solid #D6CFC4',
              }}>
                <span style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 10,
                  letterSpacing: '0.12em', textTransform: 'uppercase',
                  color: '#7A6F63', width: 64, flexShrink: 0,
                }}>{row.label}</span>
                <span style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 13,
                  color: '#1C1A17', letterSpacing: '-0.005em',
                  flex: 1, minWidth: 0,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>{row.name}</span>
                <span style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 11,
                  color: '#7A6F63', flexShrink: 0,
                }}>{row.meta}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Mobile floating zoom toolbar — bottom-left cluster.
// -------------------------------------------------------------------------
function TVMobileZoomCluster({ left = 16, bottom = 16 }) {
  return (
    <div style={{
      position: 'absolute',
      left, bottom,
      display: 'flex', flexDirection: 'row', alignItems: 'center',
      background: 'rgba(237,232,224,0.92)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)',
      border: '0.5px solid #D6CFC4',
      borderRadius: 6,
      padding: 4,
      gap: 0,
      zIndex: 4,
    }}>
      <TVIconButton icon="zoomOut" label="Zoom out" />
      <span style={{ width: 0.5, alignSelf: 'stretch', background: '#D6CFC4', margin: '6px 0' }} />
      <TVIconButton icon="zoomIn" label="Zoom in" />
      <span style={{ width: 0.5, alignSelf: 'stretch', background: '#D6CFC4', margin: '6px 0' }} />
      <TVIconButton icon="fitScreen" label="Fit to screen" />
    </div>
  );
}

// -------------------------------------------------------------------------
// Mobile top bar — 48px, Parchment.
// Back · "Family Tree" · search + add icons.
// -------------------------------------------------------------------------
function TVMobileTopBar() {
  return (
    <div style={{
      height: 48,
      background: '#F7F4EE',
      borderBottom: '0.5px solid #D6CFC4',
      display: 'flex', alignItems: 'center',
      padding: '0 8px',
      fontFamily: 'var(--font-ui)',
      flexShrink: 0,
      zIndex: 2,
    }}>
      <button type="button" aria-label="Back to Dashboard"
        style={{
          width: 36, height: 36, borderRadius: 4,
          background: 'transparent', border: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
        }}>
        <TVIcon name="back" size={16} color="#1C1A17" />
      </button>
      <div style={{ flex: 1, textAlign: 'center' }}>
        <span style={{
          fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 13,
          color: '#1C1A17', letterSpacing: '0.005em',
        }}>Family Tree</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <button type="button" aria-label="Search"
          style={{
            width: 36, height: 36, borderRadius: 4,
            background: 'transparent', border: 'none',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
          <TVIcon name="search" size={16} color="#1C1A17" />
        </button>
        <button type="button" aria-label="Add person"
          style={{
            width: 36, height: 36, borderRadius: 4,
            background: 'transparent', border: 'none',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}>
          <TVIcon name="plus" size={16} color="#1C1A17" />
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// Mobile bottom navigation — 56px + safe area inset, Ink.
// 4 tabs: Home · Tree (active) · Memories · Profile.
// -------------------------------------------------------------------------
function TVMobileBottomNav({ active = 'tree', safeArea = 24 }) {
  const tabs = [
    { id: 'home',     label: 'Home',     icon: 'home' },
    { id: 'tree',     label: 'Tree',     icon: 'tree' },
    { id: 'memories', label: 'Memories', icon: 'memories' },
    { id: 'profile',  label: 'Profile',  icon: 'profile' },
  ];

  return (
    <div style={{
      height: 56 + safeArea,
      paddingBottom: safeArea,
      background: '#1C1A17',
      display: 'flex',
      borderTop: '0.5px solid rgba(247,244,238,0.06)',
      flexShrink: 0,
      zIndex: 6,
      position: 'relative',
    }}>
      {tabs.map(t => {
        const isActive = t.id === active;
        return (
          <button key={t.id} type="button"
            style={{
              flex: 1,
              background: 'transparent', border: 'none', cursor: 'pointer',
              display: 'inline-flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: 4, padding: '8px 0 0 0',
              position: 'relative',
              fontFamily: 'var(--font-ui)',
            }}>
            {isActive && (
              <span aria-hidden="true" style={{
                position: 'absolute', top: 0, left: '50%',
                transform: 'translateX(-50%)',
                width: 24, height: 2, background: '#8C7355',
              }} />
            )}
            <TVIcon name={t.icon} size={20} color={isActive ? '#F7F4EE' : '#7A6F63'} />
            <span style={{
              fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: 11,
              color: isActive ? '#F7F4EE' : '#7A6F63',
              letterSpacing: '0.02em',
            }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  TVDetailPanel, TVMobileBottomSheet, TVMobileZoomCluster, TVMobileTopBar, TVMobileBottomNav,
});
