<script lang="ts">
    import type { PageProps } from './$types';
    import Signing from '$lib/features/signing/components/Signing.svelte';

    const { data }: PageProps = $props();
</script>

{#if data.def}
    <Signing {...data} />
{/if}