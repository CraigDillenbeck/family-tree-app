<script lang="ts">
  import type { LayoutProps } from './$types'
  import TopNav from '$lib/components/ui/TopNav.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import { identify, analyticsReset } from '$lib/utils/analytics'
  import * as Sentry from '@sentry/sveltekit'

  const { data, children }: LayoutProps = $props()

  $effect(() => {
    if (data.profile) {
      identify(data.profile.id, { display_name: data.profile.display_name ?? undefined })
      Sentry.setUser({ id: data.profile.id, username: data.profile.display_name ?? undefined })
    }
  })

  const given = $derived(
    data.profile?.display_name?.split(' ')[0]
    ?? data.user?.user_metadata?.full_name?.split(' ')[0]
    ?? null
  )
  const family = $derived(
    data.profile?.display_name?.split(' ').slice(-1)[0]
    ?? data.user?.user_metadata?.full_name?.split(' ').slice(-1)[0]
    ?? null
  )
</script>

<TopNav active="dashboard">
  {#snippet avatar()}
    <Avatar person={{ given, family }} size={32} />
    <form method="POST" action="/api/auth/signout" style="display:contents" onsubmit={() => { analyticsReset(); Sentry.setUser(null) }}>
      <button type="submit" class="signout">Sign out</button>
    </form>
  {/snippet}
</TopNav>

{@render children()}

<style>
  .signout {
    background: none;
    border: var(--border-inverse);
    border-radius: var(--radius-sm);
    color: var(--color-text-inverse-muted);
    cursor: pointer;
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: var(--font-weight-medium);
    height: 28px;
    padding: 0 var(--space-3);
    transition: color var(--dur-fast) var(--ease);
  }
  .signout:hover { color: var(--color-text-inverse); }
</style>
