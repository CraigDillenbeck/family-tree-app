<script lang="ts">
	import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="mn-base shell">{@render children()}</div>

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
	}
	.shell {
		min-height: 100vh;
	}
</style>
