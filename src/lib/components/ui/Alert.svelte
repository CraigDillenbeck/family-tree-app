<script lang="ts">
  import type { Snippet } from 'svelte'
  import Icon from './Icon.svelte'
  import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-svelte'

  type Intent  = 'error' | 'warning' | 'success' | 'info'
  type Variant = 'inline' | 'banner'

  let {
    intent = 'error',
    variant = 'inline',
    message,
    dismissible = false,
    ondismiss,
    children,
  }: {
    intent?: Intent
    /** inline: icon + text only, no bg. banner: filled block with left accent border. */
    variant?: Variant
    message?: string
    dismissible?: boolean
    ondismiss?: () => void
    /** Optional slot — pass a <ul> of error strings for form summary banners */
    children?: Snippet
  } = $props()

  const iconMap = {
    error:   AlertCircle,
    warning: AlertTriangle,
    success: CheckCircle,
    info:    Info,
  } as const

  const iconColorMap: Record<Intent, string> = {
    error:   'var(--color-terra)',
    warning: 'var(--color-gold)',
    success: 'var(--color-sage)',
    info:    'var(--color-warm-mid)',
  }
</script>

{#if variant === 'inline'}
  <p class="inline {intent}" role="alert" aria-live="assertive">
    <span class="inline-icon" aria-hidden="true">
      <Icon icon={iconMap[intent]} size={12} color={iconColorMap[intent]} />
    </span>
    {message ?? ''}
  </p>

{:else}
  <div class="banner {intent}" role={intent === 'error' ? 'alert' : 'status'} aria-live={intent === 'error' ? 'assertive' : 'polite'}>
    <span class="banner-icon" aria-hidden="true">
      <Icon icon={iconMap[intent]} size={16} color={iconColorMap[intent]} />
    </span>

    <div class="banner-body">
      {#if message}
        <p class="banner-message">{message}</p>
      {/if}
      {#if children}
        {@render children()}
      {/if}
    </div>

    {#if dismissible}
      <button
        class="dismiss-btn"
        onclick={() => ondismiss?.()}
        aria-label="Dismiss"
      >
        <Icon icon={X} size={14} color="var(--color-warm-mid)" />
      </button>
    {/if}
  </div>
{/if}

<style>
  /* ── Inline ── */
  .inline {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: var(--space-1) 0 0;
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: var(--font-weight-regular);
    line-height: 1.4;
  }
  .inline.error   { color: var(--color-terra); }
  .inline.warning { color: var(--color-gold); }
  .inline.success { color: var(--color-sage); }
  .inline.info    { color: var(--color-warm-mid); }

  .inline-icon {
    display: inline-flex;
    flex-shrink: 0;
  }

  /* ── Banner ── */
  .banner {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-sm);
    border-left-width: 2px;
    border-left-style: solid;
  }

  .banner.error {
    background: var(--color-terra-tint);
    border-left-color: var(--color-terra);
  }
  .banner.warning {
    background: color-mix(in srgb, var(--color-gold) 10%, var(--color-bg-page));
    border-left-color: var(--color-gold);
  }
  .banner.success {
    background: var(--color-sage-tint);
    border-left-color: var(--color-sage);
  }
  .banner.info {
    background: var(--color-bg-surface-1);
    border-left-color: var(--color-warm-light);
  }

  .banner-icon {
    display: inline-flex;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .banner-body {
    flex: 1;
    min-width: 0;
  }

  .banner-message {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    line-height: 1.5;
    color: var(--color-ink);
  }

  /* Consumer passes a <ul> for form summary — style it here */
  .banner-body :global(ul) {
    margin: var(--space-1) 0 0;
    padding-left: var(--space-4);
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-ink);
    line-height: 1.6;
  }

  .dismiss-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    margin: -4px -4px 0 0;
    transition: background var(--dur-fast) var(--ease);
  }
  .dismiss-btn:hover { background: rgba(28, 26, 23, 0.08); }
</style>
