<script lang="ts">
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Badge from '$lib/components/ui/Badge.svelte'
  import Button from '$lib/components/ui/Button.svelte'

  export type PersonSummary = {
    id: string
    firstName: string
    lastName?: string | null
    birthDate?: string | null
    deathDate?: string | null
    birth_place?: string | null
    avatarUrl?: string | null
    bio?: string | null
    isLiving: boolean
  }

  let {
    person,
    relationship,
    variant = 'horizontal',
    onviewprofile,
    onaddmemory,
  }: {
    person: PersonSummary
    /** e.g. 'Great-grandmother', 'Father' */
    relationship?: string
    variant?: 'horizontal' | 'vertical'
    onviewprofile?: () => void
    onaddmemory?: () => void
  } = $props()

  const fullName = $derived([person.firstName, person.lastName].filter(Boolean).join(' '))

  function formatDates(p: PersonSummary): string {
    const birthYear = p.birthDate ? new Date(p.birthDate + 'T00:00:00').getFullYear() : null
    const deathYear = p.deathDate ? new Date(p.deathDate + 'T00:00:00').getFullYear() : null
    if (!birthYear) return ''
    if (!p.isLiving && deathYear) return `Lived ${birthYear}–${deathYear}`
    const parts = [`b. ${birthYear}`]
    if (p.birth_place) parts.push(p.birth_place)
    return parts.join(', ')
  }

  const dateLine = $derived(formatDates(person))
</script>

<article class="card {variant}" aria-label={fullName}>
  <div class="avatar-col">
    <Avatar
      person={{
        given: person.firstName,
        family: person.lastName ?? undefined,
        avatarUrl: person.avatarUrl,
        status: person.isLiving ? 'living' : 'deceased',
      }}
      size={64}
    />
  </div>

  <div class="content">
    <div class="meta-row">
      <p class="name">{fullName}</p>
      {#if relationship}
        <Badge variant="warm">{relationship}</Badge>
      {/if}
    </div>

    {#if dateLine}
      <p class="dates">{dateLine}</p>
    {/if}

    {#if person.bio}
      <p class="bio">{person.bio}</p>
    {/if}

    {#if onviewprofile || onaddmemory}
      <div class="actions">
        {#if onviewprofile}
          <Button
            variant="ghost"
            size="sm"
            onclick={onviewprofile}
            aria-label="View {fullName}'s profile"
          >View profile</Button>
        {/if}
        {#if onaddmemory}
          <Button
            variant="ghost"
            size="sm"
            onclick={onaddmemory}
            aria-label="Add a memory for {fullName}"
          >Add memory</Button>
        {/if}
      </div>
    {/if}
  </div>
</article>

<style>
  .card {
    display: flex;
    gap: var(--space-6);
    padding: var(--space-4);
  }

  /* ── Horizontal (default) — avatar left, content right ── */
  .card.horizontal {
    flex-direction: row;
    align-items: flex-start;
    border-bottom: var(--border-default);
  }
  .card.horizontal .avatar-col {
    flex-shrink: 0;
  }

  /* ── Vertical (drawer / modal preview) — avatar centered top ── */
  .card.vertical {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .card.vertical .meta-row {
    justify-content: center;
  }
  .card.vertical .actions {
    justify-content: center;
  }

  .content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .meta-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .name {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 18px;
    font-weight: var(--font-weight-medium);
    line-height: var(--line-height-heading);
    color: var(--color-ink);
  }

  .dates {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-regular);
    line-height: var(--line-height-ui);
    color: var(--color-warm-mid);
  }

  /* Cormorant Garamond italic — the emotional core of the card */
  .bio {
    margin: var(--space-3) 0 0;
    font-family: var(--font-body);
    font-size: 14px;
    font-style: italic;
    font-weight: var(--font-weight-regular);
    line-height: 1.7;
    color: var(--color-ink-soft);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .actions {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-4);
  }

  @media (max-width: 480px) {
    .card.horizontal {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .card.horizontal .meta-row {
      justify-content: center;
    }
    .card.horizontal .actions {
      justify-content: center;
    }
  }
</style>
