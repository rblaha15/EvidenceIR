<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

{#if data.isLoggedIn}
	<slot />
{:else}
    <p>{data.translations.requiresLogIn}</p>
{/if}
