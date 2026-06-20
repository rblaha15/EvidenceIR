<script lang="ts">
	import { user } from '$lib/client/auth';
    import type { LayoutData } from './$types';
    import type { Snippet } from 'svelte';

	interface Props {
		data: LayoutData;
		children?: Snippet;
	}

	const { data, children }: Props = $props();
</script>

{#if $user}
	{@render children?.()}
{:else}
    <p>{data.translations.auth.requiresLogIn}</p>
{/if}
