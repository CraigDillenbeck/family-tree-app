<script lang="ts">
  /**
   * SVG relationship connector for the family tree canvas.
   *
   * Draws orthogonal (right-angle only) paths between two points.
   * When integrated with @xyflow/svelte, wrap this inside a custom edge
   * component and pass sourceX/Y, targetX/Y from the edge props.
   *
   * Usage standalone:
   *   <svg><RelationshipConnector sourceX={0} sourceY={0} targetX={200} targetY={100} type="parent_child" /></svg>
   *
   * Usage as XYFlow custom edge — add to edgeTypes and XYFlow passes coords:
   *   const edgeTypes = { relationship: RelationshipConnector }
   */

  type RelationshipType = 'parent_child' | 'spouse' | 'divorced' | 'adopted' | 'uncertain'

  let {
    sourceX,
    sourceY,
    targetX,
    targetY,
    type = 'parent_child',
    label,
    zoom = 1,
    // XYFlow passes these on edge components — accept and ignore what we don't use
    ...rest
  }: {
    sourceX: number
    sourceY: number
    targetX: number
    targetY: number
    type?: RelationshipType
    label?: string
    zoom?: number
    [key: string]: unknown
  } = $props()

  // Midpoint — used for label placement and the elbow bend
  const midX = $derived((sourceX + targetX) / 2)
  const midY = $derived((sourceY + targetY) / 2)

  // Orthogonal path: go vertical to midpoint, then horizontal, then vertical
  // This produces a clean top-to-bottom T shape common in genealogy trees
  const d = $derived(
    `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`
  )

  // Visual properties per relationship type
  type LineStyle = {
    stroke: string
    strokeWidth: number
    strokeDasharray?: string
    strokeOpacity?: number
  }

  const lineStyles: Record<RelationshipType, LineStyle> = {
    parent_child: {
      stroke: 'var(--color-warm-light)',
      strokeWidth: 1,
    },
    spouse: {
      stroke: 'var(--color-gold-light)',
      strokeWidth: 1.5,
    },
    divorced: {
      stroke: 'var(--color-warm-light)',
      strokeWidth: 1,
      strokeDasharray: '4 4',
    },
    adopted: {
      stroke: 'var(--color-warm-mid)',
      strokeWidth: 1,
      strokeDasharray: '2 6',
    },
    uncertain: {
      stroke: 'var(--color-warm-light)',
      strokeWidth: 0.5,
      strokeDasharray: '4 4',
    },
  }

  const style = $derived(lineStyles[type] ?? lineStyles.parent_child)

  // Labels only visible at zoom >= 0.75
  const showLabel = $derived(!!label && zoom >= 0.75)
</script>

<!-- Connector is structural, not interactive — hidden from AT -->
<g aria-hidden="true" class="connector {type}">
  <path
    {d}
    fill="none"
    stroke={style.stroke}
    stroke-width={style.strokeWidth}
    stroke-dasharray={style.strokeDasharray ?? undefined}
    stroke-linecap="round"
    stroke-linejoin="round"
  />

  <!-- Junction dot at the bend midpoint -->
  {#if type === 'parent_child' || type === 'adopted'}
    <circle
      cx={sourceX}
      cy={midY}
      r={2}
      fill="var(--color-warm-light)"
    />
  {/if}

  <!-- Connector label: appears on hover via CSS, always visible at >= 0.75 zoom -->
  {#if showLabel}
    <g class="label-group" transform="translate({midX}, {midY})">
      <rect
        x="-28"
        y="-10"
        width="56"
        height="20"
        rx="3"
        fill="var(--color-bg-page)"
        stroke="var(--color-border-subtle)"
        stroke-width="0.5"
      />
      <text
        x="0"
        y="4"
        text-anchor="middle"
        font-family="var(--font-ui)"
        font-size="10"
        fill="var(--color-warm-mid)"
      >{label}</text>
    </g>
  {/if}
</g>

<style>
  /* Hover: increase weight, shift to Warm-Mid */
  .connector:hover path {
    stroke-width: 2;
    stroke: var(--color-warm-mid);
  }
</style>
