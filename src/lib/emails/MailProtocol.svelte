<script lang="ts">
    export type Props = { name: string, url: string }
    const { name, url }: Props = $props();
</script>

<p>Odkaz: <a href={url}>{url}</a></p>
<p>Autor: {name}</p>
