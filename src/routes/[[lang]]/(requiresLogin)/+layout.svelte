<script lang="ts">
	import type { LayoutData } from './$types';
    import { currentUser } from '$lib/client/auth';
    import type { Snippet } from 'svelte';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	const { data, children }: Props = $props();
</script>

{#if $currentUser}
	{@render children?.()}
{:else}
    <p>{data.translations.requiresLogIn}</p>
{/if}
