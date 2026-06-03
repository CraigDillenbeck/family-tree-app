<script lang="ts">
  import { getContext } from 'svelte'
  import type { EdgeProps } from '@xyflow/svelte'
  import RelationshipConnector from '$lib/components/patterns/RelationshipConnector.svelte'

  type RelationshipType =
    | 'parent_child'
    | 'adopted_parent_child'
    | 'step_parent_child'
    | 'spouse'
    | 'divorced'
    | 'partner'
    | 'sibling'
    | 'half_sibling'
    | 'step_sibling'
  type EdgeData = { relType: RelationshipType }

  // Use base EdgeProps — cast data to EdgeData internally
  let { sourceX, sourceY, targetX, targetY, data }: EdgeProps = $props()

  const relType = $derived(((data as unknown as EdgeData)?.relType) ?? ('parent_child' as RelationshipType))

  const viewportCtx = getContext<{ zoom: number }>('tree-viewport')
  const zoom = $derived(viewportCtx?.zoom ?? 1)
</script>

<RelationshipConnector
  {sourceX}
  {sourceY}
  {targetX}
  {targetY}
  type={relType}
  {zoom}
/>
