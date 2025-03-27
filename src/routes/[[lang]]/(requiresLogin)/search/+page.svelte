<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/state';
    import { getAll, IRNumberFromIRID } from '$lib/client/firestore';
    import { addToHistory, history, removeFromHistory, HistoryEntry } from '$lib/History';
    import type { Translations } from '$lib/translations';
    import { onMount } from 'svelte';
    import { p, SearchWidget } from '$lib/Widget.svelte.js';
    import Search from './Search.svelte';
    import { setTitle } from '$lib/helpers/title.svelte';
    import { relUrl } from '$lib/helpers/runes.svelte';

    onMount(async () => {
        const res = await getAll();
        const all = res.docs
            .map((sn) => sn.data())
            .map((data) => HistoryEntry(data.evidence))
            .filter((he) => he.irid)
            .toSorted((a, b) => a.irid.localeCompare(b.irid));
        w.items = () => all
    });

    const t: Translations = page.data.translations;

    let w = $state(new SearchWidget({
        type: 'search',
        required: false,
        label: 'search',
        items: [] as HistoryEntry[],
        getSearchItem: he => ({
            href: relUrl(`/detail/${he.irid}`),
            pieces: [
                { text: p`${he.irType} ${IRNumberFromIRID(he.irid)}`, width: .4 },
                { text: p`${he.label}`, width: .6 },
            ] as const,
        })
    }));

    $effect(() => {
        const he = w.value;
        if (he) {
            addToHistory(he);
            goto(relUrl(`/detail/${he.irid}`));
        }
    })

    setTitle(t.controllerSearch)
</script>

<Search
    data={undefined}
    {t}
    bind:widget={w}
/>

{#if $history.length !== 0}
    <h2 class="mt-2">Historie vyhledávání</h2>
    <div class="list-group">
        {#each $history.toReversed() as ir}
            <div class="d-flex list-group-item-group flex-nowrap">
                <a
                    class="list-group-item-action list-group-item d-flex flex-column flex-md-row flex-row align-items-md-center"
                    href={relUrl(`/detail/${ir.irid}`)}
                    onclick={(e) => {
						e.preventDefault();
						addToHistory(ir);
						goto(relUrl(`/detail/${ir.irid}`));
					}}
                >
                    <div class="col-md-5">{ir.irType} {IRNumberFromIRID(ir.irid)}</div>
                    <div class="col-md-7">{ir.label}</div>
                </a>
                <button
                    class="btn btn-danger rl-0"
                    aria-label="Odstarnit"
                    onclick={(e) => {
						e.preventDefault();
						e.stopImmediatePropagation();
						removeFromHistory(ir);
					}}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path
                            d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"
                        />
                    </svg>
                </button>
            </div>
        {/each}
    </div>
{/if}

<style>
    .rl-0 {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .list-group-item-group:first-child .list-group-item {
        border-top-left-radius: var(--bs-border-radius);
    }

    .list-group-item-group .list-group-item {
        border-right: none;
    }

    .list-group-item-group:not(:last-child) .list-group-item {
        border-bottom: none;
    }

    .list-group-item-group:last-child .list-group-item {
        border-bottom-left-radius: var(--bs-border-radius);
    }

    .list-group-item-group:not(:last-child) .btn {
        border-bottom: none;
    }

    .list-group-item-group:not(:last-child) .btn {
        border-bottom-right-radius: 0;
    }

    .list-group-item-group:not(:first-child) .btn {
        border-top-right-radius: 0;
    }
</style>
