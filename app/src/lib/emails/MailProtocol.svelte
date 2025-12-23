<script lang="ts">
    export type Props = { name: string, url: string, discountReason?: string }
    const { name, url, discountReason }: Props = $props();
</script>

{#if discountReason}
    <p>Důvod slevy: {discountReason}</p>
{/if}

<p>Odkaz: <a href={url}>{url}</a></p>
<p>Autor: {name}</p>
