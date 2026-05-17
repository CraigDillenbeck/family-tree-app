<script lang="ts">
  import type { LayoutData, LayoutProps } from './$types'
  const { data, children }: LayoutProps = $props()
</script>

{@render children()}
