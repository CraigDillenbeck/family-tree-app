<script lang="ts">
  export interface RadioOption {
    value: string
    label: string
    disabled?: boolean
  }

  let {
    legend,
    name,
    options = [],
    value = $bindable(''),
    error,
    disabled = false,
    onchange,
  }: {
    legend?: string
    name: string
    options: RadioOption[]
    value?: string
    error?: string
    disabled?: boolean
    onchange?: (value: string) => void
  } = $props()

  function handleChange(optionValue: string) {
    value = optionValue
    onchange?.(optionValue)
  }
</script>

<fieldset class="group" class:has-error={!!error} class:disabled>
  {#if legend}
    <legend class="legend">{legend}</legend>
  {/if}

  <div class="options">
    {#each options as option}
      {@const isDisabled = option.disabled || disabled}
      {@const isChecked = value === option.value}
      <label class="radio-root" class:option-disabled={isDisabled}>
        <input
          type="radio"
          class="native"
          {name}
          value={option.value}
          checked={isChecked}
          disabled={isDisabled}
          onchange={() => handleChange(option.value)}
        />
        <span class="control" aria-hidden="true"></span>
        <span class="label-text">{option.label}</span>
      </label>
    {/each}
  </div>

  {#if error}
    <span class="msg" role="alert">{error}</span>
  {/if}
</fieldset>

<style>
  .group {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .group.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .legend {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-label);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-warm-mid);
    margin-bottom: var(--space-3);
    padding: 0;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .radio-root {
    display: inline-flex;
    align-items: center;
    gap: var(--space-3);
    cursor: pointer;
    min-height: 44px;
    user-select: none;
    position: relative;
  }

  .radio-root.option-disabled {
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
    width: 18px;
    height: 18px;
    border-radius: var(--radius-full);
    border: var(--border-default);
    background: var(--color-parchment);
    position: relative;
    transition:
      border-color var(--dur-fast) var(--ease),
      background var(--dur-fast) var(--ease);
  }

  /* Inner dot via ::after */
  .control::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    border-radius: var(--radius-full);
    background: var(--color-gold);
    transform: translate(-50%, -50%) scale(0);
    transition: transform var(--dur-fast) var(--ease);
  }

  /* Selected state */
  .radio-root:has(.native:checked) .control {
    border: 1.5px solid var(--color-gold);
  }

  .radio-root:has(.native:checked) .control::after {
    transform: translate(-50%, -50%) scale(1);
  }

  /* Hover — unselected */
  .radio-root:hover:not(.option-disabled) .control {
    border: var(--border-strong);
    background: var(--color-surface-1);
  }

  /* Hover — selected */
  .radio-root:hover:not(.option-disabled):has(.native:checked) .control {
    border: 1.5px solid var(--color-gold);
    background: var(--color-parchment);
  }

  /* Focus ring */
  .radio-root:has(.native:focus-visible) .control {
    outline: var(--border-focus-ring);
    outline-offset: 2px;
  }

  /* Error state — border on all options */
  .group.has-error .control {
    border-color: var(--color-terra);
  }

  /* Error + selected: keep gold ring but flag the group */
  .group.has-error .radio-root:has(.native:checked) .control {
    border-color: var(--color-gold);
  }

  .label-text {
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-regular);
    color: var(--color-ink-soft);
    line-height: 1.4;
  }

  .msg {
    font-family: var(--font-ui);
    font-size: var(--font-size-caption);
    color: var(--color-terra);
  }
</style>
