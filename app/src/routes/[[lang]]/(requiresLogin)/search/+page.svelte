<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { p, type Translations } from '$lib/translations';
    import { onMount } from 'svelte';
    import { SearchWidget } from '$lib/forms/Widget.svelte.js';
    import Search from '$lib/components/widgets/Search.svelte';
    import { setTitle } from '$lib/helpers/title.svelte';
    import { detailIrUrl, detailSpUrl } from '$lib/helpers/runes.svelte';
    import { extractIRIDFromRawData, extractSPIDFromRawData, type IRID, irLabel, irName, type SPID, spName } from '$lib/helpers/ir';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import db from '$lib/client/data';

    type Installation_PublicServiceProtocol = {
        t: 'IR' | 'SP',
        id: IRID | SPID,
        label: string,
        name: string,
    }
    type Loading = 'loading'

    onMount(async () => {
        const irs = await db.getAllIRs();
        const installations = irs
            .map(ir => ({
                t: 'IR',
                id: extractIRIDFromRawData(ir.evidence),
                name: irName(ir.evidence.ir),
                label: irLabel(ir.evidence),
            } satisfies Installation_PublicServiceProtocol))
            .filter(i => i.id)
            .toSorted((a, b) => a.id.localeCompare(b.id));

        let protocols: Installation_PublicServiceProtocol[];

        if (!$isUserRegulusOrAdmin) protocols = [];
        else {
            const sps = await db.getAllIndependentProtocols();
            protocols = sps
                .map(sp => ({
                    t: 'SP',
                    id: extractSPIDFromRawData(sp.zasah),
                    name: spName(sp.zasah),
                    label: irLabel(sp),
                } satisfies Installation_PublicServiceProtocol))
                .filter(i => i.id)
                .toSorted((a, b) => -a.id.localeCompare(b.id));
        }

        w.items = () => [
            ...installations,
            ...protocols,
        ];
    });

    const t: Translations = page.data.translations;

    let w = $state(new SearchWidget({
        type: 'search',
        required: false,
        label: 'search',
        items: ['loading'] as (Installation_PublicServiceProtocol | Loading)[],
        getSearchItem: i => (i == 'loading' ? {
            pieces: [
                { text: 'loadingData' },
            ] as const,
            disabled: true,
        } : {
            href: (i.t == 'SP' ? detailSpUrl : detailIrUrl)(i.id),
            pieces: [
                { text: p(i.name), width: .4 },
                { text: p(i.label), width: .6 },
            ] as const,
        }),
        onValueSet: (_, i) => {
            if (i && i != 'loading') goto((i.t == 'SP' ? detailSpUrl : detailIrUrl)(i.id));
        },
        inline: true,
    }));

    $effect(() => {
        setTitle($isUserRegulusOrAdmin ? t.controllerAndServiceProtocolSearch : t.controllerSearch);
    })
</script>

<Search
    bind:widget={w}
    data={undefined}
    {t}
/>