<script lang="ts">
  import { useSvelteFlow } from '@xyflow/svelte'

  let { focusId }: { focusId: string | null } = $props()

  const NODE_W = 160
  const NODE_H = 110

  const { setCenter, getNode } = useSvelteFlow()

  $effect(() => {
    if (!focusId) return
    const node = getNode(focusId)
    if (!node?.position) return
    setCenter(node.position.x + NODE_W / 2, node.position.y + NODE_H / 2, { duration: 500 })
  })
</script>
