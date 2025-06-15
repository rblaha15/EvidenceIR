<script lang="ts">
    export type Props = { name: string, origin: string, id: string }
    const { name, origin, id }: Props = $props();
</script>

<p>Odkaz: <a href={origin + `/detail/${id}`}>{origin + `/detail/${id}`}</a></p>
<p>Autor: {name}</p>
