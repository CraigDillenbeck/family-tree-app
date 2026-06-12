<script lang="ts">
  import { enhance } from '$app/forms'
  import { untrack } from 'svelte'
  import type { PageProps } from './$types'
  import Avatar from '$lib/components/ui/Avatar.svelte'
  import Button from '$lib/components/ui/Button.svelte'
  import Divider from '$lib/components/ui/Divider.svelte'

  const { data, form }: PageProps = $props()

  const given = $derived(data.profile?.display_name?.split(' ')[0] ?? '')
  const family = $derived(data.profile?.display_name?.split(' ').slice(1).join(' ') ?? '')

  // Snapshot for the form input — untrack so Svelte doesn't warn about
  // reactive reads in $state initializers (intentional one-time capture)
  let displayNameValue = $state(untrack(() => data.profile?.display_name ?? ''))
  let confirmDelete = $state(false)
  let deleteInput = $state('')
  let savingProfile = $state(false)
  let deletingAccount = $state(false)

  const storagePercent = $derived(
    data.planLimits.storageBytes > 0
      ? Math.min(100, (data.storageUsedBytes / data.planLimits.storageBytes) * 100)
      : 0
  )

  const storageNearLimit = $derived(storagePercent >= 80)

  function formatBytes(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  const storageUsedLabel = $derived(formatBytes(data.storageUsedBytes))
  const storageTotalLabel = $derived(
    data.planLimits.storageBytes === -1 ? 'Unlimited' : formatBytes(data.planLimits.storageBytes)
  )
</script>

<svelte:head>
  <title>Account — Prosapiam</title>
</svelte:head>

<div class="page">
  <div class="content">
    <h1 class="page-title">Account</h1>

    <!-- ── Profile ── -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Profile</h2>
        <p class="section-sub">How your name appears to collaborators and in your trees.</p>
      </div>

      <div class="profile-row">
        <Avatar person={{ given, family }} size={64} />

        <form
          method="POST"
          action="?/updateProfile"
          class="profile-form"
          use:enhance={() => {
            savingProfile = true
            return async ({ update }) => {
              await update()
              savingProfile = false
            }
          }}
        >
          <label class="field">
            <span class="field-label">Display name</span>
            <input
              type="text"
              name="display_name"
              bind:value={displayNameValue}
              class="field-input"
              autocomplete="name"
              maxlength={80}
              required
            />
          </label>

          {#if form?.error}
            <p class="field-error" role="alert">{form.error}</p>
          {/if}
          {#if form?.updated}
            <p class="field-success" role="status">Name updated.</p>
          {/if}

          <Button type="submit" disabled={savingProfile}>
            {savingProfile ? 'Saving…' : 'Save name'}
          </Button>
        </form>
      </div>
    </section>

    <Divider />

    <!-- ── Plan & Storage ── -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Plan &amp; storage</h2>
        <p class="section-sub">Your current plan and how much storage you've used.</p>
      </div>

      <div class="plan-card">
        <div class="plan-row">
          <div>
            <p class="plan-name">{data.planName}</p>
            <p class="plan-desc">
              {data.planLimits.priceLabel} ·
              {data.planLimits.maxTrees === 1 ? '1 family tree' : data.planLimits.maxTrees === -1 ? 'Unlimited trees' : `${data.planLimits.maxTrees} family trees`}
            </p>
          </div>
          <a href="/signup" class="upgrade-link">Upgrade plan →</a>
        </div>

        <div class="storage-block">
          <div class="storage-label-row">
            <span class="storage-label">Storage</span>
            <span class="storage-value" class:near-limit={storageNearLimit}>
              {storageUsedLabel} of {storageTotalLabel}
            </span>
          </div>
          <div class="storage-bar" role="progressbar" aria-valuenow={storagePercent} aria-valuemin={0} aria-valuemax={100}>
            <div
              class="storage-fill"
              class:near-limit={storageNearLimit}
              style="width: {storagePercent}%"
            ></div>
          </div>
          {#if storageNearLimit}
            <p class="storage-warning">
              You've used {Math.round(storagePercent)}% of your storage.
              <a href="/signup" class="storage-upgrade">Upgrade to Heritage for 50 GB →</a>
            </p>
          {/if}
        </div>
      </div>
    </section>

    <Divider />

    <!-- ── Security ── -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">Security</h2>
        <p class="section-sub">Manage your sign-in credentials.</p>
      </div>

      <div class="security-row">
        <div>
          <p class="security-item-label">Email address</p>
          <p class="security-item-value">{data.user?.email ?? '—'}</p>
        </div>
      </div>

      <div class="security-row" style="margin-top: var(--space-4);">
        <div>
          <p class="security-item-label">Password</p>
          <p class="security-item-value">••••••••</p>
        </div>
        <a href="/forgot-password" class="ghost-link">Change password →</a>
      </div>
    </section>

    <Divider />

    <!-- ── Danger zone ── -->
    <section class="section danger-section">
      <div class="section-header">
        <h2 class="section-title danger-title">Delete account</h2>
        <p class="section-sub">
          Permanently delete your account, all your family trees, and every memory stored within them.
          This cannot be undone.
        </p>
      </div>

      {#if !confirmDelete}
        <Button variant="secondary" onclick={() => (confirmDelete = true)}>
          Delete my account
        </Button>
      {:else}
        <div class="confirm-block">
          <p class="confirm-text">
            To confirm, type <strong>delete my account</strong> below.
          </p>
          <input
            type="text"
            bind:value={deleteInput}
            placeholder="delete my account"
            class="field-input confirm-input"
            autocomplete="off"
          />

          <form
            method="POST"
            action="?/deleteAccount"
            use:enhance={() => {
              deletingAccount = true
              return async ({ update }) => {
                await update()
                deletingAccount = false
              }
            }}
          >
            <div class="confirm-actions">
              <Button
                type="submit"
                variant="secondary"
                disabled={deleteInput !== 'delete my account' || deletingAccount}
              >
                {deletingAccount ? 'Deleting…' : 'Yes, delete my account'}
              </Button>
              <Button variant="ghost" onclick={() => { confirmDelete = false; deleteInput = '' }}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      {/if}
    </section>

  </div>
</div>

<style>
  .page {
    background: var(--color-bg-page);
    min-height: calc(100vh - 52px);
  }

  .content {
    max-width: 680px;
    margin: 0 auto;
    padding: var(--space-12) var(--space-8) var(--space-20);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .page-title {
    font-family: var(--font-ui);
    font-weight: var(--font-weight-medium);
    font-size: var(--font-size-display-l);
    color: var(--color-text-primary);
    margin: 0 0 var(--space-4) 0;
    line-height: var(--line-height-tight);
  }

  /* ── Section ── */
  .section {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .section-header {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .section-title {
    font-family: var(--font-ui);
    font-size: var(--font-size-h2);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0;
  }

  .section-sub {
    font-family: var(--font-body);
    font-size: var(--font-size-body-story);
    font-style: italic;
    color: var(--color-text-secondary);
    margin: 0;
    line-height: var(--line-height-story);
  }

  /* ── Profile ── */
  .profile-row {
    display: flex;
    gap: var(--space-6);
    align-items: flex-start;
  }

  .profile-form {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .field-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .field-input {
    font-family: var(--font-ui);
    font-size: var(--font-size-body-ui);
    color: var(--color-text-primary);
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-md);
    padding: var(--space-2) var(--space-3);
    width: 100%;
    box-sizing: border-box;
    transition: border-color var(--dur-fast) var(--ease);
  }
  .field-input:focus {
    outline: none;
    border-color: var(--color-border-active);
  }

  .field-error {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-error);
    margin: 0;
  }

  .field-success {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-success);
    margin: 0;
  }

  /* ── Plan card ── */
  .plan-card {
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .plan-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .plan-name {
    font-family: var(--font-ui);
    font-size: var(--font-size-body-ui);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-primary);
    margin: 0;
  }

  .plan-desc {
    font-family: var(--font-ui);
    font-size: 13px;
    color: var(--color-text-secondary);
    margin: var(--space-1) 0 0 0;
  }

  .upgrade-link {
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-gold);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    white-space: nowrap;
  }

  .storage-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .storage-label-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .storage-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
  }

  .storage-value {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-text-secondary);
  }
  .storage-value.near-limit {
    color: var(--color-terra);
  }

  .storage-bar {
    height: 4px;
    background: var(--color-bg-surface-2);
    border-radius: 99px;
    overflow: hidden;
  }

  .storage-fill {
    height: 100%;
    background: var(--color-gold);
    border-radius: 99px;
    transition: width 600ms var(--ease);
  }
  .storage-fill.near-limit {
    background: var(--color-terra);
  }

  .storage-warning {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-terra);
    margin: 0;
    line-height: 1.5;
  }

  .storage-upgrade {
    color: var(--color-terra);
    text-decoration: underline;
    text-underline-offset: 3px;
  }

  /* ── Security ── */
  .security-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--color-bg-surface-1);
    border: var(--border-default);
    border-radius: var(--radius-md);
  }

  .security-item-label {
    font-family: var(--font-ui);
    font-size: var(--font-size-label);
    font-weight: var(--font-weight-medium);
    letter-spacing: var(--letter-spacing-label);
    text-transform: uppercase;
    color: var(--color-text-secondary);
    margin: 0;
  }

  .security-item-value {
    font-family: var(--font-ui);
    font-size: 14px;
    color: var(--color-text-primary);
    margin: var(--space-1) 0 0 0;
  }

  .ghost-link {
    font-family: var(--font-ui);
    font-size: 13px;
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-thickness: 0.5px;
    white-space: nowrap;
    transition: color var(--dur-fast) var(--ease);
  }
  .ghost-link:hover { color: var(--color-text-primary); }

  /* ── Danger zone ── */
  .danger-section { padding-bottom: var(--space-4); }

  .danger-title { color: var(--color-error); }

  .confirm-block {
    background: var(--color-error-bg);
    border: 0.5px solid color-mix(in srgb, var(--color-error) 30%, transparent);
    border-radius: var(--radius-lg);
    padding: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .confirm-text {
    font-family: var(--font-ui);
    font-size: 14px;
    color: var(--color-text-primary);
    margin: 0;
    line-height: 1.5;
  }

  .confirm-input {
    max-width: 300px;
  }

  .confirm-actions {
    display: flex;
    gap: var(--space-2);
    align-items: center;
  }
</style>
