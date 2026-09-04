<script lang="ts">
    import { goto } from '$app/navigation';
    import { isRegulusOrAdmin } from '$lib/client/auth';
    import { resetStores } from '$lib/client/incrementalUpdates';
    import { isOnline } from '$lib/client/online';
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
    } from '$lib/components/ui/alert-dialog';
    import { buttonVariants } from '$lib/components/ui/button';
    import { Spinner } from '$lib/components/ui/spinner';
    import Search from '$lib/components/widgets/Search.svelte';
    import { newSearchWidget } from '$lib/forms/Widget';
    import { setTitle } from '$lib/helpers/globals.js';
    import { detailUrlIR, detailUrlNSP } from '$lib/helpers/runes.svelte';
    import { PencilRuler, Trash2 } from '@lucide/svelte';
    import { onMount } from 'svelte';
    import { derived, readable } from 'svelte/store';
    import type { PageProps } from './$types';

    const { data }: PageProps = $props();

    const t = $derived(data.translations);
    const ts = $derived(t.search);

    const statusStore = $derived(data.data ? derived(data.data, data => data.status) : readable('loaded'));
    const itemsStore = $derived(data.data ? derived(data.data, data => data.items) : readable([]));

    const w = newSearchWidget({
        type: 'search',
        required: false,
        label: '',
        items: () => itemsStore,
        getSearchItem: i => ({
            href: i.t == 'NSP' ? detailUrlNSP(i.id) : detailUrlIR(i.id),
            pieces: [
                {
                    text: i.name, width: .4,
                    icon: i.deleted ? Trash2 : i.draft ? PencilRuler : undefined,
                    danger: i.deleted,
                    warning: i.draft,
                },
                { text: i.label, width: .6 },
            ] as const,
            otherSearchParts: [
                ...i.t == 'NSP' ? i.id : [i.id],
                ...i.sps,
                `${i.name} : ${i.label}`,
            ],
        }),
        onValueSet: (_, i) => {
            if (i) goto(i.t == 'NSP' ? detailUrlNSP(i.id) : detailUrlIR(i.id));
        },
        inline: true,
    });
    let v = $state(w.defaultValue);

    onMount(() => setTitle(t.search.title));

    const clear = () => {
        resetStores();
        location.reload();
    };
</script>

<div class="flex flex-wrap items-center gap-2">
    <p>{ts.whatToSearch}</p>
    <div class="flex items-center gap-2 ms-auto">
        {#if $statusStore === 'loadingOnline' && $isOnline}
            <Spinner class="size-6" />
            {ts.downloadingChanges}
        {/if}
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
                    <AlertDialogCancel variant="primary">{ts.cancel}</AlertDialogCancel>
                    <AlertDialogAction onclick={clear} variant="warning">{ts.clear}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
</div>

<Search
    bind:value={v}
    context={{}}
    showAllErrors={true}
    {t}
    widget={w}
/>