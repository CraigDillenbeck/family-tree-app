<script lang="ts" module>
  /** Minimal shape — adapt to your Supabase `persons` row. */
  export type PersonLike = {
    given?: string | null;
    family?: string | null;
    initials?: string | null;
    status?: 'living' | 'deceased' | null;
    avatarUrl?: string | null;
  };
</script>

<script lang="ts">
  let {
    person,
    size = 48,
    deceased,
    src,
    style = ''
  }: {
    person?: PersonLike;
    size?: number;
    /** force deceased treatment; otherwise read from person.status */
    deceased?: boolean;
    /** photo URL; falls back to person.avatarUrl, then initials */
    src?: string;
    style?: string;
  } = $props();

  const isDeceased = $derived(deceased ?? person?.status === 'deceased');
  const photo = $derived(src ?? person?.avatarUrl ?? null);
  const initials = $derived(
    person?.initials ??
      ((person?.given?.[0] ?? '') + (person?.family?.[0] ?? '') || '?')
  );
  const fontSize = $derived(Math.round(size * 0.36));
</script>

<span
  class="avatar"
  class:deceased={isDeceased}
  style="width:{size}px; height:{size}px; font-size:{fontSize}px; {style}"
  aria-label={person ? `${person.given ?? ''} ${person.family ?? ''}`.trim() : undefined}
>
  {#if photo}
    <img src={photo} alt="" />
  {:else}
    {initials}
  {/if}
</span>

<style>
  .avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    border-radius: var(--radius-full); /* true circle */
    background: var(--color-surface-2);
    border: var(--border-default);
    color: var(--color-warm-mid);
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    overflow: hidden;
  }
  .avatar img { width: 100%; height: 100%; object-fit: cover; }

  /* Deceased — a quiet 25% desaturation + a step down the tonal ladder. Never mournful. */
  .deceased { background: var(--color-surface-3); filter: grayscale(0.25); }
</style>
