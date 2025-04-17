<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { extractIRIDFromRawData, getAll, type IRID, IRNumberFromIRID } from '$lib/client/firestore';
    import type { Translations } from '$lib/translations';
    import { onMount } from 'svelte';
    import { p, SearchWidget } from '$lib/Widget.svelte.js';
    import Search from '$lib/components/widgets/Search.svelte';
    import { setTitle } from '$lib/helpers/title.svelte';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { popisIR, typIR } from '$lib/helpers/ir';

    type Installation = {
        irid: IRID,
        label: string,
        irType: string,
    }
    onMount(async () => {
        const res = await getAll();
        const all = res.docs
            .map(snapshot => snapshot.data())
            .map(data => <Installation>{
                irid: extractIRIDFromRawData(data.evidence),
                irType: typIR(data.evidence.ir.typ),
                label: popisIR(data.evidence)
            })
            .filter(i => i.irid)
            .toSorted((a, b) => a.irid.localeCompare(b.irid));
        w.items = () => all
    });

    const t: Translations = page.data.translations;

    let w = $state(new SearchWidget({
        type: 'search',
        required: false,
        label: 'search',
        items: [] as Installation[],
        getSearchItem: i => ({
            href: relUrl(`/detail/${i.irid}`),
            pieces: [
                { text: p`${i.irType} ${IRNumberFromIRID(i.irid)}`, width: .4 },
                { text: p`${i.label}`, width: .6 },
            ] as const,
        })
    }));

    $effect(() => {
        const i = w.value;
        if (i) goto(relUrl(`/detail/${i.irid}`));
    })

    setTitle(t.controllerSearch)
</script>

<Search
    data={undefined}
    {t}
    bind:widget={w}
/>