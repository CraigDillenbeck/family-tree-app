<script lang="ts">
  import { setContext } from 'svelte'
  import { SvelteFlow, Background, MiniMap } from '@xyflow/svelte'
  import '@xyflow/svelte/dist/style.css'
  import type { Node, Edge, Viewport } from '@xyflow/svelte'
  import type { NodeTypes, EdgeTypes } from '@xyflow/svelte'
  import TreeCanvasNode from '$lib/components/tree/TreeCanvasNode.svelte'
  import TreeCanvasEdge from '$lib/components/tree/TreeCanvasEdge.svelte'
  import TreeCanvasJunction from '$lib/components/tree/TreeCanvasJunction.svelte'
  import CanvasFocusHelper from '$lib/components/tree/CanvasFocusHelper.svelte'
  import type { TreePerson } from '$lib/components/patterns/FamilyTreeNode.svelte'

  export type CanvasPerson = {
    id: string
    first_name: string
    last_name: string | null
    birth_date: string | null
    death_date: string | null
    avatar_url: string | null
    is_living: boolean
    is_direct_descendant: boolean
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
    focusId = null,
    onNodeClick,
  }: {
    persons: CanvasPerson[]
    relationships: CanvasRelationship[]
    selectedId?: string | null
    focusId?: string | null
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

  const SPOUSE_TYPES = new Set(['spouse', 'divorced'])
  const SIBLING_TYPES = new Set(['sibling', 'half_sibling', 'step_sibling'])
  const PARENT_CHILD_TYPES = new Set(['parent_child', 'adopted_parent_child', 'step_parent_child'])
  const SPOUSE_GAP = 40   // tight horizontal gap between spouses
  const SIBLING_GAP = 60  // horizontal gap between sibling subtrees (same parent)
  const FAMILY_GAP = 200  // horizontal gap between unrelated root-level subtrees
  const RANK_SEP = 190    // vertical center-to-center distance between generations

  function buildLayout(ps: CanvasPerson[], rs: CanvasRelationship[]) {
    if (ps.length === 0) return { nodes: [], edges: [] }

    // ── Phase A: Identify connected persons and build couple junctions ──────────
    // Each couple gets a tiny invisible "junction" node at their midpoint.
    // All children connect to the junction, producing clean T-branch connectors.

    type JunctionMeta = { id: string; personA: string; personB: string; relType: string }
    const junctions: JunctionMeta[] = []
    const junctionMap = new Map<string, string>()            // sorted 'a_b' → junctionId
    const personToJxnMeta = new Map<string, JunctionMeta>() // personId → their junction

    const connectedIds = new Set<string>()
    for (const r of rs) {
      connectedIds.add(r.person_a_id)
      connectedIds.add(r.person_b_id)
    }

    const personIsDirectDescendant = new Map<string, boolean>()
    for (const p of ps) personIsDirectDescendant.set(p.id, p.is_direct_descendant)

    for (const r of rs) {
      if (SPOUSE_TYPES.has(r.type)) {
        const key = [r.person_a_id, r.person_b_id].sort().join('_')
        if (!junctionMap.has(key)) {
          const jxnId = '__jxn_' + key
          junctionMap.set(key, jxnId)
          const meta: JunctionMeta = {
            id: jxnId,
            personA: r.person_a_id,
            personB: r.person_b_id,
            relType: r.type,
          }
          junctions.push(meta)
          personToJxnMeta.set(r.person_a_id, meta)
          personToJxnMeta.set(r.person_b_id, meta)
        }
      }
    }

    // ── Phase B: Build child→parent maps ───────────────────────────────────────

    const childToParents = new Map<string, string[]>()
    for (const r of rs) {
      if (PARENT_CHILD_TYPES.has(r.type)) {
        const arr = childToParents.get(r.person_b_id) ?? []
        arr.push(r.person_a_id)
        childToParents.set(r.person_b_id, arr)
      }
    }

    // A child's connector routes through a couple's shared junction whenever any ONE of
    // the child's recorded parents belongs to that junction — not only when both members
    // of the couple are recorded as this specific child's parents. Otherwise siblings with
    // partial/mixed parent data (common for blended families, or simply incremental data
    // entry) render with inconsistent connector anchor points.
    function findJunctionForChild(childId: string): string | null {
      const parents = childToParents.get(childId) ?? []
      for (const parentId of parents) {
        const jxn = personToJxnMeta.get(parentId)
        if (jxn) return jxn.id
      }
      return null
    }

    // ── Phase C: Assign generation depths (Y positions) ────────────────────────
    // Root persons (no in-tree parents) get generation 0.
    // Each child's generation = max(parent generations) + 1.
    // This replaces Dagre's rank assignment and avoids the in-law rank-0 artifact.

    const personGeneration = new Map<string, number>()

    function computeGeneration(personId: string, visiting: Set<string>): number {
      if (personGeneration.has(personId)) return personGeneration.get(personId)!
      if (visiting.has(personId)) return 0 // cycle guard — family trees should never cycle
      visiting.add(personId)

      const parents = (childToParents.get(personId) ?? []).filter(id => connectedIds.has(id))
      let gen = 0
      if (parents.length > 0) {
        gen = Math.max(...parents.map(pid => computeGeneration(pid, new Set(visiting)))) + 1
      }
      personGeneration.set(personId, gen)
      return gen
    }

    for (const p of ps) {
      if (connectedIds.has(p.id)) computeGeneration(p.id, new Set())
    }

    // Align each couple to the same generation row (in-tree spouse's generation wins)
    for (const jxn of junctions) {
      const gen = Math.max(
        personGeneration.get(jxn.personA) ?? 0,
        personGeneration.get(jxn.personB) ?? 0,
      )
      personGeneration.set(jxn.personA, gen)
      personGeneration.set(jxn.personB, gen)
    }

    // ── Phase D: Build family-unit hierarchy and compute subtree widths ─────────
    // A "family unit" is a couple junction id or a single person id.
    // Each unit owns a contiguous horizontal slice of its generation row.
    // Widths are computed bottom-up so parents can be centered over their subtrees.

    function getUnitId(personId: string): string {
      return personToJxnMeta.get(personId)?.id ?? personId
    }

    const junctionById = new Map<string, JunctionMeta>()
    for (const jxn of junctions) junctionById.set(jxn.id, jxn)

    // Build junctionToChildren and singleParentToChildren
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

    // unitChildren: parent unit id → ordered list of child unit ids (deduplicated)
    const unitChildren = new Map<string, string[]>()
    for (const jxn of junctions) unitChildren.set(jxn.id, [])
    for (const p of ps) {
      if (connectedIds.has(p.id) && !personToJxnMeta.has(p.id)) unitChildren.set(p.id, [])
    }

    const addedChild = new Set<string>() // prevents duplicate child-unit entries

    function addChildUnit(parentUnitId: string, childPersonId: string) {
      const childUnitId = getUnitId(childPersonId)
      const key = `${parentUnitId}→${childUnitId}`
      if (addedChild.has(key)) return
      addedChild.add(key)
      const arr = unitChildren.get(parentUnitId) ?? []
      arr.push(childUnitId)
      unitChildren.set(parentUnitId, arr)
    }

    for (const [jxnId, childPersonIds] of junctionToChildren) {
      for (const childId of childPersonIds) addChildUnit(jxnId, childId)
    }
    for (const [parentId, childPersonIds] of singleParentToChildren) {
      const parentUnitId = getUnitId(parentId)
      for (const childId of childPersonIds) addChildUnit(parentUnitId, childId)
    }

    // For a junction, decide which spouse the connector "trunk" anchors on — the tree's
    // own blood line (is_direct_descendant), so a family's line of descent stays visually
    // traceable through every generation instead of jumping to each couple's midpoint.
    // Falls back to a symmetric split when both or neither spouse is flagged as direct.
    function bloodAnchorSide(jxn: JunctionMeta): 'a' | 'b' | null {
      const aIsDirect = personIsDirectDescendant.get(jxn.personA) ?? true
      const bIsDirect = personIsDirectDescendant.get(jxn.personB) ?? true
      if (aIsDirect && !bIsDirect) return 'a'
      if (bIsDirect && !aIsDirect) return 'b'
      return null
    }

    // Memoized extents: how far a unit's own footprint + all descendants reaches to the
    // left/right of its anchor point. Unlike a single symmetric "width", left and right
    // can differ once a couple's trunk anchors on one spouse instead of their midpoint —
    // tracking them separately keeps sibling reservations accurate (no overlap) even
    // though the anchor isn't necessarily centered within the unit's own footprint.
    type Extents = { left: number; right: number }
    const extentsCache = new Map<string, Extents>()

    function unitExtents(unitId: string, visiting = new Set<string>()): Extents {
      if (extentsCache.has(unitId)) return extentsCache.get(unitId)!
      if (visiting.has(unitId)) return { left: NODE_W / 2, right: NODE_W / 2 } // cycle guard

      const v = new Set(visiting)
      v.add(unitId)

      const isJunction = unitId.startsWith('__jxn_')
      let ownLeft: number
      let ownRight: number

      if (isJunction) {
        const jxn = junctionById.get(unitId)!
        const side = bloodAnchorSide(jxn)
        const spouseSpan = NODE_W / 2 + NODE_W + SPOUSE_GAP
        if (side === 'a') {
          ownLeft = NODE_W / 2
          ownRight = spouseSpan
        } else if (side === 'b') {
          ownLeft = spouseSpan
          ownRight = NODE_W / 2
        } else {
          const half = NODE_W / 2 + SPOUSE_GAP / 2 + NODE_W / 2
          ownLeft = half
          ownRight = half
        }
      } else {
        ownLeft = NODE_W / 2
        ownRight = NODE_W / 2
      }

      const children = unitChildren.get(unitId) ?? []
      if (children.length === 0) {
        const ext = { left: ownLeft, right: ownRight }
        extentsCache.set(unitId, ext)
        return ext
      }

      // Children fan out symmetrically as a block centered on this unit's own anchor.
      const childrenW =
        children.reduce((s, cu) => s + (unitExtents(cu, v).left + unitExtents(cu, v).right), 0) +
        (children.length - 1) * SIBLING_GAP

      const ext = {
        left: Math.max(ownLeft, childrenW / 2),
        right: Math.max(ownRight, childrenW / 2),
      }
      extentsCache.set(unitId, ext)
      return ext
    }

    // ── Phase E: Top-down X/Y placement ────────────────────────────────────────
    // Parents are placed first; children are distributed below them.
    // Siblings stay grouped by construction — no overlap correction pass needed.

    const personX = new Map<string, number>()
    const personY = new Map<string, number>()
    const jxnPos = new Map<string, { x: number; y: number }>()

    function placeUnit(unitId: string, anchorX: number, visited: Set<string>) {
      if (visited.has(unitId)) return
      visited.add(unitId)

      const isJunction = unitId.startsWith('__jxn_')

      if (isJunction) {
        const jxn = junctionById.get(unitId)!
        const gen = Math.max(
          personGeneration.get(jxn.personA) ?? 0,
          personGeneration.get(jxn.personB) ?? 0,
        )
        const y = gen * RANK_SEP

        const side = bloodAnchorSide(jxn)
        if (side === 'a') {
          personX.set(jxn.personA, anchorX)
          personX.set(jxn.personB, anchorX + NODE_W + SPOUSE_GAP)
        } else if (side === 'b') {
          personX.set(jxn.personB, anchorX)
          personX.set(jxn.personA, anchorX - NODE_W - SPOUSE_GAP)
        } else {
          const half = NODE_W / 2 + SPOUSE_GAP / 2
          personX.set(jxn.personA, anchorX - half)
          personX.set(jxn.personB, anchorX + half)
        }
        personY.set(jxn.personA, y)
        personY.set(jxn.personB, y)
        jxnPos.set(unitId, { x: anchorX, y })
      } else {
        personX.set(unitId, anchorX)
        personY.set(unitId, (personGeneration.get(unitId) ?? 0) * RANK_SEP)
      }

      const children = unitChildren.get(unitId) ?? []
      if (children.length === 0) return

      const childrenW =
        children.reduce((s, cu) => s + (unitExtents(cu).left + unitExtents(cu).right), 0) +
        (children.length - 1) * SIBLING_GAP
      let x = anchorX - childrenW / 2
      for (const cu of children) {
        const e = unitExtents(cu)
        placeUnit(cu, x + e.left, visited)
        x += e.left + e.right + SIBLING_GAP
      }
    }

    // Root units = units with no parent unit (top of the family tree)
    const childUnitSet = new Set<string>()
    for (const children of unitChildren.values()) {
      for (const cu of children) childUnitSet.add(cu)
    }
    const rootUnits = [...unitChildren.keys()].filter(uid => !childUnitSet.has(uid))
    rootUnits.sort() // alphabetical by id for stable ordering across re-renders

    const totalRootW =
      rootUnits.reduce((s, ru) => s + (unitExtents(ru).left + unitExtents(ru).right), 0) +
      Math.max(0, rootUnits.length - 1) * FAMILY_GAP
    let rx = -totalRootW / 2
    const placed = new Set<string>()
    for (const ru of rootUnits) {
      const e = unitExtents(ru)
      placeUnit(ru, rx + e.left, placed)
      rx += e.left + e.right + FAMILY_GAP
    }

    // Defensive fallback: ensure all connected persons have positions
    for (const p of ps) {
      if (connectedIds.has(p.id)) {
        if (!personX.has(p.id)) personX.set(p.id, 0)
        if (!personY.has(p.id)) personY.set(p.id, (personGeneration.get(p.id) ?? 0) * RANK_SEP)
      }
    }

    // ── Phase F: Assemble XYFlow nodes — persons + invisible junction anchors ───

    const nodes: Node[] = [
      ...ps
        .filter(p => connectedIds.has(p.id))
        .map(p => ({
          id: p.id,
          type: 'familyNode',
          position: {
            x: (personX.get(p.id) ?? 0) - NODE_W / 2,
            y: (personY.get(p.id) ?? 0) - NODE_H / 2,
          },
          data: { person: toPerson(p) },
          selected: p.id === selectedId,
          selectable: true,
          draggable: false,
          connectable: false,
          deletable: false,
          width: NODE_W,
          height: NODE_H,
        })),
      ...junctions.map(jxn => {
        const pos = jxnPos.get(jxn.id) ?? { x: 0, y: 0 }
        return {
          id: jxn.id,
          type: 'junctionNode',
          position: { x: pos.x - 1, y: pos.y - 1 },
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

    // ── Phase G: Assemble XYFlow edges ─────────────────────────────────────────
    // Couple edges: person_a ↔ person_b horizontal connector
    // Parent→child: one edge per child, sourced from junction (or single parent)
    // Sibling edges: omitted (siblings are implicitly co-ranked by sharing a parent unit)

    const edges: Edge[] = []
    const childEdgeAdded = new Set<string>()

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
        if (!childEdgeAdded.has(edgeId)) {
          childEdgeAdded.add(edgeId)
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
    <CanvasFocusHelper {focusId} />
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
