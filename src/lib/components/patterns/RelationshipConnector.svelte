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

  type RelationshipType =
    | 'parent_child'
    | 'adopted_parent_child'
    | 'step_parent_child'
    | 'spouse'
    | 'divorced'
    | 'sibling'
    | 'half_sibling'
    | 'step_sibling'

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

  // Couple types (spouse, divorced) sit side-by-side at the same Y level.
  // XYFlow routes their edge bottom→top, so sourceY and targetY are on opposite sides
  // of the node center. Drawing the full orthogonal path creates phantom stubs above/below
  // the tiles. Instead, draw a clean horizontal line at midY (= true node center).
  // For all other types use the standard orthogonal T-shape.
  const isCoupleType = $derived(type === 'spouse' || type === 'divorced')

  const d = $derived(
    isCoupleType
      ? `M ${sourceX} ${midY} L ${targetX} ${midY}`
      : `M ${sourceX} ${sourceY} L ${sourceX} ${midY} L ${targetX} ${midY} L ${targetX} ${targetY}`
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
    adopted_parent_child: {
      stroke: 'var(--color-warm-mid)',
      strokeWidth: 1,
      strokeDasharray: '2 6',
    },
    step_parent_child: {
      stroke: 'var(--color-warm-mid)',
      strokeWidth: 1,
      strokeDasharray: '4 2',
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
    sibling: {
      stroke: 'var(--color-warm-light)',
      strokeWidth: 1,
    },
    half_sibling: {
      stroke: 'var(--color-warm-light)',
      strokeWidth: 1,
      strokeDasharray: '4 2',
    },
    step_sibling: {
      stroke: 'var(--color-warm-light)',
      strokeWidth: 1,
      strokeDasharray: '2 4',
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
  {#if type === 'parent_child' || type === 'adopted_parent_child' || type === 'step_parent_child'}
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
  .connector {
    pointer-events: none;
  }
</style>
