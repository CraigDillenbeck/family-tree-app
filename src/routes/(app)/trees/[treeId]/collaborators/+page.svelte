<script lang="ts">
  import { enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import { UserPlus, Trash2, RotateCw, Copy } from 'lucide-svelte'
  import type { PageProps } from './$types'
  import Button from '$lib/components/ui/Button.svelte'
  import Modal from '$lib/components/ui/Modal.svelte'
  import Input from '$lib/components/ui/Input.svelte'
  import Select from '$lib/components/ui/Select.svelte'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Badge from '$lib/components/ui/Badge.svelte'
  import EmptyState from '$lib/components/ui/EmptyState.svelte'
  import Icon from '$lib/components/ui/Icon.svelte'
  import { toast } from '$lib/stores/toasts'

  const { data }: PageProps = $props()

  const usedSlots = $derived(data.collaborators.length + data.invites.length)
  const atLimit = $derived(
    data.planMaxCollaborators !== -1 && usedSlots >= data.planMaxCollaborators
  )
  const nextPlan = $derived(data.planDisplayName === 'Remembrance' ? 'Heritage' : 'Legacy')

  let inviteModalOpen = $state(false)
  let inviteEmail = $state('')
  let inviteRole = $state('viewer')
  let inviteError = $state<string | null>(null)
  let inviteSubmitting = $state(false)

  function openInviteModal() {
    inviteEmail = ''
    inviteRole = 'viewer'
    inviteError = null
    inviteModalOpen = true
  }

  async function submitInvite(e: SubmitEvent) {
    e.preventDefault()
    inviteSubmitting = true
    inviteError = null

    const res = await fetch(`/api/trees/${data.tree.id}/collaborators`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    const result = await res.json()

    inviteSubmitting = false

    if (!res.ok) {
      inviteError = result.error ?? 'Could not send the invite. Please try again.'
      return
    }

    inviteModalOpen = false
    toast.success(`Invite sent to ${inviteEmail}.`)
    await invalidateAll()
  }

  async function copyLink(token: string) {
    const url = `${location.origin}/invite/${token}`
    await navigator.clipboard.writeText(url)
    toast.success('Invite link copied.')
  }

  function isExpired(expiresAt: string) {
    return new Date(expiresAt).getTime() < Date.now()
  }
</script>

<svelte:head>
  <title>Collaborators — {data.tree.name}</title>
</svelte:head>

<div class="page">

  <div class="breadcrumb">
    <a href="/trees/{data.tree.id}" class="back-link">&#8592; Back to tree</a>
  </div>

  <div class="inner">

    <div class="header-row">
      <div>
        <h1 class="page-title">Collaborators</h1>
        <p class="page-subtitle">
          {usedSlots} of {data.planMaxCollaborators === -1 ? 'unlimited' : data.planMaxCollaborators} on the {data.planDisplayName} plan
        </p>
      </div>
      <Button onclick={openInviteModal} disabled={atLimit}>
        {#snippet icon()}<Icon icon={UserPlus} size={16} color="currentColor" />{/snippet}
        Invite someone
      </Button>
    </div>

    {#if atLimit}
      <p class="limit-note">
        You've reached the {data.planDisplayName} plan's collaborator limit. Upgrade to {nextPlan} to invite more.
      </p>
    {/if}

    {#if data.collaborators.length === 0 && data.invites.length === 0}
      <EmptyState
        variant="first-use"
        heading="Invite your first collaborator to start building this tree together."
        body="They'll be able to add their own memories, photographs, and the details only they remember."
      >
        {#snippet icon()}<Icon icon={UserPlus} size={24} color="var(--color-gold)" />{/snippet}
        {#snippet cta()}<Button onclick={openInviteModal}>Invite someone</Button>{/snippet}
      </EmptyState>
    {:else}

      {#if data.collaborators.length > 0}
        <section class="section">
          <h2 class="section-heading">Collaborators</h2>
          <ul class="list">
            {#each data.collaborators as collaborator (collaborator.id)}
              <li class="row">
                <div class="row-main">
                  <Avatar person={{ given: collaborator.profile?.display_name ?? '?' }} src={collaborator.profile?.avatar_url ?? undefined} size={36} />
                  <div class="row-text">
                    <p class="row-name">{collaborator.profile?.display_name ?? 'Unknown'}</p>
                  </div>
                </div>
                <div class="row-actions">
                  <form
                    id="role-form-{collaborator.id}"
                    method="POST"
                    action="?/changeRole"
                    use:enhance={() => async ({ result, update }) => {
                      if (result.type === 'failure') {
                        toast.error((result.data as { error?: string })?.error ?? 'Could not update role.')
                      } else if (result.type === 'success') {
                        toast.success('Role updated.')
                      }
                      await update()
                    }}
                  >
                    <input type="hidden" name="collaboratorId" value={collaborator.id} />
                    <input type="hidden" name="role" id="role-input-{collaborator.id}" value={collaborator.role} />
                  </form>
                  <Select
                    options={[{ value: 'viewer', label: 'Viewer' }, { value: 'editor', label: 'Editor' }]}
                    value={collaborator.role}
                    onchange={(role) => {
                      const input = document.getElementById(`role-input-${collaborator.id}`) as HTMLInputElement
                      input.value = role
                      const form = document.getElementById(`role-form-${collaborator.id}`) as HTMLFormElement | null
                      form?.requestSubmit()
                    }}
                  />
                  <form
                    method="POST"
                    action="?/removeCollaborator"
                    use:enhance={() => async ({ result, update }) => {
                      if (result.type === 'failure') {
                        toast.error((result.data as { error?: string })?.error ?? 'Could not remove collaborator.')
                      } else if (result.type === 'success') {
                        toast.success('Collaborator removed.')
                      }
                      await update()
                    }}
                  >
                    <input type="hidden" name="collaboratorId" value={collaborator.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      {#snippet icon()}<Icon icon={Trash2} size={16} color="var(--color-terra)" />{/snippet}
                      Remove
                    </Button>
                  </form>
                </div>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

      {#if data.invites.length > 0}
        <section class="section">
          <h2 class="section-heading">Pending invites</h2>
          <ul class="list">
            {#each data.invites as invite (invite.id)}
              <li class="row">
                <div class="row-main">
                  <div class="row-text">
                    <p class="row-name">{invite.email}</p>
                    <Badge variant="warm" dot>
                      {isExpired(invite.expires_at) ? 'Expired' : 'Pending'} · {invite.role}
                    </Badge>
                  </div>
                </div>
                <div class="row-actions">
                  <Button variant="ghost" size="sm" onclick={() => copyLink(invite.token)}>
                    {#snippet icon()}<Icon icon={Copy} size={16} color="var(--color-warm-mid)" />{/snippet}
                    Copy link
                  </Button>
                  <form
                    method="POST"
                    action="?/resendInvite"
                    use:enhance={() => async ({ result, update }) => {
                      if (result.type === 'failure') {
                        toast.error((result.data as { error?: string })?.error ?? 'Could not resend invite.')
                      } else if (result.type === 'success') {
                        toast.success(`Invite resent to ${invite.email}.`)
                      }
                      await update()
                    }}
                  >
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      {#snippet icon()}<Icon icon={RotateCw} size={16} color="var(--color-warm-mid)" />{/snippet}
                      Resend
                    </Button>
                  </form>
                  <form
                    method="POST"
                    action="?/revokeInvite"
                    use:enhance={() => async ({ result, update }) => {
                      if (result.type === 'failure') {
                        toast.error((result.data as { error?: string })?.error ?? 'Could not revoke invite.')
                      } else if (result.type === 'success') {
                        toast.success('Invite revoked.')
                      }
                      await update()
                    }}
                  >
                    <input type="hidden" name="inviteId" value={invite.id} />
                    <Button type="submit" variant="ghost" size="sm">
                      {#snippet icon()}<Icon icon={Trash2} size={16} color="var(--color-terra)" />{/snippet}
                      Revoke
                    </Button>
                  </form>
                </div>
              </li>
            {/each}
          </ul>
        </section>
      {/if}

    {/if}

  </div>
</div>

<Modal
  open={inviteModalOpen}
  title="Invite a collaborator"
  variant="standard"
  onclose={() => { inviteModalOpen = false }}
>
  <form class="invite-form" onsubmit={submitInvite}>
    <Input
      label="Email address"
      type="email"
      bind:value={inviteEmail}
      placeholder="cousin@example.com"
      required
      error={inviteError ?? undefined}
    />
    <Select
      label="Role"
      bind:value={inviteRole}
      options={[
        { value: 'viewer', label: 'Viewer — can see the tree' },
        { value: 'editor', label: 'Editor — can add people and memories' },
      ]}
    />
    <div class="invite-form-actions">
      <Button variant="secondary" type="button" onclick={() => { inviteModalOpen = false }}>Cancel</Button>
      <Button type="submit" disabled={inviteSubmitting || !inviteEmail}>
        {inviteSubmitting ? 'Sending…' : 'Send invite'}
      </Button>
    </div>
  </form>
</Modal>

<style>
  .page {
    background: var(--color-bg-page);
    min-height: calc(100vh - 52px);
  }

  .breadcrumb {
    padding: var(--space-4) var(--space-20);
    border-bottom: var(--border-subtle);
  }

  .back-link {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    text-decoration-color: var(--color-warm-light);
  }
  .back-link:hover { color: var(--color-text-primary); }

  .inner {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--space-12) var(--space-20) var(--space-20);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .header-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .page-title {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-display-l);
    letter-spacing: -0.01em;
    color: var(--color-text-primary);
    margin: 0;
    line-height: var(--line-height-tight);
  }

  .page-subtitle {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: var(--space-1) 0 0;
  }

  .limit-note {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-gold);
    background: rgba(140, 115, 85, 0.08);
    border-radius: var(--radius-sm);
    padding: var(--space-3) var(--space-4);
    margin: 0;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    padding: var(--space-6) var(--space-8);
    background: var(--color-surface-0);
    border: var(--border-default);
    border-radius: var(--radius-lg);
  }

  .section-heading {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
  }

  .row-main {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }

  .row-text {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    min-width: 0;
  }

  .row-name {
    font-family: var(--font-ui);
    font-size: 14px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .row-actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .row-actions form {
    display: contents;
  }

  .invite-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .invite-form-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-3);
    padding-top: var(--space-2);
  }

  @media (max-width: 540px) {
    .inner { padding: var(--space-8) var(--space-4) var(--space-12); }
    .header-row { flex-direction: column; align-items: stretch; }
    .row { flex-direction: column; align-items: flex-start; }
  }
</style>
