<script lang="ts">
  import type { Snippet } from 'svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Badge from '$lib/components/ui/Badge.svelte'
  import Button from '$lib/components/ui/Button.svelte'

  export type ProfilePerson = {
    firstName: string
    lastName?: string | null
    birthDate?: string | null
    deathDate?: string | null
    birthplace?: string | null
    biography?: string | null
    avatarUrl?: string | null
    isLiving: boolean
  }

  let {
    person,
    relationshipLine,
    coverUrl,
    onaddmemory,
    oneditprofile,
    onaddrelationship,
    actions,
  }: {
    person: ProfilePerson
    /** e.g. 'Your great-grandmother on your mother's side' */
    relationshipLine?: string
    coverUrl?: string | null
    onaddmemory?: () => void
    oneditprofile?: () => void
    onaddrelationship?: () => void
    /** Optional action row override — pass custom Button snippets */
    actions?: Snippet
  } = $props()

  const fullName = $derived([person.firstName, person.lastName].filter(Boolean).join(' '))

  function formatBirthLine(p: ProfilePerson): string {
    const parts: string[] = []
    if (p.birthDate) {
      const d = new Date(p.birthDate + 'T00:00:00')
      parts.push('Born ' + d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }))
    }
    if (p.birthplace) parts.push(p.birthplace)
    return parts.join(' · ')
  }

  const birthLine = $derived(formatBirthLine(person))

  function formatDeathYear(date: string | null | undefined): string | null {
    if (!date) return null
    return String(new Date(date + 'T00:00:00').getFullYear())
  }

  const deathYear = $derived(formatDeathYear(person.deathDate))
</script>

<header class="profile-header" class:has-cover={!!coverUrl}>
  {#if coverUrl}
    <div class="cover" aria-hidden="true">
      <img class="cover-img" src={coverUrl} alt="" />
      <div class="cover-gradient"></div>
    </div>
  {/if}

  <div class="header-body">
    <div class="avatar-col">
      <Avatar
        person={{
          given: person.firstName,
          family: person.lastName ?? undefined,
          avatarUrl: person.avatarUrl,
          status: person.isLiving ? 'living' : 'deceased',
        }}
        size={128}
      />
    </div>

    <div class="identity">
      <h1 class="name">{fullName}</h1>

      {#if birthLine}
        <p class="dates">
          <time datetime={person.birthDate ?? ''}>{birthLine}</time>
          {#if deathYear}
            <span aria-hidden="true"> · </span>
            <time datetime={person.deathDate ?? ''}>Died {deathYear}</time>
          {/if}
        </p>
      {/if}

      {#if relationshipLine}
        <p class="relationship-line">{relationshipLine}</p>
      {/if}

      <div class="badge-row">
        {#if person.isLiving}
          <Badge variant="sage" dot>
            <span class="sr-only">Status: </span>Living
          </Badge>
        {:else}
          <Badge variant="terra" dot>
            <span class="sr-only">Status: </span>Deceased
          </Badge>
        {/if}
      </div>

      {#if person.biography}
        <p class="biography">{person.biography}</p>
      {/if}

      <div class="action-row">
        {#if actions}
          {@render actions()}
        {:else}
          {#if onaddmemory}
            <Button variant="primary" onclick={onaddmemory} aria-label="Add a memory for {fullName}">
              Add memory
            </Button>
          {/if}
          {#if oneditprofile}
            <Button variant="secondary" onclick={oneditprofile} aria-label="Edit {fullName}'s profile">
              Edit profile
            </Button>
          {/if}
          {#if onaddrelationship}
            <Button variant="ghost" onclick={onaddrelationship} aria-label="Add a relationship for {fullName}">
              Add relationship
            </Button>
          {/if}
        {/if}
      </div>
    </div>
  </div>
</header>

<style>
  .profile-header {
    background: var(--color-bg-surface-1);
    position: relative;
  }

  /* ── Cover photo ── */
  .cover {
    position: relative;
    width: 100%;
    height: 240px;
    overflow: hidden;
  }

  .cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .cover-gradient {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, transparent 30%, var(--color-bg-surface-1));
  }

  /* ── Header body ── */
  .header-body {
    display: flex;
    align-items: flex-start;
    gap: var(--space-8);
    max-width: 1280px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-20);
  }

  .has-cover .header-body {
    margin-top: -64px;
    padding-top: 0;
    position: relative;
    z-index: 1;
  }

  .avatar-col {
    flex-shrink: 0;
  }

  .identity {
    flex: 1;
    min-width: 0;
    padding-top: var(--space-3);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .name {
    margin: 0;
    font-family: var(--font-ui);
    font-size: var(--font-size-display-l);
    font-weight: var(--font-weight-light);
    line-height: var(--line-height-tight);
    letter-spacing: -0.01em;
    color: var(--color-ink);
  }

  .dates {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 16px;
    font-weight: var(--font-weight-regular);
    line-height: var(--line-height-ui);
    color: var(--color-warm-mid);
  }

  .relationship-line {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-regular);
    color: var(--color-warm-mid);
    line-height: var(--line-height-ui);
  }

  .badge-row {
    display: flex;
    gap: var(--space-2);
  }

  /* Cormorant Garamond biography — where the human lives */
  .biography {
    margin: var(--space-6) 0 0;
    font-family: var(--font-body);
    font-size: var(--font-size-body-story);
    font-weight: var(--font-weight-regular);
    line-height: var(--line-height-story);
    color: var(--color-ink-soft);
    max-width: var(--reading-width);
  }

  .action-row {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-6);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .header-body {
      padding: var(--space-6) var(--space-4);
      gap: var(--space-6);
    }
  }

  @media (max-width: 480px) {
    .header-body {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .badge-row { justify-content: center; }
    .action-row { justify-content: center; }
    .biography { text-align: left; }
    .has-cover .header-body { margin-top: -48px; }
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
