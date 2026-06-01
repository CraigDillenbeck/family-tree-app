<script lang="ts">
  let {
    label,
    placeholder,
    value = $bindable(''),
    error,
    variant = 'standard',
    maxlength,
    disabled = false,
    oninput,
    ...rest
  }: {
    label?: string;
    placeholder?: string;
    value?: string;
    error?: string;
    /** standard (120px min) | story (240px min) | auto (grows with content) */
    variant?: 'standard' | 'story' | 'auto';
    maxlength?: number;
    disabled?: boolean;
    oninput?: (e: Event) => void;
  } & Record<string, unknown> = $props();

  let focused = $state(false);
  let textareaEl: HTMLTextAreaElement | undefined = $state();
  let liveCount = $state(value.length);
  let debounceTimer: ReturnType<typeof setTimeout>;

  $effect(() => {
    // Read value to track it; resize after DOM settles
    const _ = value;
    if (variant === 'auto' && textareaEl) {
      textareaEl.style.height = 'auto';
      textareaEl.style.height = textareaEl.scrollHeight + 'px';
    }
  });

  function handleInput(e: Event) {
    // Debounce aria-live announcement — announce on pause, not every keystroke
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      liveCount = (e.target as HTMLTextAreaElement).value.length;
    }, 500);
    oninput?.(e);
  }
</script>

<label class="field" class:disabled>
  {#if label}<span class="label">{label}</span>{/if}
  <span
    class="control"
    class:focused
    class:error={!!error}
    class:story={variant === 'story'}
    class:auto={variant === 'auto'}
  >
    <textarea
      bind:this={textareaEl}
      bind:value
      {placeholder}
      {maxlength}
      {disabled}
      aria-invalid={!!error}
      aria-describedby={error ? 'field-error' : maxlength ? 'field-count' : undefined}
      onfocus={() => (focused = true)}
      onblur={() => (focused = false)}
      oninput={handleInput}
      {...rest}
    ></textarea>
  </span>

  <span class="footer">
    {#if error}
      <span class="msg" id="field-error" role="alert">{error}</span>
    {:else}
      <span></span>
    {/if}
    {#if maxlength}
      <span class="count" id="field-count">
        <span aria-live="polite" aria-atomic="true">{liveCount}</span>/{maxlength}
      </span>
    {/if}
  </span>
</label>

<style>
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-label);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .control {
    display: flex;
    background: var(--color-surface-2);
    border: var(--border-default);
    border-radius: var(--radius-sm);
    transition:
      background var(--dur-fast) var(--ease),
      border-color var(--dur-fast) var(--ease),
      outline-color var(--dur-fast) var(--ease);
  }

  .control:hover:not(.focused):not(.error) {
    border: var(--border-strong);
  }

  .control.focused {
    background: #fff;
    border-color: var(--color-gold);
    outline: var(--border-focus-ring);
    outline-offset: 2px;
  }

  .control.error {
    background: var(--color-terra-tint);
    border-color: var(--color-terra);
  }

  textarea {
    flex: 1;
    min-width: 0;
    min-height: 120px;
    padding: var(--space-3);
    border: none;
    outline: none;
    background: transparent;
    font-family: var(--font-ui);
    font-weight: var(--font-weight-regular);
    font-size: 14px;
    line-height: 1.65;
    color: var(--color-ink);
    resize: vertical;
  }

  .control.story textarea {
    min-height: 240px;
  }

  .control.auto textarea {
    min-height: 120px;
    resize: none;
    overflow: hidden;
  }

  textarea::placeholder {
    color: var(--color-text-hint);
  }

  .disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .disabled textarea {
    cursor: not-allowed;
    pointer-events: none;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    gap: var(--space-2);
    min-height: 16px;
  }

  .msg {
    font-family: var(--font-ui);
    font-size: var(--font-size-caption);
    color: var(--color-terra);
  }

  .count {
    font-family: var(--font-ui);
    font-size: 11px;
    font-weight: var(--font-weight-regular);
    color: var(--color-warm-mid);
    white-space: nowrap;
  }
</style>
