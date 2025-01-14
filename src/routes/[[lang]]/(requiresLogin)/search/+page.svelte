<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { getAll } from '$lib/client/firestore';
    import { relUrl } from '$lib/helpers/stores';
    import { addToHistory, history, removeFromHistory, HistoryEntry } from '$lib/History';
    import type { Translations } from '$lib/translations';
    import { onMount } from 'svelte';
    import { p, SearchWidget } from '$lib/Vec.svelte';
    import Search from './Search.svelte';

    onMount(async () => {
        const res = await getAll();
        const all = res.docs
            .map((sn) => sn.data())
            .map((data) => HistoryEntry(t, data.evidence))
            .toSorted((a, b) => a.ir.localeCompare(b.ir));
        w.items = () => all
    });


    const t: Translations = $page.data.translations;

    let w = $state(new SearchWidget({
        type: 'search',
        label: 'search',
        items: [] as HistoryEntry[],
        getSearchItem: he => ({
            href: $relUrl(`/detail/${he.ir.replace(' ', '')}`),
            pieces: [
                { text: p`${he.irType} ${he.ir}`, width: .4 },
                { text: p`${he.label}`, width: .6 },
            ] as const,
        })
    }));

    $effect(() => {
        const he = w.value;
        if (he) {
            addToHistory(he);
            goto($relUrl(`/detail/${he.ir.replace(' ', '')}`));
        }
    })
</script>

<h1>{t.controllerSearch}</h1>
<Search
    data={{}}
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
                    href={$relUrl(`/detail/${ir.ir.replace(' ', '')}`)}
                    onclick={(e) => {
						e.preventDefault();
						addToHistory(ir);
						goto($relUrl(`/detail/${ir.ir.replace(' ', '')}`));
					}}
                >
                    <div class="col-md-5">{ir.irType} {ir.ir}</div>
                    <div class="col-md-7">{ir.label}</div>
                </a>
                <button
                    class="btn btn-outline-danger rl-0"
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
