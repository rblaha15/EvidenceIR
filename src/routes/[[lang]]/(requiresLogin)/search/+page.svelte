<script lang="ts">
    import { goto } from '$app/navigation';
    import { SearchWidget } from '$lib/forms/Widget.svelte.js';
    import Search from '$lib/components/widgets/Search.svelte';
    import { setTitle } from '$lib/helpers/globals.js';
    import { detailIrUrl, detailSpUrl } from '$lib/helpers/runes.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import type { PageProps } from './$types';
    import { isOnline } from '$lib/client/realtimeOnline';
    import { resetStores } from '$lib/client/incrementalUpdates';
    import { derived, readable } from 'svelte/store';

    const { data }: PageProps = $props()

    const t = $derived(data.translations);
    const ts = $derived(t.search);

    const statusStore = $derived(data.data ? derived(data.data, data => data.status) : readable('loaded'));
    const itemsStore = $derived(data.data ? derived(data.data, data => data.items) : readable([]));

    let w = $state(new SearchWidget({
        type: 'search',
        required: false,
        label: t => t.search.search,
        items: () => itemsStore,
        getSearchItem: i => ({
            href: i.t == 'NSP' ? detailSpUrl(i.id) : detailIrUrl(i.id),
            pieces: [
                {
                    text: i.name, width: .4,
                    icon: i.deleted ? 'delete' : i.draft ? 'design_services' : undefined,
                    iconColor: i.deleted ? 'danger' : i.draft ? 'warning' : undefined,
                },
                { text: i.label, width: .6 },
            ] as const,
            otherSearchParts: [
                ...i.t == 'NSP' ? i.id : [i.id],
                ...i.sps,
            ],
        }),
        onValueSet: (_, i) => {
            if (i) goto(i.t == 'NSP' ? detailSpUrl(i.id) : detailIrUrl(i.id));
        },
        inline: true,
    }));

    $effect(() => setTitle($isUserRegulusOrAdmin ? t.search.titleControllersAndProtocols : t.search.titleControllers))

    const clear = () => {
        resetStores();
        location.reload();
    }
</script>

<div class="d-flex flex-wrap">
    <div class="d-flex me-auto align-items-center gap-3">
        {#if $statusStore === 'loadingOnline' && $isOnline}
            <div class="spinner-border text-danger"></div>
            <span>{ts.downloadingChanges}</span>
        {/if}
    </div>
    <div class="ms-auto">
        <button class="btn btn-link" data-bs-toggle="modal" data-bs-target="#problemsModal">
            {ts.searchProblems}
        </button>
    </div>
</div>

<Search
    bind:widget={w}
    data={undefined}
    {t}
/>

<div aria-hidden="true" aria-labelledby="problemsModalLabel" class="modal fade" id="problemsModal" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="problemsModalLabel">{ts.searchProblemsTitle}</h1>
                <button aria-label="Close" class="btn-close" data-bs-dismiss="modal" type="button"></button>
            </div>
            <div class="modal-body">
                {ts.searchProblemsAdvice}
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary" data-bs-dismiss="modal" type="button">{ts.cancel}</button>
                <button class="btn btn-warning" data-bs-dismiss="modal" onclick={clear} type="button">{ts.clear}</button>
            </div>
        </div>
    </div>
</div>