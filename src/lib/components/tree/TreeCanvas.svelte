<script lang="ts">
  import { setContext } from 'svelte'
  import { SvelteFlow, Background, MiniMap } from '@xyflow/svelte'
  import '@xyflow/svelte/dist/style.css'
  import type { Node, Edge, Viewport } from '@xyflow/svelte'
  import dagre from 'dagre'
  import type { NodeTypes, EdgeTypes } from '@xyflow/svelte'
  import TreeCanvasNode from '$lib/components/tree/TreeCanvasNode.svelte'
  import TreeCanvasEdge from '$lib/components/tree/TreeCanvasEdge.svelte'
  import type { TreePerson } from '$lib/components/patterns/FamilyTreeNode.svelte'

  export type CanvasPerson = {
    id: string
    first_name: string
    last_name: string | null
    birth_date: string | null
    death_date: string | null
    avatar_url: string | null
    is_living: boolean
  }

  export type CanvasRelationship = {
    id: string
    person_a_id: string
    person_b_id: string
    type: string
  }

  let {
    persons,
    relationships,
    selectedId = null,
    onNodeClick,
  }: {
    persons: CanvasPerson[]
    relationships: CanvasRelationship[]
    selectedId?: string | null
    onNodeClick?: (personId: string) => void
  } = $props()

  const NODE_W = 160
  const NODE_H = 110

  // Cast to NodeTypes/EdgeTypes — our components are compatible at runtime but TypeScript's
  // generic constraints on NodeTypes are too strict for narrowed NodeData types
  const nodeTypes: NodeTypes = { familyNode: TreeCanvasNode as NodeTypes[string] }
  const edgeTypes: EdgeTypes = { relationship: TreeCanvasEdge as EdgeTypes[string] }

  // Viewport zoom shared with child node/edge components via context
  const viewportCtx = $state({ zoom: 1 })
  setContext('tree-viewport', viewportCtx)

  function handleMove(_e: MouseEvent | TouchEvent | null, vp: Viewport) {
    viewportCtx.zoom = vp.zoom
  }

  function toPerson(p: CanvasPerson): TreePerson {
    return {
      id: p.id,
      firstName: p.first_name,
      lastName: p.last_name,
      birthDate: p.birth_date,
      deathDate: p.death_date,
      avatarUrl: p.avatar_url,
      isLiving: p.is_living,
    }
  }

  const SPOUSE_TYPES = new Set(['spouse', 'divorced', 'partner'])
  const SIBLING_TYPES = new Set(['sibling', 'half_sibling', 'step_sibling'])
  const PARENT_CHILD_TYPES = new Set(['parent_child', 'adopted_parent_child', 'step_parent_child'])
  const SPOUSE_GAP = 40

  function buildLayout(ps: CanvasPerson[], rs: CanvasRelationship[]) {
    if (ps.length === 0) return { nodes: [], edges: [] }

    const g = new dagre.graphlib.Graph()
    g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40, marginx: 80, marginy: 80 })
    g.setDefaultEdgeLabel(() => ({}))

    for (const p of ps) {
      g.setNode(p.id, { width: NODE_W, height: NODE_H })
    }

    // Parent-child edges drive the dagre hierarchy.
    // Spouse/partner edges are kept zero-weight so dagre clusters them together,
    // but we post-process their positions to force horizontal alignment.
    // Sibling edges are zero-weight to pull them to the same rank.
    const connectedIds = new Set<string>()
    for (const r of rs) {
      connectedIds.add(r.person_a_id)
      connectedIds.add(r.person_b_id)
      if (PARENT_CHILD_TYPES.has(r.type)) {
        g.setEdge(r.person_a_id, r.person_b_id)
      } else if (SPOUSE_TYPES.has(r.type) || SIBLING_TYPES.has(r.type)) {
        g.setEdge(r.person_a_id, r.person_b_id, { weight: 0, minlen: 0 })
      }
    }

    // Only lay out connected persons — unconnected persons appear in the roster panel only
    for (const p of ps) {
      if (!connectedIds.has(p.id)) {
        g.removeNode(p.id)
      }
    }

    dagre.layout(g)

    // Post-process spouse/partner pairs: force same Y row and horizontal side-by-side placement.
    // Dagre's TB layout can stack them vertically; this overrides that for all couple types.
    for (const r of rs) {
      if (!SPOUSE_TYPES.has(r.type)) continue
      const posA = g.node(r.person_a_id)
      const posB = g.node(r.person_b_id)
      if (!posA || !posB) continue

      const avgY = (posA.y + posB.y) / 2
      const avgX = (posA.x + posB.x) / 2
      const halfSpan = NODE_W / 2 + SPOUSE_GAP / 2

      posA.x = avgX - halfSpan
      posB.x = avgX + halfSpan
      posA.y = avgY
      posB.y = avgY
    }

    const nodes: Node[] = ps
      .filter(p => connectedIds.has(p.id))
      .map(p => {
        const pos = g.node(p.id)
        return {
          id: p.id,
          type: 'familyNode',
          // dagre gives center positions; XYFlow wants top-left → offset by half node size
          position: { x: (pos?.x ?? 0) - NODE_W / 2, y: (pos?.y ?? 0) - NODE_H / 2 },
          data: { person: toPerson(p) },
          selected: p.id === selectedId,
          selectable: true,
          draggable: false,
          connectable: false,
          deletable: false,
          width: NODE_W,
          height: NODE_H,
        }
      })

    const edges: Edge[] = rs.map(r => ({
      id: r.id,
      source: r.person_a_id,
      target: r.person_b_id,
      type: 'relationship',
      data: { relType: r.type },
      selectable: false,
      deletable: false,
      focusable: false,
    }))

    return { nodes, edges }
  }

  const layout = $derived(buildLayout(persons, relationships))
  const nodes = $derived(layout.nodes)
  const edges = $derived(layout.edges)

  function handleNodeClick({ node }: { node: Node; event: MouseEvent | TouchEvent }) {
    onNodeClick?.(node.id)
  }

  function handlePaneClick() {
    onNodeClick?.('')
  }
</script>

<div class="canvas-root">
  <SvelteFlow
    {nodes}
    {edges}
    {nodeTypes}
    {edgeTypes}
    fitView
    fitViewOptions={{ padding: 0.15 }}
    minZoom={0.15}
    maxZoom={2}
    nodesDraggable={false}
    nodesConnectable={false}
    elementsSelectable={true}
    deleteKey={null}
    panOnScroll={true}
    elevateEdgesOnSelect={false}
    onmove={handleMove}
    onnodeclick={handleNodeClick}
    onpaneclick={handlePaneClick}
    colorMode="light"
    style="width:100%;height:100%;background:var(--color-bg-page)"
  >
    <Background
      gap={18}
      size={1}
      patternColor="rgba(196, 185, 168, 0.5)"
      bgColor="var(--color-bg-page)"
    />
    <MiniMap
      position="bottom-right"
      style="background:var(--color-bg-surface-1);border:var(--border-subtle)"
    />
  </SvelteFlow>
</div>

<style>
  .canvas-root {
    width: 100%;
    height: 100%;
  }

  /* Override XYFlow defaults to match our token system */
  :global(.svelte-flow) {
    --xy-background-color: var(--color-bg-page);
  }

  /* Hide XYFlow node selection outline — we handle selection styling in FamilyTreeNode */
  :global(.svelte-flow .svelte-flow__node.selected) {
    outline: none;
  }

  /* Remove default node box-shadow */
  :global(.svelte-flow .svelte-flow__node) {
    box-shadow: none;
  }

  /* Edge SVG layer: ensure connectors render correctly */
  :global(.svelte-flow .svelte-flow__edge path) {
    fill: none;
  }

  /* MiniMap node color — living: Sage, deceased: Terra */
  :global(.svelte-flow .svelte-flow__minimap-node[data-living="true"]) {
    fill: var(--color-sage-light);
  }
</style>
