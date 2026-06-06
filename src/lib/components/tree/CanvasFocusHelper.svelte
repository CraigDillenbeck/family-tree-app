<script lang="ts">
  import { untrack } from 'svelte'
  import { useSvelteFlow } from '@xyflow/svelte'

  let { focusId }: { focusId: string | null } = $props()

  const NODE_W = 160
  const NODE_H = 110

  const { setCenter, getNode, getViewport } = useSvelteFlow()

  $effect(() => {
    const id = focusId  // only this read is tracked; effect only re-runs when focusId changes
    if (!id) return
    untrack(() => {
      const node = getNode(id)
      if (!node?.position) return
      const { zoom } = getViewport()
      setCenter(node.position.x + NODE_W / 2, node.position.y + NODE_H / 2, { zoom, duration: 500 })
    })
  })
</script>
