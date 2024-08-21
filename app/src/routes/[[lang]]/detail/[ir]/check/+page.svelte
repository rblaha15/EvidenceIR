<script lang="ts">
	import { arrayFrom, kontrola, nazvyKontrol, type KontrolaAsRecord, type NazvyAsRecord } from '$lib/Kontrola';

	const k = kontrola('cs') as KontrolaAsRecord;
    const n = nazvyKontrol as NazvyAsRecord
</script>

{#each arrayFrom(k) as v}
	{#if v.type == 'nadpis'}
		<h2>{v.value}</h2>
	{:else if v.type == 'boolean'}
    <label>
        <input type="checkbox" on:change={e=>{
            
        }} />
        {n[v.key1][v.key2]}
    </label>
    {/if}
{/each}
