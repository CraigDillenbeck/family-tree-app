<script lang="ts">
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Badge from '$lib/components/ui/Badge.svelte'

  export type TreePerson = {
    id: string
    firstName: string
    lastName?: string | null
    birthDate?: string | null
    deathDate?: string | null
    avatarUrl?: string | null
    isLiving: boolean
  }

  let {
    person,
    zoom = 1,
    selected = false,
    viewing = false,
    relationshipLabel,
    onclick,
    ondblclick,
  }: {
    person: TreePerson
    /** XYFlow viewport zoom level — controls which render tier shows */
    zoom?: number
    selected?: boolean
    /** true when this person's profile page is currently open */
    viewing?: boolean
    relationshipLabel?: string
    onclick?: () => void
    ondblclick?: () => void
  } = $props()

  // Zoom tiers per spec
  const isFull    = $derived(zoom >= 0.85)   // avatar + name + dates + optional badge
  const isMedium  = $derived(zoom >= 0.60 && zoom < 0.85)  // avatar + name
  const isCompact = $derived(zoom >= 0.25 && zoom < 0.60)  // avatar chip only
  const isDot     = $derived(zoom < 0.25)                  // 8px circle

  const fullName = $derived([person.firstName, person.lastName].filter(Boolean).join(' '))

  function formatTreeDates(p: TreePerson): string {
    const birthYear = p.birthDate ? new Date(p.birthDate + 'T00:00:00').getFullYear() : null
    const deathYear = p.deathDate ? new Date(p.deathDate + 'T00:00:00').getFullYear() : null
    if (birthYear && deathYear) return `${birthYear}–${deathYear}`
    if (birthYear) return `b. ${birthYear}`
    return ''
  }

  const dateLine = $derived(formatTreeDates(person))

  // Avatar sizes per zoom tier
  const avatarSize = $derived(isFull ? 48 : isMedium ? 32 : 24)

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onclick?.() }
  }
</script>

{#if isDot}
  <!-- 25% zoom: render as a positioned dot only -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="dot"
    title={fullName}
    onclick={onclick}
  ></div>
{:else}
  <div
    class="node"
    class:selected
    class:viewing
    class:full={isFull}
    class:medium={isMedium}
    class:compact={isCompact}
    role="button"
    tabindex="0"
    aria-label="{fullName}{dateLine ? ', ' + dateLine : ''}"
    aria-pressed={selected}
    onclick={onclick}
    ondblclick={ondblclick}
    onkeydown={handleKeydown}
  >
    {#if viewing}
      <div class="viewing-bar" aria-hidden="true"></div>
    {/if}

    <div class="avatar-wrap">
      <Avatar
        person={{
          given: person.firstName,
          family: person.lastName ?? undefined,
          avatarUrl: person.avatarUrl,
          status: person.isLiving ? 'living' : 'deceased',
        }}
        size={avatarSize}
      />
    </div>

    {#if isFull || isMedium}
      <p class="node-name">{fullName}</p>
    {/if}

    {#if isFull && dateLine}
      <p class="node-dates">{dateLine}</p>
    {/if}

    {#if isFull && relationshipLabel}
      <div class="rel-badge">
        <Badge variant="warm">{relationshipLabel}</Badge>
      </div>
    {/if}
  </div>
{/if}

<style>
  /* ── Dot (< 25% zoom) ── */
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--color-warm-mid);
    cursor: pointer;
  }

  /* ── Node ── */
  .node {
    position: relative;
    width: 160px;
    min-height: 100px;
    background: var(--color-bg-page);
    border: var(--border-default);
    border-radius: var(--radius-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-3) var(--space-3) var(--space-4);
    gap: var(--space-1);
    cursor: pointer;
    /* 44px minimum touch target — enforced via min-height + padding */
    min-height: 44px;
    transition:
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);
  }

  .node:hover {
    background: var(--color-bg-surface-1);
    border: var(--border-strong);
  }

  .node:focus-visible {
    outline: 2px solid var(--color-ink);
    outline-offset: 2px;
  }

  /* ── Selected state ── */
  .node.selected {
    border: 0.5px solid var(--color-border-active);
    background: var(--color-bg-surface-1);
  }

  /* ── Currently viewing state: gold border + left accent ── */
  .node.viewing {
    border: 1px solid var(--color-border-active);
    background: var(--color-bg-surface-1);
  }

  .viewing-bar {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--color-gold);
    border-radius: var(--radius-md) 0 0 var(--radius-md);
  }

  /* ── Compact: just avatar, smaller padding ── */
  .node.compact {
    min-height: 44px;
    padding: var(--space-2);
    width: auto;
    min-width: 44px;
  }

  .avatar-wrap {
    flex-shrink: 0;
  }

  .node-name {
    margin: var(--space-1) 0 0;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-heading);
    color: var(--color-ink);
    text-align: center;
    max-width: 140px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .node-dates {
    margin: 0;
    font-family: var(--font-ui);
    font-size: var(--font-size-meta);
    font-weight: var(--font-weight-regular);
    color: var(--color-warm-mid);
    text-align: center;
  }

  .rel-badge {
    margin-top: var(--space-1);
  }
</style>
