<script lang="ts">
  import { setContext } from 'svelte'
  import { SvelteFlow, Background, MiniMap } from '@xyflow/svelte'
  import '@xyflow/svelte/dist/style.css'
  import type { Node, Edge, Viewport } from '@xyflow/svelte'
  import dagre from 'dagre'
  import type { NodeTypes, EdgeTypes } from '@xyflow/svelte'
  import TreeCanvasNode from '$lib/components/tree/TreeCanvasNode.svelte'
  import TreeCanvasEdge from '$lib/components/tree/TreeCanvasEdge.svelte'
  import TreeCanvasJunction from '$lib/components/tree/TreeCanvasJunction.svelte'
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
  const nodeTypes: NodeTypes = {
    familyNode: TreeCanvasNode as NodeTypes[string],
    junctionNode: TreeCanvasJunction as NodeTypes[string],
  }
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
    g.setGraph({ rankdir: 'TB', ranksep: 60, nodesep: 40, marginx: 80, marginy: 80 })
    g.setDefaultEdgeLabel(() => ({}))

    for (const p of ps) {
      g.setNode(p.id, { width: NODE_W, height: NODE_H })
    }

    // Phase A: Create virtual junction nodes for each couple.
    // The junction sits at the couple midpoint and serves as the single parent
    // node that all children connect to, producing a clean T-branch layout.
    type JunctionMeta = { id: string; personA: string; personB: string; relType: string }
    const junctions: JunctionMeta[] = []
    const junctionMap = new Map<string, string>() // sorted 'a_b' key → junctionId

    const connectedIds = new Set<string>()
    for (const r of rs) {
      connectedIds.add(r.person_a_id)
      connectedIds.add(r.person_b_id)
      if (SPOUSE_TYPES.has(r.type)) {
        const jxnId = '__jxn_' + [r.person_a_id, r.person_b_id].sort().join('_')
        g.setNode(jxnId, { width: 2, height: 2 })
        // Zero-minlen keeps junction at same rank as couple; high weight pulls it to midpoint
        g.setEdge(r.person_a_id, jxnId, { weight: 5, minlen: 0 })
        g.setEdge(r.person_b_id, jxnId, { weight: 5, minlen: 0 })
        const key = [r.person_a_id, r.person_b_id].sort().join('_')
        junctionMap.set(key, jxnId)
        junctions.push({ id: jxnId, personA: r.person_a_id, personB: r.person_b_id, relType: r.type })
      }
    }

    // Phase B: Route parent→child edges through junctions where possible.
    // Build child→parents map first, then for each child find if parents are a couple.
    const childToParents = new Map<string, string[]>()
    for (const r of rs) {
      if (PARENT_CHILD_TYPES.has(r.type)) {
        const arr = childToParents.get(r.person_b_id) ?? []
        arr.push(r.person_a_id)
        childToParents.set(r.person_b_id, arr)
      }
    }

    function findJunctionForChild(childId: string): string | null {
      const parents = childToParents.get(childId) ?? []
      for (let i = 0; i < parents.length; i++) {
        for (let j = i + 1; j < parents.length; j++) {
          const key = [parents[i], parents[j]].sort().join('_')
          if (junctionMap.has(key)) return junctionMap.get(key)!
        }
      }
      return null
    }

    // Each child gets exactly one dagre edge (from junction or single parent).
    // Sibling edges are omitted — siblings co-rank naturally by sharing the same junction parent.
    const childEdgeAdded = new Set<string>()
    for (const r of rs) {
      if (!PARENT_CHILD_TYPES.has(r.type)) continue
      const childId = r.person_b_id
      if (childEdgeAdded.has(childId)) continue
      const jxnId = findJunctionForChild(childId)
      g.setEdge(jxnId ?? r.person_a_id, childId)
      childEdgeAdded.add(childId)
    }

    // Only lay out connected persons — unconnected persons appear in the roster panel only
    for (const p of ps) {
      if (!connectedIds.has(p.id)) {
        g.removeNode(p.id)
      }
    }

    dagre.layout(g)

    // Post-process: force couples into horizontal pairs, then snap junction to their midpoint.
    for (const jxn of junctions) {
      const posA = g.node(jxn.personA)
      const posB = g.node(jxn.personB)
      if (!posA || !posB) continue

      const avgY = (posA.y + posB.y) / 2
      const avgX = (posA.x + posB.x) / 2
      const halfSpan = NODE_W / 2 + SPOUSE_GAP / 2

      posA.x = avgX - halfSpan
      posB.x = avgX + halfSpan
      posA.y = avgY
      posB.y = avgY

      const jxnPos = g.node(jxn.id)
      if (jxnPos) {
        jxnPos.x = avgX
        jxnPos.y = avgY
      }
    }

    // Phase F: Assemble XYFlow nodes — persons + invisible junction anchors.
    const nodes: Node[] = [
      ...ps
        .filter(p => connectedIds.has(p.id))
        .map(p => {
          const pos = g.node(p.id)
          return {
            id: p.id,
            type: 'familyNode',
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
        }),
      ...junctions.map(jxn => {
        const pos = g.node(jxn.id)
        return {
          id: jxn.id,
          type: 'junctionNode',
          position: { x: (pos?.x ?? 0) - 1, y: (pos?.y ?? 0) - 1 },
          data: {},
          selectable: false,
          draggable: false,
          connectable: false,
          deletable: false,
          width: 2,
          height: 2,
        }
      }),
    ]

    // Phase G: Assemble XYFlow edges.
    // - Couple edges: person_a ↔ person_b horizontal connector (unchanged)
    // - Parent→child: one edge per child, sourced from junction (or single parent)
    // - Sibling edges: omitted
    const edges: Edge[] = []

    for (const r of rs) {
      if (SIBLING_TYPES.has(r.type)) continue

      if (SPOUSE_TYPES.has(r.type)) {
        edges.push({
          id: r.id,
          source: r.person_a_id,
          target: r.person_b_id,
          type: 'relationship',
          data: { relType: r.type },
          selectable: false,
          deletable: false,
          focusable: false,
        })
        continue
      }

      if (PARENT_CHILD_TYPES.has(r.type)) {
        const childId = r.person_b_id
        const jxnId = findJunctionForChild(childId)
        const edgeId = jxnId ? `jxn-child-${jxnId}-${childId}` : r.id
        if (!edges.some(e => e.id === edgeId)) {
          edges.push({
            id: edgeId,
            source: jxnId ?? r.person_a_id,
            target: childId,
            type: 'relationship',
            data: { relType: r.type },
            selectable: false,
            deletable: false,
            focusable: false,
          })
        }
      }
    }

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
    panOnScroll={false}
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
