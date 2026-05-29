<script lang="ts">
  import type { Snippet } from 'svelte';

  let {
    label,
    type = 'text',
    placeholder,
    value = $bindable(''),
    error,
    prefix,
    oninput,
    ...rest
  }: {
    label?: string;
    type?: string;
    placeholder?: string;
    /** two-way bindable: <Input bind:value={email} /> */
    value?: string;
    /** error message; presence flips the field to the Terracotta error state */
    error?: string;
    /** optional leading icon snippet (e.g. <Icon name="mail" />) */
    prefix?: Snippet;
    oninput?: (e: Event) => void;
  } & Record<string, unknown> = $props();

  let focused = $state(false);
</script>

<label class="field">
  {#if label}<span class="label">{label}</span>{/if}
  <span class="control" class:focused class:error={!!error}>
    {#if prefix}<span class="prefix">{@render prefix()}</span>{/if}
    <input
      {type}
      {placeholder}
      bind:value
      {oninput}
      onfocus={() => (focused = true)}
      onblur={() => (focused = false)}
      {...rest}
    />
  </span>
  {#if error}<span class="msg">{error}</span>{/if}
</label>

<style>
  .field { display: flex; flex-direction: column; gap: 6px; }

  /* Micro-label — ALL CAPS, ≤14px, the one place caps are allowed. */
  .label {
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-label); /* 11px */
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .control {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    height: 36px;
    padding: 0 var(--space-3);
    background: var(--color-surface-2);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    transition:
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease),
      outline-color var(--dur-fast) var(--ease);
  }
  /* Focus — lifts to white, Gold border, 2px Ink@20% focus ring. */
  .control.focused {
    background: #fff;
    border-color: var(--color-gold);
    outline: var(--border-focus-ring);
    outline-offset: 2px;
  }
  /* Error — Terracotta tint + border. Never red. */
  .control.error {
    background: var(--color-terra-tint);
    border-color: var(--color-terra);
  }

  .prefix { display: inline-flex; color: var(--color-warm-mid); }

  input {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    font-family: var(--font-display);
    font-weight: var(--font-weight-regular);
    font-size: 14px;
    color: var(--color-ink);
  }
  input::placeholder { color: var(--color-text-hint); }

  .msg {
    font-family: var(--font-display);
    font-size: var(--font-size-caption); /* 12px */
    color: var(--color-terra);
  }
</style>
