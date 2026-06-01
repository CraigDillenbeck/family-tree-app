<script lang="ts">
  import { prefersReducedMotion } from '$lib/utils/motion'

  type Variant = 'text' | 'text-block' | 'avatar-sm' | 'avatar-md' | 'avatar-lg' | 'card' | 'person-card' | 'image'

  let {
    variant = 'text',
    lines = 3,
    label = 'Loading',
  }: {
    variant?: Variant
    /** Number of lines for text-block variant */
    lines?: number
    /** Describes what is loading — used for aria-label */
    label?: string
  } = $props()

  const animated = !prefersReducedMotion()
</script>

<div
  class="skeleton-container"
  aria-busy="true"
  aria-label="{label}…"
  aria-live="polite"
>
  {#if variant === 'text'}
    <div class="bone text" class:pulse={animated} aria-hidden="true"></div>

  {:else if variant === 'text-block'}
    {#each { length: lines } as _, i}
      <div
        class="bone text"
        class:pulse={animated}
        style="width: {i === lines - 1 ? '45%' : `${60 + Math.floor((i * 17) % 30)}%`}"
        aria-hidden="true"
      ></div>
    {/each}

  {:else if variant === 'avatar-sm'}
    <div class="bone avatar avatar-sm" class:pulse={animated} aria-hidden="true"></div>

  {:else if variant === 'avatar-md'}
    <div class="bone avatar avatar-md" class:pulse={animated} aria-hidden="true"></div>

  {:else if variant === 'avatar-lg'}
    <div class="bone avatar avatar-lg" class:pulse={animated} aria-hidden="true"></div>

  {:else if variant === 'card'}
    <div class="bone card-shell" class:pulse={animated} aria-hidden="true">
      <div class="card-header-zone"></div>
      <div class="card-body-zone">
        <div class="card-line" style="width: 80%"></div>
        <div class="card-line" style="width: 60%"></div>
        <div class="card-line" style="width: 40%"></div>
      </div>
    </div>

  {:else if variant === 'person-card'}
    <div class="person-card-shell" class:pulse={animated} aria-hidden="true">
      <div class="bone avatar avatar-md"></div>
      <div class="person-lines">
        <div class="bone text" style="width: 60%"></div>
        <div class="bone text" style="width: 40%; margin-top: var(--space-2)"></div>
        <div class="bone badge-stub"></div>
      </div>
    </div>

  {:else if variant === 'image'}
    <div class="bone image-rect" class:pulse={animated} aria-hidden="true"></div>
  {/if}
</div>

<style>
  .skeleton-container {
    display: contents;
  }

  /* ── Base bone ── */
  .bone {
    background: var(--color-bg-surface-2);
    border-radius: var(--radius-sm);
  }

  /* ── Pulse animation ── */
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50%       { opacity: 0.5; }
  }

  .pulse {
    animation: pulse 1.2s ease-in-out infinite;
  }

  /* ── Text line ── */
  .text {
    height: 12px;
    border-radius: 999px;
    width: 75%;
    margin-bottom: var(--space-2);
    display: block;
  }

  /* ── Avatar circles ── */
  .avatar {
    border-radius: 50%;
    flex-shrink: 0;
  }
  .avatar-sm { width: 32px;  height: 32px; }
  .avatar-md { width: 48px;  height: 48px; }
  .avatar-lg { width: 80px;  height: 80px; }

  /* ── Card ── */
  .card-shell {
    border-radius: var(--radius-md);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .card-header-zone {
    height: 56px;
    background: var(--color-bg-surface-3);
  }
  .card-body-zone {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }
  .card-line {
    height: 12px;
    border-radius: 999px;
    background: var(--color-bg-surface-3);
  }

  /* ── Person card ── */
  .person-card-shell {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
  }
  .person-lines {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding-top: var(--space-1);
  }
  .badge-stub {
    height: 20px;
    width: 60px;
    border-radius: 999px;
    background: var(--color-bg-surface-2);
    margin-top: var(--space-3);
  }

  /* ── Image rect ── */
  .image-rect {
    width: 100%;
    aspect-ratio: 4 / 3;
    border-radius: var(--radius-sm);
    display: block;
  }
</style>
