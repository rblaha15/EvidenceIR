<script lang="ts">
    import { browser } from '$app/environment';
    import { goto, replaceState } from '$app/navigation';
    import { page } from '$app/state';
    import { resetStores } from '$lib/client/incrementalUpdates';
    import { isOnline } from '$lib/client/online';
    import { textToFilter, wordsToFilter } from '$lib/components/forms/serach/logic';
    import SearchItems from '$lib/components/forms/serach/SearchItems.svelte';
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
    import { InputGroup, InputGroupAddon, InputGroupInput } from '$lib/components/ui/input-group';
    import { Spinner } from '$lib/components/ui/spinner';
    import type { SearchItem } from '$lib/forms/Widget';
    import { setTitle } from '$lib/helpers/globals.js';
    import { detailUrlIR, detailUrlNSP } from '$lib/helpers/runes.svelte';
    import { PencilRuler, Search, Trash2 } from '@lucide/svelte';
    import { onMount, tick } from 'svelte';
    import type { EventHandler } from 'svelte/elements';
    import { derived, readable } from 'svelte/store';
    import type { PageProps } from './$types';
    import type { IR_NSP } from './+page';

    const { data }: PageProps = $props();

    const t = $derived(data.translations);
    const ts = $derived(t.search);

    const status = $derived(data.data ? derived(data.data, data => data.status) : readable('loaded'));
    const items = $derived(data.data ? derived(data.data, data => data.items) : readable([]));

    const getSearchItem = (i: IR_NSP, index: number): SearchItem => ({
        href: i.t == 'NSP' ? detailUrlNSP(i.id) : detailUrlIR(i.id),
        pieces: [
            {
                text: i.name, width: .4,
                icon: i.deleted ? Trash2 : i.draft ? PencilRuler : undefined,
                danger: i.deleted,
                warning: i.draft,
            },
            {
                text: i.label,
                width: .6,
                kbd: index == 0 ? '⏎ Enter' : undefined,
            },
        ] as const,
        otherSearchParts: [
            ...i.t == 'NSP' ? i.id : [i.id],
            ...i.sps,
            `${i.name} : ${i.label}`,
        ],
    });

    onMount(() => setTitle(t.search.title));

    const clear = () => {
        resetStores();
        location.reload();
    };

    let search = $state(page.state.search ?? '');

    let mounted = $state(false);
    onMount(async () => {
        await tick();
        mounted = true;
    })
    $effect(() => {
        search;
        if (browser && mounted)
            replaceState('', { search });
    });

    const filtered = $derived($items.filter(item =>
        wordsToFilter(search).every(
            filter => getSearchItem(item, -1).let(i => [
                ...i.pieces.map(p => p.text),
                ...i.otherSearchParts ?? [],
            ]).some(piece =>
                wordsToFilter(piece).some(word => word.includes(filter)) ||
                (filter.startsWith('!') ? textToFilter(piece).startsWith(filter.slice(1)) : textToFilter(piece).includes(filter)),
            ),
        ),
    ));

    const openFirstResult: EventHandler<SubmitEvent, HTMLFormElement> = e => {
        e.preventDefault();
        if (filtered.length > 0) goto(getSearchItem(filtered[0], 0).href!);
    };
</script>

<div class="flex flex-col gap-4 p-4 border border-input rounded-2xl">
    <div class="flex relative items-center flex-wrap">
        <p>{ts.whatToSearch}</p>
        <div class="flex items-center gap-2 ms-auto">
            {#if $status === 'loadingOnline' && $isOnline}
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

    <form onsubmit={openFirstResult}>
        <InputGroup>
            <InputGroupAddon align="inline-start">
                <Search />
            </InputGroupAddon>
            <InputGroupInput
                autofocus
                bind:value={search}
                type="search"
            />
        </InputGroup>
    </form>
</div>

<SearchItems
    class="list"
    {getSearchItem}
    itemClass="border not-first:border-t-0 first:rounded-t-2xl last:rounded-b-2xl border-input hover:bg-searchbox px-4"
    errorClass="hover:bg-transparent"
    items={filtered}
    {t}
/>