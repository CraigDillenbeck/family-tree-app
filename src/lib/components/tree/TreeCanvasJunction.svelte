<script lang="ts">
  import { Handle, Position } from '@xyflow/svelte'

  let { data: _ }: { data: unknown } = $props()
</script>

<div style="width:2px;height:2px;opacity:0;pointer-events:none;" aria-hidden="true"></div>

<Handle type="source" position={Position.Bottom} style="opacity:0;pointer-events:none;width:1px;height:1px" />
