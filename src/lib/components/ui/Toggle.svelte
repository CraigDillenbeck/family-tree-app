<script lang="ts">
  let {
    label,
    checked = $bindable(false),
    disabled = false,
    onchange,
    ...rest
  }: {
    label?: string
    checked?: boolean
    disabled?: boolean
    onchange?: (checked: boolean) => void
  } & Record<string, unknown> = $props()

  function handleChange() {
    onchange?.(checked)
  }
</script>

<label class="root" class:disabled>
  <input
    type="checkbox"
    role="switch"
    class="native"
    bind:checked
    {disabled}
    onchange={handleChange}
    aria-label={label || undefined}
    {...rest}
  />
  <span class="track" aria-hidden="true">
    <span class="thumb"></span>
  </span>
  {#if label}
    <span class="label-text">{label}</span>
  {/if}
</label>

<style>
  .root {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    min-height: 44px;
    user-select: none;
    position: relative;
  }

  .root.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Visually hidden but accessible */
  .native {
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

  /* Track */
  .track {
    flex-shrink: 0;
    position: relative;
    width: 32px;
    height: 18px;
    border-radius: var(--radius-full);
    border: var(--border-default);
    background: var(--color-surface-2);
    transition:
      background 200ms var(--ease),
      border-color 200ms var(--ease);
  }

  /* Thumb */
  .thumb {
    position: absolute;
    top: 1.5px;
    left: 2px;
    width: 14px;
    height: 14px;
    border-radius: var(--radius-full);
    background: var(--color-parchment);
    box-shadow: 0 1px 3px rgba(28, 26, 23, 0.15);
    transition: transform 200ms var(--ease);
  }

  /* On state — track turns Sage, thumb slides right */
  .root:has(.native:checked) .track {
    background: var(--color-sage);
    border-color: var(--color-sage);
  }

  /* translateX = track_width - thumb_width - (2 * offset) = 32 - 14 - 4 = 14px */
  .root:has(.native:checked) .thumb {
    transform: translateX(14px);
  }

  /* Hover */
  .root:hover:not(.disabled) .track {
    opacity: 0.85;
  }

  /* Focus ring on track */
  .root:has(.native:focus-visible) .track {
    outline: var(--border-focus-ring);
    outline-offset: 2px;
  }

  .label-text {
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    color: var(--color-ink-soft);
    line-height: 1.4;
  }
</style>
