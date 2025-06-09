<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { extractIRIDFromRawData, extractSPIDFromRawData, getAll, type IRID, publicProtocols, type SPID } from '$lib/client/firestore';
    import { p, type Translations } from '$lib/translations';
    import { onMount } from 'svelte';
    import { SearchWidget } from '$lib/Widget.svelte.js';
    import Search from '$lib/components/widgets/Search.svelte';
    import { setTitle } from '$lib/helpers/title.svelte';
    import { relUrl } from '$lib/helpers/runes.svelte';
    import { irLabel, irName, spName } from '$lib/helpers/ir';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';

    type Installation = {
        irid: IRID,
        label: string,
        irName: string,
    }
    type PublicServiceProtocol = {
        spid: SPID,
        label: string,
        id: string,
    }
    onMount(async () => {
        const installationsSnapshot = await getAll();
        const installations = installationsSnapshot.docs
            .map(snapshot => snapshot.data())
            .map(data => <Installation>{
                irid: extractIRIDFromRawData(data.evidence),
                irName: irName(data.evidence.ir),
                label: irLabel(data.evidence),
            })
            .filter(i => i.irid)
            .toSorted((a, b) => a.irid.localeCompare(b.irid));
        w1.items = () => installations;

        if ($isUserRegulusOrAdmin) {
            const protocolsSnapshot = await publicProtocols();
            const protocols = protocolsSnapshot.docs
                .map(snapshot => snapshot.data())
                .map(data => <PublicServiceProtocol>{
                    spid: extractSPIDFromRawData(data.zasah),
                    label: irLabel(data),
                    id: spName(data.zasah),
                })
                .filter(i => i.spid)
                .toSorted((a, b) => -a.spid.localeCompare(b.spid));
            w2.items = () => protocols;
        }
    });

    const t: Translations = page.data.translations;

    let w1 = $state(new SearchWidget({
        type: 'search',
        required: false,
        label: 'search',
        items: [] as Installation[],
        getSearchItem: i => ({
            href: relUrl(`/detail/${i.irid}`),
            pieces: [
                { text: p(i.irName), width: .4 },
                { text: p(i.label), width: .6 },
            ] as const,
        }),
        onValueSet: (_, i) => {
            if (i) goto(relUrl(`/detail/${i.irid}`));
        },
    }));

    let w2 = $state(new SearchWidget({
        type: 'search',
        required: false,
        label: 'search',
        items: [] as PublicServiceProtocol[],
        getSearchItem: pt => ({
            href: relUrl(`/detail/${pt.spid}`),
            pieces: [
                { text: p(pt.id), width: .4 },
                { text: p(pt.label), width: .6 },
            ] as const,
        }),
        onValueSet: (_, i) => {
            if (i) goto(relUrl(`/detail/${i.spid}`));
        },
    }));

    setTitle(t.controllerSearch);
</script>

<Search
    bind:widget={w1}
    data={undefined}
    {t}
/>

{#if $isUserRegulusOrAdmin}
    <h1 class="m-0">{t.protocolSearch}</h1>

    <Search
        data={undefined}
        {t}
        bind:widget={w2}
    />
{/if}