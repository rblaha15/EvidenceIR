<script lang="ts">
    export type Props = { name: string, origin: string, irid_spid: string }
    const { name, origin, irid_spid }: Props = $props();
</script>

<p>Odkaz: <a href={origin + `/detail/${irid_spid}`}>{origin + `/detail/${irid_spid}`}</a></p>
<p>Autor: {name}</p>
