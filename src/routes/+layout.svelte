<script lang="ts">
	import '$lib/styles/tokens.css';
	import favicon from '$lib/assets/favicon.svg';
	import Toast from '$lib/components/ui/Toast.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="mn-base shell">{@render children()}</div>
<Toast />

<style>
	:global(html, body) {
		margin: 0;
		padding: 0;
	}
	.shell {
		min-height: 100vh;
	}
</style>
