<script lang="ts">
    import { goto } from '$app/navigation';
    import { p } from '$lib/translations';
    import { SearchWidget } from '$lib/forms/Widget.svelte.js';
    import Search from '$lib/components/widgets/Search.svelte';
    import { setTitle } from '$lib/helpers/globals.js';
    import { detailIrUrl, detailSpUrl } from '$lib/helpers/runes.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props()

    const t = data.translations;

    let w = $state(new SearchWidget({
        type: 'search',
        required: false,
        label: 'search',
        items: _ => data.items,
        getSearchItem: i => ({
            href: i.t == 'SP' ? detailSpUrl(i.id) : detailIrUrl(i.id),
            pieces: [
                { text: p(i.name), width: .4 },
                { text: p(i.label), width: .6 },
            ] as const,
        }),
        onValueSet: (_, i) => {
            if (i) goto(i.t == 'SP' ? detailSpUrl(i.id) : detailIrUrl(i.id));
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