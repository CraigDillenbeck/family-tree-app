<script lang="ts">
  type Item = { value: string; label: string; count?: number | null };

  let {
    value,
    items,
    onchange
  }: {
    value: string;
    items: Item[];
    onchange?: (value: string) => void;
  } = $props();
</script>

<div class="tabs" role="tablist">
  {#each items as it (it.value)}
    <button
      class="tab"
      class:active={value === it.value}
      role="tab"
      aria-selected={value === it.value}
      onclick={() => onchange?.(it.value)}
    >
      {it.label}
      {#if it.count != null}<span class="count">{it.count}</span>{/if}
    </button>
  {/each}
</div>

<style>
  .tabs { display: flex; border-bottom: var(--border-default); }
  .tab {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    height: 40px;
    padding: 0 var(--space-6);
    margin-bottom: -1px;
    border: none;
    background: transparent;
    border-bottom: 2px solid transparent;
    font-family: var(--font-display);
    font-weight: var(--font-weight-medium);
    font-size: 13px;
    color: var(--color-warm-mid);
    cursor: pointer;
    transition: color var(--dur-fast) var(--ease);
  }
  /* Active — Ink text, 2px Gold underline. */
  .active { color: var(--color-ink); border-bottom-color: var(--color-gold); }

  .count {
    padding: 1px 7px;
    border-radius: var(--radius-full);
    background: var(--color-surface-2);
    color: var(--color-warm-mid);
    font-size: 10px;
    font-weight: var(--font-weight-medium);
  }
</style>
