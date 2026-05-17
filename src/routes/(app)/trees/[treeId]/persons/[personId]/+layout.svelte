<script lang="ts">
  import type { LayoutProps } from './$types'
  const { data, children }: LayoutProps = $props()
</script>

{@render children()}
