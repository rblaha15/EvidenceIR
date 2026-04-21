<script lang="ts">
    import { goto } from '$app/navigation';
    import Search from '$lib/components/widgets/Search.svelte';
    import { setTitle } from '$lib/helpers/globals.js';
    import { detailIrUrl, detailSpUrl } from '$lib/helpers/runes.svelte';
    import { isUserRegulusOrAdmin } from '$lib/client/auth';
    import type { PageProps } from './$types';
    import { isOnline } from '$lib/client/realtimeOnline';
    import { resetStores } from '$lib/client/incrementalUpdates';
    import { derived, readable } from 'svelte/store';
    import { analytics } from '../../../../hooks.client';
    import { logEvent } from 'firebase/analytics';
    import { newSearchWidget } from '$lib/forms/Widget';
    import { PencilRuler, Trash2 } from "@lucide/svelte";
    import { onMount } from "svelte";
    import {
        AlertDialog,
        AlertDialogAction,
        AlertDialogCancel,
        AlertDialogContent,
        AlertDialogDescription,
        AlertDialogFooter,
        AlertDialogHeader,
        AlertDialogTitle,
        AlertDialogTrigger
    } from "$lib/components/ui/alert-dialog";
    import { buttonVariants } from "$lib/components/ui/button";
    import { Spinner } from "$lib/components/ui/spinner";

    const { data }: PageProps = $props()

    const t = $derived(data.translations);
    const ts = $derived(t.search);

    const statusStore = $derived(data.data ? derived(data.data, data => data.status) : readable('loaded'));
    const itemsStore = $derived(data.data ? derived(data.data, data => data.items) : readable([]));

    const w = newSearchWidget({
        type: 'search',
        required: false,
        label: t => t.search.search,
        items: () => itemsStore,
        getSearchItem: i => ({
            href: i.t == 'NSP' ? detailSpUrl(i.id) : detailIrUrl(i.id),
            pieces: [
                {
                    text: i.name, width: .4,
                    icon: i.deleted ? Trash2 : i.draft ? PencilRuler : undefined,
                    destructive: i.deleted,
                    warning: i.draft,
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
    });
    let v = $state(w.defaultValue);

    onMount(() => setTitle($isUserRegulusOrAdmin ? t.search.titleControllersAndProtocols : t.search.titleControllers))

    const clear = () => {
        logEvent(analytics(), 'clearSearchCaches');
        resetStores();
        location.reload();
    }
</script>

<div class="flex flex-wrap justify-between">
    <div class="flex items-center gap-2">
        {#if $statusStore === 'loadingOnline' && $isOnline}
            <Spinner class="size-6" />
            {ts.downloadingChanges}
        {/if}
    </div>
    <AlertDialog>
        <AlertDialogTrigger class={buttonVariants({ variant: 'ghost' })}>
            {ts.searchProblems}
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>{ts.searchProblemsTitle}</AlertDialogTitle>
                <AlertDialogDescription>{ts.searchProblemsAdvice}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel variant="default">{ts.cancel}</AlertDialogCancel>
                <AlertDialogAction onclick={clear} variant="warning">{ts.clear}</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</div>

<Search
    bind:value={v}
    context={{}}
    showAllErrors={true}
    {t}
    widget={w}
/>