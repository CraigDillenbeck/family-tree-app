<script lang="ts">
  import { fly } from 'svelte/transition';
  import { cubicOut } from 'svelte/easing';
  import { toast, type ToastItem } from '$lib/stores/toasts';
  import { prefersReducedMotion } from '$lib/utils/motion';
  import Icon from './Icon.svelte';
  import { CheckCircle, AlertCircle, Info, X } from 'lucide-svelte';

  const dur = prefersReducedMotion() ? 0 : 280;

  const iconMap = {
    success: CheckCircle,
    error:   AlertCircle,
    info:    Info,
  } as const;

  const iconColorMap = {
    success: 'var(--color-sage)',
    error:   'var(--color-terra)',
    info:    'var(--color-gold)',
  } as const;
</script>

<!-- Mounted once in the root layout. Renders all active toasts. -->
<div class="container" aria-live="off">
  {#each $toast as item (item.id)}
    <div
      class="item"
      role={item.type === 'error' ? 'alert' : 'status'}
      transition:fly={{ y: 16, duration: dur, easing: cubicOut }}
    >
      <span class="icon" aria-hidden="true">
        <Icon icon={iconMap[item.type]} size={16} color={iconColorMap[item.type]} />
      </span>
      <span class="message">{item.message}</span>
      <button
        class="dismiss"
        onclick={() => toast.dismiss(item.id)}
        aria-label="Dismiss notification"
      >
        <Icon icon={X} size={12} color="var(--color-warm-light)" />
      </button>
    </div>
  {/each}
</div>

<style>
  .container {
    position: fixed;
    bottom: var(--space-6);
    right: var(--space-6);
    z-index: 300;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    pointer-events: none;
  }

  .item {
    pointer-events: all;
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    background: var(--color-bg-inverse);
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-4);
    max-width: 360px;
    box-shadow: var(--shadow-floating);
  }

  .icon {
    display: inline-flex;
    flex-shrink: 0;
    padding-top: 1px; /* optical alignment with text */
  }

  .message {
    flex: 1;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-regular);
    font-size: 14px;
    line-height: 1.4;
    color: var(--color-text-inverse);
  }

  .dismiss {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 44px;
    height: 44px;
    /* pull in so it doesn't add visual padding */
    margin: -10px -12px -10px 0;
    background: transparent;
    border: none;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease);
  }
  .dismiss:hover :global(svg) {
    color: var(--color-text-inverse);
  }

  /* Mobile: full-width strip at bottom */
  @media (max-width: 600px) {
    .container {
      right: 0;
      bottom: 0;
      left: 0;
      gap: 0;
    }
    .item {
      max-width: 100%;
      border-radius: 0;
      border-top: var(--border-inverse);
    }
    .item:first-child {
      border-radius: var(--radius-md) var(--radius-md) 0 0;
    }
  }
</style>
