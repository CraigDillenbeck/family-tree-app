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
  const SPOUSE_GAP = 40    // gap between spouse nodes — intentionally tight
  const SIBLING_GAP = 60   // edge-to-edge gap between siblings (same parent)
  const FAMILY_GAP = 200   // edge-to-edge gap between cousin groups (different parents)
  const MIN_NODE_GAP = 20  // absolute floor used in overlap resolution

  function buildLayout(ps: CanvasPerson[], rs: CanvasRelationship[]) {
    if (ps.length === 0) return { nodes: [], edges: [] }

    const g = new dagre.graphlib.Graph()
    g.setGraph({ rankdir: 'TB', ranksep: 80, nodesep: 40, marginx: 80, marginy: 80 })
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

      // Use the tree-member spouse's Y so in-laws (no parents in tree, assigned rank 0
      // by dagre) don't pull their partner off their generation row.
      const aHasParents = childToParents.has(jxn.personA)
      const bHasParents = childToParents.has(jxn.personB)
      let targetY: number
      if (aHasParents && !bHasParents) {
        targetY = posA.y
      } else if (bHasParents && !aHasParents) {
        targetY = posB.y
      } else {
        targetY = (posA.y + posB.y) / 2
      }
      const avgX = (posA.x + posB.x) / 2
      const halfSpan = NODE_W / 2 + SPOUSE_GAP / 2

      posA.x = avgX - halfSpan
      posB.x = avgX + halfSpan
      posA.y = targetY
      posB.y = targetY

      const jxnPos = g.node(jxn.id)
      if (jxnPos) {
        jxnPos.x = avgX
        jxnPos.y = targetY
      }
    }

    // Phase C: center each couple/parent over its blood children (bottom-up).
    // Dagre assigns rank 0 to in-laws (no parents in the tree), which skews the
    // X centroid of the generation above. This pass corrects that by re-centering
    // each couple/parent over its actual children after couple alignment is done.

    const personToJxnMeta = new Map<string, JunctionMeta>()
    for (const jxn of junctions) {
      personToJxnMeta.set(jxn.personA, jxn)
      personToJxnMeta.set(jxn.personB, jxn)
    }

    const junctionToChildren = new Map<string, string[]>()
    const singleParentToChildren = new Map<string, string[]>()
    for (const [childId, parents] of childToParents) {
      const jxnId = findJunctionForChild(childId)
      if (jxnId) {
        const arr = junctionToChildren.get(jxnId) ?? []
        arr.push(childId)
        junctionToChildren.set(jxnId, arr)
      } else if (parents.length > 0) {
        const arr = singleParentToChildren.get(parents[0]) ?? []
        arr.push(childId)
        singleParentToChildren.set(parents[0], arr)
      }
    }

    // childId → the ID of their parent unit (couple junction or single parent person).
    // Used by Phase D to detect family-group boundaries.
    const personToParentUnit = new Map<string, string>()
    for (const [childId, parents] of childToParents) {
      const jxnId = findJunctionForChild(childId)
      const parentKey = jxnId ?? parents[0]
      if (parentKey) personToParentUnit.set(childId, parentKey)
    }

    // If a child is in a couple, return the couple's junction X — treats child + spouse
    // as a single visual unit when centering the generation above.
    function childRepX(childId: string): number {
      const jxn = personToJxnMeta.get(childId)
      if (jxn) return g.node(jxn.id)?.x ?? (g.node(childId)?.x ?? 0)
      return g.node(childId)?.x ?? 0
    }

    // Process deepest junctions first so lower-level corrections feed up the tree
    const junctionsByDepth = [...junctions].sort(
      (a, b) => (g.node(b.id)?.y ?? 0) - (g.node(a.id)?.y ?? 0)
    )
    for (const jxn of junctionsByDepth) {
      const children = junctionToChildren.get(jxn.id) ?? []
      if (children.length === 0) continue
      const xs = children.map(childRepX)
      const targetX = (Math.min(...xs) + Math.max(...xs)) / 2
      const jxnPos = g.node(jxn.id)
      if (!jxnPos) continue
      const delta = targetX - jxnPos.x
      if (Math.abs(delta) < 1) continue
      jxnPos.x += delta
      const posA = g.node(jxn.personA)
      const posB = g.node(jxn.personB)
      if (posA) posA.x += delta
      if (posB) posB.x += delta
    }

    // Process deepest single-parents first so their corrected positions propagate upward
    const sortedSingleParents = [...singleParentToChildren.entries()].sort(
      ([idA], [idB]) => (g.node(idB)?.y ?? 0) - (g.node(idA)?.y ?? 0)
    )
    for (const [parentId, children] of sortedSingleParents) {
      const xs = children.map(childRepX)
      if (xs.length === 0) continue
      const targetX = (Math.min(...xs) + Math.max(...xs)) / 2
      // If the parent is in a couple, shift the entire couple + junction — Phase D
      // reads the junction X to rebuild couple units, so we must update the junction
      // here or Phase D will overwrite the centering correction.
      const jxn = personToJxnMeta.get(parentId)
      if (jxn) {
        const jxnPos = g.node(jxn.id)
        if (!jxnPos) continue
        const delta = targetX - jxnPos.x
        if (Math.abs(delta) < 1) continue
        jxnPos.x += delta
        const posA = g.node(jxn.personA)
        const posB = g.node(jxn.personB)
        if (posA) posA.x += delta
        if (posB) posB.x += delta
      } else {
        const pos = g.node(parentId)
        if (pos) pos.x = targetX
      }
    }

    // Phase D: resolve horizontal overlaps between units in the same generation.
    // Extracted into resolveOverlaps() so it can run a second time after Phase E —
    // Phase E may shift interior nodes (both parent and child) into their siblings.

    type LayoutUnit = { x: number; halfW: number; personIds: string[]; jxnId?: string; parentKey: string | null }

    function getParentKey(personIds: string[]): string | null {
      for (const id of personIds) {
        const pk = personToParentUnit.get(id)
        if (pk !== undefined) return pk
      }
      return null
    }

    function resolveOverlaps() {
      const processedInRow = new Set<string>()
      const unitRows = new Map<number, LayoutUnit[]>()

      for (const p of ps) {
        if (!connectedIds.has(p.id) || processedInRow.has(p.id)) continue
        const pos = g.node(p.id)
        if (!pos) continue
        const rowKey = Math.round(pos.y / 10) * 10
        const row = unitRows.get(rowKey) ?? []
        unitRows.set(rowKey, row)

        const jxn = personToJxnMeta.get(p.id)
        if (jxn) {
          const jxnPos = g.node(jxn.id)
          if (jxnPos) {
            row.push({
              x: jxnPos.x,
              halfW: NODE_W + SPOUSE_GAP / 2,
              personIds: [jxn.personA, jxn.personB],
              jxnId: jxn.id,
              parentKey: getParentKey([jxn.personA, jxn.personB]),
            })
          }
          processedInRow.add(jxn.personA)
          processedInRow.add(jxn.personB)
        } else {
          row.push({ x: pos.x, halfW: NODE_W / 2, personIds: [p.id], parentKey: personToParentUnit.get(p.id) ?? null })
          processedInRow.add(p.id)
        }
      }

      for (const units of unitRows.values()) {
        units.sort((a, b) => a.x - b.x)

        const originalCentroid = units.reduce((s, u) => s + u.x, 0) / units.length

        for (let i = 1; i < units.length; i++) {
          const l = units[i - 1]
          const r = units[i]
          const sameFamily = l.parentKey !== null && l.parentKey === r.parentKey
          const minDist = l.halfW + (sameFamily ? SIBLING_GAP : FAMILY_GAP) + r.halfW
          if (r.x < l.x + minDist) {
            r.x = l.x + minDist
          }
        }

        const newCentroid = units.reduce((s, u) => s + u.x, 0) / units.length
        const shift = originalCentroid - newCentroid
        if (Math.abs(shift) > 0.5) {
          for (const u of units) u.x += shift
        }

        for (const unit of units) {
          if (unit.personIds.length === 2 && unit.jxnId) {
            const posA = g.node(unit.personIds[0])
            const posB = g.node(unit.personIds[1])
            const jxnPos = g.node(unit.jxnId)
            const half = NODE_W / 2 + SPOUSE_GAP / 2
            if (posA) posA.x = unit.x - half
            if (posB) posB.x = unit.x + half
            if (jxnPos) jxnPos.x = unit.x
          } else {
            const pos = g.node(unit.personIds[0])
            if (pos) pos.x = unit.x
          }
        }
      }
    }

    resolveOverlaps()

    // Phase E: re-center parents after Phase D's overlap resolution shifted child positions.
    // Phase C used pre-overlap X values; Phase D may have pushed children right to clear
    // cousin groups. This pass corrects parent centering using the final child positions.

    for (const jxn of junctionsByDepth) {
      const children = junctionToChildren.get(jxn.id) ?? []
      if (children.length === 0) continue
      const xs = children.map(childRepX)
      const targetX = (Math.min(...xs) + Math.max(...xs)) / 2
      const jxnPos = g.node(jxn.id)
      if (!jxnPos) continue
      const delta = targetX - jxnPos.x
      if (Math.abs(delta) < 1) continue
      jxnPos.x += delta
      const posA = g.node(jxn.personA)
      const posB = g.node(jxn.personB)
      if (posA) posA.x += delta
      if (posB) posB.x += delta
    }

    for (const [parentId, children] of sortedSingleParents) {
      const xs = children.map(childRepX)
      if (xs.length === 0) continue
      const targetX = (Math.min(...xs) + Math.max(...xs)) / 2
      const jxn = personToJxnMeta.get(parentId)
      if (jxn) {
        const jxnPos = g.node(jxn.id)
        if (!jxnPos) continue
        const delta = targetX - jxnPos.x
        if (Math.abs(delta) < 1) continue
        jxnPos.x += delta
        const posA = g.node(jxn.personA)
        const posB = g.node(jxn.personB)
        if (posA) posA.x += delta
        if (posB) posB.x += delta
      } else {
        const pos = g.node(parentId)
        if (pos) pos.x = targetX
      }
    }

    // Phase D' — second overlap pass. Phase E re-centers interior nodes (nodes that are
    // both a child and a parent) over their children, which can push them into siblings.
    // A second pass restores correct sibling spacing without another Phase E iteration.
    resolveOverlaps()

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
