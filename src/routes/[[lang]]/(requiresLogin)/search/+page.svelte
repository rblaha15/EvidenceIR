<script lang="ts">
    import { goto } from '$app/navigation';
        import { SearchWidget } from '$lib/forms/Widget.svelte.js';
    import Search from '$lib/components/widgets/Search.svelte';
    import { setTitle } from '$lib/helpers/globals.js';
    import { detailIrUrl, detailSpUrl } from '$lib/helpers/runes.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import type { PageProps } from './$types';
    import type { Installation_PublicServiceProtocol } from './+page';

    const { data }: PageProps = $props()

    const t = $derived(data.translations);

    const itemsStore = $derived(data.items);

    let w = $state(new SearchWidget({
        type: 'search',
        required: false,
        label: t => t.search.search,
        items: () => itemsStore,
        getSearchItem: i => ({
            href: i.t == 'SP' ? detailSpUrl(i.id) : detailIrUrl(i.id),
            pieces: [
                {
                    text: i.name, width: .4,
                    icon: i.deleted ? 'delete' : i.draft ? 'design_services' : undefined,
                    iconColor: i.deleted ? 'danger' : i.draft ? 'warning' : undefined,
                },
                { text: i.label, width: .6 },
            ] as const,
            otherSearchParts: [
                ...i.t == 'SP' ? i.id : [i.id],
                ...i.sps,
            ],
        }),
        onValueSet: (_, i) => {
            if (i) goto(i.t == 'SP' ? detailSpUrl(i.id) : detailIrUrl(i.id));
        },
        inline: true,
    }));

    $effect(() => setTitle($isUserRegulusOrAdmin ? t.search.titleControllersAndProtocols : t.search.titleControllers))
</script>

<Search
    bind:widget={w}
    data={undefined}
    {t}
/>