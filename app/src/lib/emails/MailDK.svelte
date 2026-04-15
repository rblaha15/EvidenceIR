<script lang="ts">
    type Props = { name: string, url: string, company: string | null, irWholeName: string }
    const { name, url, company, irWholeName }: Props = $props();
</script>

<p>Instalace: {irWholeName}</p>
{#if company}
    <p>Kontrolor: {company}</p>
{/if}

<p>Odkaz: <a href={url}>{url}</a></p>
<p>Autor: {name}</p>
