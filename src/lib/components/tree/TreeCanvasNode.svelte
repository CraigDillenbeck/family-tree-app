<script lang="ts">
  import { getContext } from 'svelte'
  import { Handle, Position, type NodeProps } from '@xyflow/svelte'
  import FamilyTreeNode from '$lib/components/patterns/FamilyTreeNode.svelte'
  import type { TreePerson } from '$lib/components/patterns/FamilyTreeNode.svelte'

  type NodeData = { person: TreePerson }

  // Use base NodeProps (Record<string, unknown> data) — cast to NodeData internally
  let { data, selected }: NodeProps = $props()

  const person = $derived((data as unknown as NodeData).person)

  const viewportCtx = getContext<{ zoom: number }>('tree-viewport')
  const zoom = $derived(viewportCtx?.zoom ?? 1)
</script>

<Handle type="target" position={Position.Top} style="opacity:0;pointer-events:none;width:1px;height:1px" />

<FamilyTreeNode
  {person}
  {zoom}
  {selected}
/>

<Handle type="source" position={Position.Bottom} style="opacity:0;pointer-events:none;width:1px;height:1px" />
