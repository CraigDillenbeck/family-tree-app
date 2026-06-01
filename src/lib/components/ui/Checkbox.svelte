<script lang="ts">
  let {
    label,
    checked = $bindable(false),
    indeterminate = false,
    error,
    disabled = false,
    onchange,
    ...rest
  }: {
    label?: string
    checked?: boolean
    indeterminate?: boolean
    error?: string
    disabled?: boolean
    onchange?: (checked: boolean) => void
  } & Record<string, unknown> = $props()

  let inputEl: HTMLInputElement | undefined = $state()

  $effect(() => {
    if (inputEl) inputEl.indeterminate = indeterminate
  })

  function handleChange() {
    onchange?.(checked)
  }
</script>

<div class="field">
  <label class="root" class:disabled class:has-error={!!error}>
    <input
      bind:this={inputEl}
      type="checkbox"
      class="native"
      bind:checked
      {disabled}
      onchange={handleChange}
      aria-invalid={error ? 'true' : undefined}
      {...rest}
    />
    <span class="control" aria-hidden="true"></span>
    {#if label}
      <span class="label-text">{label}</span>
    {/if}
  </label>
  {#if error}
    <span class="msg" role="alert">{error}</span>
  {/if}
</div>

<style>
  .field {
    display: inline-flex;
    flex-direction: column;
    gap: 4px;
  }

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

  .control {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    border-radius: var(--radius-xs);
    border: var(--border-default);
    background: var(--color-parchment);
    position: relative;
    transition:
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease);
  }

  /* Icon (checkmark or dash) via ::after */
  .control::after {
    content: '';
    position: absolute;
    inset: 0;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    opacity: 0;
    transition: opacity var(--dur-fast) var(--ease);
  }

  /* Checked fill */
  .root:has(.native:checked) .control,
  .root:has(.native:indeterminate) .control {
    background: var(--color-ink);
    border-color: var(--color-ink);
  }

  /* Checkmark icon */
  .root:has(.native:checked:not(:indeterminate)) .control::after {
    /* prettier-ignore */
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='8' viewBox='0 0 10 8'><path d='M1 4L3.5 6.5L9 1' stroke='%23F7F4EE' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' fill='none'/></svg>");
    opacity: 1;
  }

  /* Dash icon (indeterminate) */
  .root:has(.native:indeterminate) .control::after {
    /* prettier-ignore */
    background-image: url("data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='2' viewBox='0 0 10 2'><line x1='1' y1='1' x2='9' y2='1' stroke='%23F7F4EE' stroke-width='1.5' stroke-linecap='round'/></svg>");
    opacity: 1;
  }

  /* Hover — unchecked */
  .root:hover:not(.disabled) .control {
    border: var(--border-strong);
    background: var(--color-surface-1);
  }

  /* Hover — checked / indeterminate */
  .root:hover:not(.disabled):has(.native:checked) .control,
  .root:hover:not(.disabled):has(.native:indeterminate) .control {
    background: var(--color-ink-soft);
    border-color: var(--color-ink-soft);
  }

  /* Focus ring */
  .root:has(.native:focus-visible) .control {
    outline: var(--border-focus-ring);
    outline-offset: 2px;
  }

  /* Error state */
  .root.has-error .control {
    border-color: var(--color-terra);
    background: var(--color-terra-tint);
  }

  /* Error + checked: keep filled but show terra border */
  .root.has-error:has(.native:checked) .control,
  .root.has-error:has(.native:indeterminate) .control {
    background: var(--color-ink);
    border-color: var(--color-terra);
  }

  .label-text {
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    color: var(--color-ink-soft);
    line-height: 1.4;
  }

  .root.has-error .label-text {
    color: var(--color-terra);
  }

  .msg {
    font-family: var(--font-ui);
    font-size: var(--font-size-caption);
    color: var(--color-terra);
    padding-left: calc(16px + var(--space-3));
  }
</style>
