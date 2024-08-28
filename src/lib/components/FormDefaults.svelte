<script>
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
</script>

{#if browser}
	{#each $page.url.searchParams.toString().split('&') as param}
		<input
			type="hidden"
			name={param.split('=')[0]}
			value={decodeURIComponent(param.split('=')[1])}
		/>
	{/each}
{/if}
