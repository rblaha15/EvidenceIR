<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { getAll } from '$lib/client/firestore';
    import { relUrl } from '$lib/helpers/stores';
    import { addToHistory, history, removeFromHistory, HistoryEntry } from '$lib/History';
    import type { Translations } from '$lib/translations';
    import IMask from 'imask';
    import { onMount } from 'svelte';
    import { wordsToFilter } from '../new/companies';

    let search = $state('');

    let all = $state() as HistoryEntry[];
    onMount(async () => {
        const res = await getAll();
        all = res.docs
            .map((sn) => sn.data())
            .map((data) => HistoryEntry(t, data.evidence))
            .toSorted((a, b) => a.ir.localeCompare(b.ir));
    });

    let filtered = $derived(
        search == " "
            ? all
            : all?.filter((entry) =>
                wordsToFilter(search).every(
                    (filter) =>
                        wordsToFilter(entry.ir).join(' ').includes(filter) ||
                        wordsToFilter(entry.label).some((word) => word.startsWith(filter))
                )
            ) ?? []
    );

    const t: Translations = $page.data.translations;

    let input = $state<HTMLInputElement>();
    let mask = $derived(
        input == undefined
            ? undefined
            : IMask(input, {
                mask: 'A1 0000',
                definitions: {
                    A: /[A-Z]/,
                    '1': /[1-9OND]/
                }
            })
    );

    onMount(() => {
        return () => {
            input = undefined;
        };
    });

    $effect(() => {
        mask?.on('accept', (_) => (search = mask.value));
    });
</script>

<h1>{t.controllerSearch}</h1>
<form
    onsubmit={(e) => {
		e.preventDefault();
		if (search === '' || filtered.length === 0) return;
		const ir = filtered[0];
		addToHistory(ir);
		goto($relUrl(`/detail/${ir.ir.replace(' ', '')}`));
	}}
    class="position-relative"
>
    <label class="form-floating d-block">
        <input
            type="search"
            class="form-control border"
            class:border-bottom-0={filtered.length > 0 && search !== ''}
            class:rb-0={filtered.length > 0 && search !== ''}
            placeholder={t.serialNumber}
            bind:value={search}
        />
        <label for="">{t.search}</label>
    </label>

    {#if search !== '' && filtered.length > 0}
        <div class="list-group position-absolute z-3 w-100 shadow-lg">
            {#each filtered as ir, i}
                <a
                    class="list-group-item-action list-group-item d-flex flex-column flex-md-row flex-row align-items-md-center"
                    class:rt-0={i === 0}
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
            {/each}
        </div>
    {/if}
</form>

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
    .rb-0 {
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
    }

    .rt-0 {
        border-top-left-radius: 0;
        border-top-right-radius: 0;
    }

    .rl-0 {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
    }

    .form-control:focus {
        box-shadow: none;
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
