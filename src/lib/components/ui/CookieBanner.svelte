<script lang="ts">
  import { browser } from '$app/environment'
  import { fly } from 'svelte/transition'
  import { cubicOut } from 'svelte/easing'
  import { prefersReducedMotion } from '$lib/utils/motion'
  import { analyticsOptIn, analyticsOptOut } from '$lib/utils/analytics'
  import Button from './Button.svelte'

  const STORAGE_KEY = 'prosapiam_cookies_accepted'

  let visible = $state(false)

  $effect(() => {
    if (!browser) return
    const stored = localStorage.getItem(STORAGE_KEY)
    visible = stored === null
  })

  const dur = prefersReducedMotion() ? 0 : 320

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'true')
    analyticsOptIn()
    visible = false
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, 'false')
    analyticsOptOut()
    visible = false
  }
</script>

{#if visible}
  <div
    class="banner"
    role="region"
    aria-label="Cookie consent"
    transition:fly={{ y: 16, duration: dur, easing: cubicOut }}
  >
    <p class="text">
      We use cookies to improve your experience.
      <a href="/privacy" class="policy-link">Privacy policy</a>
    </p>
    <div class="actions">
      <Button variant="ghost" size="sm" onclick={decline}>Decline</Button>
      <Button variant="primary" size="sm" onclick={accept}>Accept</Button>
    </div>
  </div>
{/if}

<style>
  .banner {
    position: fixed;
    bottom: var(--space-6);
    left: 50%;
    transform: translateX(-50%);
    z-index: 300;
    display: flex;
    align-items: center;
    gap: var(--space-6);
    padding: var(--space-4) var(--space-6);
    background: var(--color-bg-page);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    white-space: nowrap;
    max-width: calc(100vw - var(--space-8));
  }

  .text {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: 0;
    white-space: normal;
  }

  .policy-link {
    color: var(--color-text-primary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    text-decoration-color: var(--color-warm-light);
  }
  .policy-link:hover { color: var(--color-gold); text-decoration-color: var(--color-gold); }

  .actions {
    display: flex;
    gap: var(--space-2);
    flex-shrink: 0;
  }

  @media (max-width: 540px) {
    .banner {
      flex-direction: column;
      align-items: flex-start;
      white-space: normal;
      bottom: var(--space-4);
      left: var(--space-4);
      right: var(--space-4);
      transform: none;
    }
  }
</style>
