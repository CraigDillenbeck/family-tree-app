<script lang="ts">
  import type { Component } from 'svelte';

  /**
   * Thin wrapper over lucide-svelte that enforces the system's icon rules:
   * 1.5px stroke, a small size scale, and Warm-Mid as the default colour.
   *
   *   import { Plus } from 'lucide-svelte';
   *   <Icon icon={Plus} size={16} />
   *
   * Requires: npm i lucide-svelte
   */
  let {
    icon,
    size = 20,
    color = 'var(--color-warm-mid)',
    strokeWidth = 1.5,
    title
  }: {
    icon: Component<any>;
    /** 12 (caption) · 16 (buttons/status) · 20 (nav) · 24 (toolbar/modal) */
    size?: 12 | 16 | 20 | 24 | number;
    /** default Warm-Mid; in a button pass "currentColor"; active = var(--color-ink) */
    color?: string;
    strokeWidth?: number;
    title?: string;
  } = $props();

  const LucideIcon = $derived(icon);
</script>

<LucideIcon {size} {color} stroke-width={strokeWidth} {title} aria-hidden={title ? undefined : true} />
