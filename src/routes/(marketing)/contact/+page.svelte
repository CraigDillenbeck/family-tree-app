<script lang="ts">
	import { enhance } from '$app/forms'
	import type { ActionData } from './$types'

	let { form }: { form: ActionData } = $props()
	let loading = $state(false)
	let charCount = $state(0)
</script>

<svelte:head>
	<title>Contact — Prosapia</title>
	<meta name="description" content="Get in touch with the Prosapia team. We read everything and reply within one to two business days." />
</svelte:head>

<div class="contact-page">
	<div class="contact-container">
		<header class="contact-header">
			<a href="/" class="wordmark">PROSAPIA</a>
			<h1 class="contact-title">Get in touch</h1>
			<p class="contact-intro">
				Prosapia is built by one person, with care for your family's story. When you write
				to us, a real person reads every message and replies within one to two business days.
			</p>
		</header>

		{#if form?.success}
			<div class="success-state">
				<p class="success-title">Message received.</p>
				<p class="success-body">
					Thank you for reaching out. We'll be in touch at the email you provided —
					usually within a day or two.
				</p>
				<a href="/" class="back-home">← Back to Prosapia</a>
			</div>
		{:else}
			<form
				method="POST"
				class="contact-form"
				use:enhance={() => {
					loading = true
					return async ({ update }) => {
						await update()
						loading = false
					}
				}}
			>
				{#if form?.error}
					<div class="form-error" role="alert">{form.error}</div>
				{/if}

				<div class="field">
					<label for="name">Your name</label>
					<input
						id="name"
						name="name"
						type="text"
						autocomplete="name"
						required
						maxlength="100"
						value={form?.name ?? ''}
					/>
				</div>

				<div class="field">
					<label for="email">Email address</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						required
						value={form?.email ?? ''}
					/>
				</div>

				<div class="field">
					<label for="reason">What's this about?</label>
					<select id="reason" name="reason" required>
						<option value="" disabled selected={!form?.reason}>Select a topic</option>
						{#each ['General question', 'Billing & subscription', 'Privacy & data request', 'Feature idea', 'Something else'] as option}
							<option value={option} selected={form?.reason === option}>{option}</option>
						{/each}
					</select>
				</div>

				<div class="field">
					<label for="message">
						<span>Message</span>
						<span class="char-count" class:near-limit={charCount > 1800}>{charCount}/2000</span>
					</label>
					<textarea
						id="message"
						name="message"
						required
						maxlength="2000"
						rows="6"
						oninput={(e) => {
							charCount = (e.currentTarget as HTMLTextAreaElement).value.length
						}}
					>{form?.message ?? ''}</textarea>
				</div>

				<div class="form-footer">
					<button type="submit" class="submit-btn" disabled={loading}>
						{loading ? 'Sending…' : 'Send message'}
					</button>
					<p class="direct-email">
						Or email us directly at <a href="mailto:hello@prosapia.me">hello@prosapia.me</a>
					</p>
				</div>
			</form>
		{/if}

		<footer class="page-footer">
			<a href="/">← Back to Prosapia</a>
			<span>·</span>
			<a href="/privacy">Privacy</a>
			<span>·</span>
			<a href="/terms">Terms</a>
		</footer>
	</div>
</div>

<style>
	.contact-page {
		background: var(--color-bg-page);
		min-height: 100vh;
		padding: var(--space-12) var(--space-6);
	}

	.contact-container {
		max-width: 600px;
		margin: 0 auto;
	}

	/* Header */
	.contact-header {
		margin-bottom: var(--space-12);
	}

	.wordmark {
		display: inline-block;
		font-family: var(--font-ui);
		font-size: 13px;
		font-weight: var(--font-weight-semibold);
		letter-spacing: 0.18em;
		color: var(--color-ink);
		text-decoration: none;
		margin-bottom: var(--space-8);
	}

	.wordmark:hover {
		color: var(--color-gold);
	}

	.contact-title {
		font-family: var(--font-display);
		font-size: 40px;
		font-weight: var(--font-weight-regular);
		color: var(--color-ink);
		margin: 0 0 var(--space-4);
		line-height: 1.15;
	}

	.contact-intro {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 17px;
		line-height: 1.75;
		color: var(--color-ink);
		margin: 0;
		max-width: 540px;
	}

	/* Form */
	.contact-form {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.form-error {
		background: color-mix(in srgb, var(--color-terracotta, #b85c38) 10%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-terracotta, #b85c38) 30%, transparent);
		border-radius: 6px;
		padding: var(--space-3) var(--space-4);
		font-family: var(--font-ui);
		font-size: 14px;
		color: var(--color-ink);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.field label {
		font-family: var(--font-ui);
		font-size: 14px;
		font-weight: var(--font-weight-medium);
		color: var(--color-ink);
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.char-count {
		font-weight: var(--font-weight-regular);
		font-size: 12px;
		color: var(--color-ink-muted, #6b6560);
		transition: color 150ms ease-out;
	}

	.char-count.near-limit {
		color: var(--color-terracotta, #b85c38);
	}

	input,
	select,
	textarea {
		font-family: var(--font-ui);
		font-size: 15px;
		color: var(--color-ink);
		background: var(--color-bg-page);
		border: 1px solid var(--color-border, #e0dbd2);
		border-radius: 6px;
		padding: var(--space-3) var(--space-4);
		width: 100%;
		box-sizing: border-box;
		outline: none;
		transition: border-color 150ms ease-out;
		appearance: none;
		-webkit-appearance: none;
	}

	select {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231C1A17' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 14px center;
		padding-right: var(--space-8);
		cursor: pointer;
	}

	textarea {
		resize: vertical;
		min-height: 140px;
		line-height: 1.6;
	}

	input:focus,
	select:focus,
	textarea:focus {
		border-color: var(--color-gold, #8c7355);
	}

	input::placeholder,
	textarea::placeholder {
		color: var(--color-ink-muted, #6b6560);
	}

	/* Form footer */
	.form-footer {
		display: flex;
		align-items: center;
		gap: var(--space-6);
		flex-wrap: wrap;
	}

	.submit-btn {
		font-family: var(--font-ui);
		font-size: 15px;
		font-weight: var(--font-weight-medium);
		color: var(--color-parchment, #f7f4ee);
		background: var(--color-ink);
		border: none;
		border-radius: 6px;
		padding: var(--space-3) var(--space-8);
		cursor: pointer;
		transition: opacity 150ms ease-out;
		white-space: nowrap;
	}

	.submit-btn:hover:not(:disabled) {
		opacity: 0.85;
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.direct-email {
		font-family: var(--font-ui);
		font-size: 13px;
		color: var(--color-ink-muted, #6b6560);
		margin: 0;
	}

	.direct-email a {
		color: var(--color-gold, #8c7355);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.direct-email a:hover {
		color: var(--color-ink);
	}

	/* Success state */
	.success-state {
		padding: var(--space-12) 0;
	}

	.success-title {
		font-family: var(--font-display);
		font-size: 28px;
		font-weight: var(--font-weight-regular);
		color: var(--color-ink);
		margin: 0 0 var(--space-4);
	}

	.success-body {
		font-family: var(--font-body);
		font-style: italic;
		font-size: 17px;
		line-height: 1.75;
		color: var(--color-ink);
		margin: 0 0 var(--space-8);
		max-width: 480px;
	}

	.back-home {
		font-family: var(--font-ui);
		font-size: 14px;
		color: var(--color-gold, #8c7355);
		text-decoration: none;
	}

	.back-home:hover {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	/* Footer */
	.page-footer {
		font-family: var(--font-ui);
		font-size: 14px;
		color: var(--color-ink-muted, #6b6560);
		margin-top: var(--space-16);
		padding-top: var(--space-6);
		border-top: 1px solid var(--color-border, #e0dbd2);
		display: flex;
		gap: var(--space-3);
		align-items: center;
	}

	.page-footer a {
		color: var(--color-ink-muted, #6b6560);
		text-decoration: none;
	}

	.page-footer a:hover {
		color: var(--color-gold, #8c7355);
	}

	@media (max-width: 600px) {
		.contact-title {
			font-size: 32px;
		}

		.form-footer {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-4);
		}

		.submit-btn {
			width: 100%;
			text-align: center;
		}
	}
</style>
