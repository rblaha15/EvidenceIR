<script lang="ts">
	import type { LayoutData } from './$types';

	interface Props {
		data: LayoutData;
		children?: import('svelte').Snippet;
	}

	let { data, children }: Props = $props();
</script>

{#if data.isLoggedIn}
	{@render children?.()}
{:else}
    <p>{data.translations.requiresLogIn}</p>
{/if}
