<script lang="ts">
    type Props = { name: string, url: string, company: string | null }
    const { name, url, company }: Props = $props();
</script>

<p>Instalace: {irWholeName}</p>
{#if company}
    <p>Kontrolor: {company}</p>
{/if}

<p>Odkaz: <a href={url}>{url}</a></p>
<p>Autor: {name}</p>
