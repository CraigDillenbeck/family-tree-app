<script lang="ts">
  let {
    variant = 'horizontal',
    label: labelText,
    decorative = true,
  }: {
    /** horizontal (default) · muted · vertical · label */
    variant?: 'horizontal' | 'muted' | 'vertical' | 'label'
    /** Text shown in the label variant — e.g. a timeline year */
    label?: string
    /** true = aria-hidden (decorative). false = exposed to screen readers as a section separator. */
    decorative?: boolean
  } = $props()
</script>

{#if variant === 'label'}
  <div
    class="label-divider"
    role="separator"
    aria-hidden={decorative ? 'true' : undefined}
    aria-label={!decorative && labelText ? labelText : undefined}
  >
    <span class="line" aria-hidden="true"></span>
    <span class="label-text">{labelText ?? ''}</span>
    <span class="line" aria-hidden="true"></span>
  </div>
{:else if variant === 'vertical'}
  <div
    class="vertical-divider"
    role="separator"
    aria-orientation="vertical"
    aria-hidden="true"
  ></div>
{:else}
  <hr
    class="divider"
    class:muted={variant === 'muted'}
    aria-hidden={decorative ? 'true' : undefined}
  />
{/if}

<style>
  /* ── Horizontal ── */
  .divider {
    display: block;
    border: none;
    border-top: var(--border-default);
    margin: var(--space-6) 0;
    width: 100%;
  }

  .divider.muted {
    border-top: var(--border-subtle);
  }

  /* ── Vertical ── */
  .vertical-divider {
    display: inline-block;
    align-self: stretch;
    width: 0;
    border-left: 1px solid var(--color-border-default);
    margin: 0 var(--space-2);
    flex-shrink: 0;
  }

  /* ── With label ── */
  .label-divider {
    display: flex;
    align-items: center;
    margin: var(--space-6) 0;
  }

  .line {
    flex: 1;
    height: 0.5px;
    background: var(--color-border-default);
  }

  .label-text {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-regular);
    font-size: var(--font-size-label);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-warm-mid);
    padding: 0 var(--space-4);
    white-space: nowrap;
    flex-shrink: 0;
  }
</style>
