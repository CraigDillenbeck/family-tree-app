// ------------------------------------------------------------------
// Tabs — In-page navigation between content sections.
// Used on the Person Profile Page (S4) to switch between
// Overview · Memories · Relationships · Media.
//
// Underline-only style. No background fill on any state.
// Active = Gold #8C7355 underline + Ink #1C1A17 text @ weight 500.
// Inactive = Warm-Mid #7A6F63 text @ weight 400, no underline.
// Hover = Ink-Soft #3D3A35 + 0.5px Warm-Light underline (150ms ease).
// Disabled = opacity 0.35, cursor not-allowed, no hover.
//
// Per design spec: typeface is Plus Jakarta Sans — the licensed UI face
// in this design system (substitution for Avenir Next, applied
// consistently across all components).
// ------------------------------------------------------------------

function Tabs({
  tabs,
  activeId,
  hoverId = null,            // forced hover state — for static demo only
  disabledIds = [],
  onChange = () => {},
}) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: 'var(--space-2)',           /* 8px between tabs */
        height: '44px',
        width: '100%',
        background: 'var(--color-bg-page)',
        borderBottom: 'var(--border-default)',  /* 0.5px #D6CFC4 — the structural baseline */
        padding: 0,
      }}
    >
      {tabs.map((t) => {
        const isActive   = t.id === activeId;
        const isDisabled = disabledIds.includes(t.id);
        const isHover    = hoverId === t.id && !isActive && !isDisabled;
        return (
          <TabItem
            key={t.id}
            label={t.label}
            active={isActive}
            hover={isHover}
            disabled={isDisabled}
            onClick={() => !isDisabled && !isActive && onChange(t.id)}
          />
        );
      })}
    </div>
  );
}

function TabItem({ label, active, hover, disabled, onClick }) {
  // Underline color/weight per state:
  //   active    → 2px solid Gold (#8C7355)
  //   hover     → 0.5px Warm-Light (--border-subtle equivalent visible swatch)
  //   default   → none (the container border-bottom is the ground)
  let borderBottom;
  if (active)      borderBottom = '2px solid #8C7355';
  else if (hover)  borderBottom = '0.5px solid #C4B9A8';
  else             borderBottom = '2px solid transparent';

  let color;
  if (active)      color = 'var(--color-text-primary)';     /* #1C1A17 */
  else if (hover)  color = 'var(--color-text-body)';        /* #3D3A35 */
  else             color = 'var(--color-text-secondary)';   /* #7A6F63 */

  const fontWeight = active ? 500 : 400;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onClick={onClick}
      style={{
        // reset
        background: 'transparent',
        border: 0,
        outline: 'none',
        // box
        height: '44px',
        padding: '0 var(--space-4)',     /* 16px horizontal */
        marginBottom: '-0.5px',           /* underline replaces the container border */
        display: 'inline-flex',
        alignItems: 'center',
        // type
        fontFamily: 'var(--font-ui)',
        fontWeight,
        fontSize: '13px',
        lineHeight: 1,
        letterSpacing: 0,
        color,
        // active indicator
        borderBottom,
        // interaction
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'color 150ms var(--ease), border-color 150ms var(--ease)',
        whiteSpace: 'nowrap',
        userSelect: 'none',
      }}
    >
      {label}
    </button>
  );
}

window.Tabs = Tabs;
window.TabItem = TabItem;
