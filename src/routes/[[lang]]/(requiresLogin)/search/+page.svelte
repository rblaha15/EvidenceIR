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

    type Installation_PublicServiceProtocol = {
        irid_spid: IRID | SPID,
        label: string,
        irName_spName: string,
    }
    type Loading = 'loading'

    onMount(async () => {
        const installationsSnapshot = await getAll();
        const installations = installationsSnapshot.docs
            .map(snapshot => snapshot.data())
            .map(data => ({
                irid_spid: extractIRIDFromRawData(data.evidence),
                irName_spName: irName(data.evidence.ir),
                label: irLabel(data.evidence),
            } satisfies Installation_PublicServiceProtocol))
            .filter(i => i.irid_spid)
            .toSorted((a, b) => a.irid_spid.localeCompare(b.irid_spid));

        let protocols: Installation_PublicServiceProtocol[];

        if (!$isUserRegulusOrAdmin) protocols = [];
        else {
            const protocolsSnapshot = await publicProtocols();
            protocols = protocolsSnapshot.docs
                .map(snapshot => snapshot.data())
                .map(data => ({
                    irid_spid: extractSPIDFromRawData(data.zasah),
                    irName_spName: spName(data.zasah),
                    label: irLabel(data),
                } satisfies Installation_PublicServiceProtocol))
                .filter(i => i.irid_spid)
                .toSorted((a, b) => -a.irid_spid.localeCompare(b.irid_spid));
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
            href: relUrl(`/detail/${i.irid_spid}`),
            pieces: [
                { text: p(i.irName_spName), width: .4 },
                { text: p(i.label), width: .6 },
            ] as const,
        }),
        onValueSet: (_, i) => {
            if (i && i != 'loading') goto(relUrl(`/detail/${i.irid_spid}`));
        },
        inline: true,
    }));

    setTitle(t.controllerSearch);
</script>

<Search
    bind:widget={w}
    data={undefined}
    {t}
/>