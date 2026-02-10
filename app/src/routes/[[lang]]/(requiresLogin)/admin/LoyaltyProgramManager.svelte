<script lang="ts">
    import { getToken } from '$lib/client/auth';
    import { adminDescriptions, type LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
    import { detailIrUrl } from '$lib/helpers/runes.svelte';
    import { datetimeFromISO, nowISO } from '$lib/helpers/date';
    import { InputWidget, SearchWidget } from '$lib/forms/Widget.svelte';
    import { type Person, usersList } from '$lib/client/realtime';
    import type { IR } from '$lib/data';
    import { derived } from 'svelte/store';
    import { irLabel, irName } from '$lib/helpers/ir';
    import Widget from '$lib/components/Widget.svelte';
    import { getTranslations } from '$lib/translations';
    import { getAllIRs } from '$lib/client/incrementalUpdates';
    import { storable } from '$lib/helpers/stores';

    let user = $state(new SearchWidget<unknown, Person>({
        label: 'Uživatel', items: usersList, getSearchItem: i => ({
            pieces: [
                { text: i.email },
            ],
        }),
    }));
    let points = $state(new InputWidget({
        type: 'number', label: 'Počet bodů k přičtení (může být záporný)',
    }));
    let note = $state(new InputWidget({
        label: 'Poznámka', required: false,
    }));
    let date = $state(new InputWidget({
        type: 'datetime-local', label: 'Datum a čas (UTC)', text: nowISO(true),
    }));
    let installation = $state(new SearchWidget<unknown, IR>({
        label: 'Související instalace (pokud je)', required: false,
        items: derived(getAllIRs(), irs => irs.data), getSearchItem: i => ({
            pieces: [
                {
                    text: irName(i.IN.ir), width: .4,
                    icon: i.deleted ? 'delete' : i.isDraft ? 'design_services' : undefined,
                    iconColor: i.deleted ? 'danger' : i.isDraft ? 'warning' : undefined,
                },
                { text: irLabel(i.IN), width: .6 },
            ] as const,
            otherSearchParts: [
                i.meta.id,
            ],
        }),
    }));

    const cs = getTranslations('cs');

    const results = storable<{ date: string, data: Record<string, LoyaltyProgramUserData> }>('loyalty_data');
    let status = $state('none' as 'none' | 'loading' | 'fail' | 'success');
    let statusA = $state('none' as 'none' | 'mistake' | 'loading' | 'fail' | 'success');

    const search = async () => {
        status = 'loading';
        const token = await getToken();
        const response = await fetch(`/api/loyalty-program?token=${token}`);
        if (!response.ok) return status = 'fail';
        status = 'success';
        $results = { date: new Date().toISOString(), data: await response.json() };
    };
    const add = async () => {
        date.displayErrorVeto = true;
        points.displayErrorVeto = true;
        user.displayErrorVeto = true;
        if (date.showError({}) || points.showError({}) || user.showError({})) return statusA = 'mistake';
        statusA = 'loading';
        const token = await getToken();
        const response = await fetch(`/api/loyalty-program?token=${token}`, {
            method: 'POST',
            body: JSON.stringify({
                userEmail: user.value!.email,
                transaction: {
                    addition: points.value.toNumber(),
                    type: 'other',
                    note: note.value,
                    irid: installation.value?.meta?.id,
                    timestamp: date.value,
                },
            })
        });
        if (!response.ok) statusA = 'fail';
        else statusA = 'success';
    };
</script>

<h3>Přičtení bodů</h3>

<div class="d-flex flex-column gap-1">
    <div class="">
        <Widget bind:widget={user} data={undefined} t={cs} />
    </div>
    <div class="">
        <Widget bind:widget={points} data={undefined} t={cs} />
    </div>
    <div class="">
        <Widget bind:widget={note} data={undefined} t={cs} />
    </div>
    <div class="">
        <Widget bind:widget={date} data={undefined} t={cs} />
    </div>
    <div class="">
        <Widget bind:widget={installation} data={undefined} t={cs} />
    </div>
</div>

<button class="btn btn-primary" onclick={add}>
    Přičíst
</button>

{#if statusA === 'loading'}
    <div class="spinner-border text-danger"></div>
{:else if statusA === 'fail'}
    <p class="m-0 text-danger">Něco se nepovedlo</p>
{:else if statusA === 'mistake'}
    <p class="m-0 text-danger">Špatně zadaná data!</p>
{:else if statusA === 'success'}
    <p class="m-0 text-success">Úspěšně přičteno!</p>
{/if}

<h3>Statistiky a historie věrnostních bodů uživatelů</h3>

<button class="btn btn-primary" onclick={search}>
    Vyhledat
</button>

{#if status === 'loading'}
    <div class="spinner-border text-danger"></div>
{:else if status === 'fail'}
    <p class="m-0 text-danger">Něco se nepovedlo</p>
{:else if status === 'success'}
    <p class="m-0 text-success">Úspěšně nalezeno!</p>
{/if}

{#if $results}
    <p>Zobrazena data z {datetimeFromISO($results.date)}</p>
    {#if !$results.data.entries().length}
        <p>Žádná data</p>
    {/if}
    {#each $results.data.entries().toSorted((a, b) => a[0].localeCompare(b[0])) as [email, data]}
        <details>
            <summary><a href="#users-{email}">{email}</a>: {data.points.toLocaleString('cs')}</summary>
            {#each data.history as entry}
                {#if entry.type === 'other'}
                    <p class="m-0">{datetimeFromISO(entry.timestamp)}: {entry.addition} b. – {entry.note} {#if entry.irid} (<a href="{detailIrUrl(entry.irid)}">{entry.irid}</a>){/if}</p>
                {:else}
                    <p class="m-0">{datetimeFromISO(entry.timestamp)}: {entry.addition} b. – {adminDescriptions[entry.type]} {#if entry.irid}u <a href="{detailIrUrl(entry.irid)}">{entry.irid}</a>{/if} {#if entry.note}({entry.note}){/if}</p>
                {/if}
            {/each}
        </details>
    {/each}
{/if}