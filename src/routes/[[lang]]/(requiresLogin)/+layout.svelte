<script lang="ts">import type { PageData } from './$types';

	export let data: PageData;
</script>

{#if data.isLoggedIn}
	<slot />
{:else}
    <p>{data.translations.requiresLogIn}</p>
{/if}
