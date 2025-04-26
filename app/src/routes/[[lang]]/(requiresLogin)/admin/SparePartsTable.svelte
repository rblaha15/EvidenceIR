<script lang="ts">
    import type { SparePart } from '$lib/client/realtime';

    interface Props {
        spareParts?: SparePart[],
        sparePartsWithColors?: [SparePart, string][],
    }

    let {
        spareParts,
        sparePartsWithColors,
    }: Props = $props();
    let colors = $state() as string[];
    if (sparePartsWithColors) {
        spareParts = sparePartsWithColors.map(([p]) => p);
        colors = sparePartsWithColors.map(([, c]) => c);
    } else if (spareParts) {
        colors = spareParts.map(() => '');
    } else {
        throw 'No spareParts';
    }
</script>

<div class="overflow-x-auto">
    <table class="table text-break table-striped table-hover text-nowrap">
        <thead>
        <tr>
            <th>Číslo</th>
            <th>Název</th>
            <th>Jednotková cena</th>
        </tr>
        </thead>
        <tbody>
        {#each spareParts as sparePart, i}
            <tr class="table-{colors[i]}">
                <td>{sparePart.code}</td>
                <th>{sparePart.name}</th>
                <td>{sparePart.unitPrice.roundTo(2).toLocaleString('cs')} Kč</td>
            </tr>
        {/each}
        </tbody>
    </table>
</div>