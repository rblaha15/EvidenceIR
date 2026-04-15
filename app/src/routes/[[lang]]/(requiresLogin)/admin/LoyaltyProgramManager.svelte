<script lang="ts">
    import { getToken } from '$lib/client/auth';
    import { adminDescriptions, type LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
    import { detailIrUrl } from '$lib/helpers/runes.svelte';
    import { datetimeFromISO, nowISO } from '$lib/helpers/date';
    import { type Person, usersList } from '$lib/client/realtime';
    import type { IR } from '$lib/data';
    import { derived } from 'svelte/store';
    import { irLabel, irName } from '$lib/helpers/ir';
    import Widget from '$lib/components/Widget.svelte';
    import { getTranslations } from '$lib/translations';
    import { getAllIRs } from '$lib/client/incrementalUpdates';
    import { storable } from '$lib/helpers/stores';
    import { newInputWidget, newSearchWidget } from '$lib/forms/Widget';
    import Button from '$lib/components/Button.svelte';

    const userW = newSearchWidget<unknown, Person>({
        label: 'Uživatel', items: usersList, getSearchItem: i => ({
            pieces: [
                { text: i.email },
            ],
        }),
    });
    let user = $state(userW.defaultValue);
    const pointsW = newInputWidget({
        type: 'number', label: 'Počet bodů k přičtení (může být záporný)',
    });
    let points = $state(pointsW.defaultValue);
    const noteW = newInputWidget({
        label: 'Poznámka', required: false,
    });
    let note = $state(noteW.defaultValue);
    const dateW = newInputWidget({
        type: 'datetime-local', label: 'Datum a čas (UTC)', text: nowISO(true),
    });
    let date = $state(dateW.defaultValue);
    const installationW = newSearchWidget<unknown, IR>({
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
    });
    let installation = $state(installationW.defaultValue);

    const cs = getTranslations('cs');

    const results = storable<{ date: string, data: Record<string, { email?: string, data: LoyaltyProgramUserData }> }>('loyalty_data2');
    let status = $state('none' as 'none' | 'loading' | 'fail' | 'success');
    let statusA = $state('none' as 'none' | 'mistake' | 'loading' | 'fail' | 'success');
    let showAllErrors = $state(false);

    const search = async () => {
        status = 'loading';
        const token = await getToken();
        const response = await fetch(`/api/loyalty-program?token=${token}`);
        if (!response.ok) return status = 'fail';
        status = 'success';
        $results = { date: new Date().toISOString(), data: await response.json() };
    };
    const add = async () => {
        showAllErrors = true;
        if (dateW.isError({}, date) || pointsW.isError({}, points) || userW.isError({}, user)) return statusA = 'mistake';
        statusA = 'loading';
        const token = await getToken();
        const response = await fetch(`/api/loyalty-program?token=${token}`, {
            method: 'POST',
            body: JSON.stringify({
                userEmail: user!.email,
                transaction: {
                    addition: points.toNumber(),
                    type: 'other',
                    note: note,
                    irid: installation?.meta?.id,
                    timestamp: date,
                },
            })
        });
        if (!response.ok) statusA = 'fail';
        else statusA = 'success';
    };
</script>

<h3>Přičtení bodů</h3>

<div class="flex flex-col gap-1">
    <div class="">
        <Widget widget={userW} bind:value={user} context={{}} t={cs} {showAllErrors} />
    </div>
    <div class="">
        <Widget widget={pointsW} bind:value={points} context={{}} t={cs} {showAllErrors} />
    </div>
    <div class="">
        <Widget widget={noteW} bind:value={note} context={{}} t={cs} {showAllErrors} />
    </div>
    <div class="">
        <Widget widget={dateW} bind:value={date} context={{}} t={cs} {showAllErrors} />
    </div>
    <div class="">
        <Widget widget={installationW} bind:value={installation} context={{}} t={cs} {showAllErrors} />
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
    {#each $results.data.entries().toSorted((a, b) => a[0].localeCompare(b[0])) as [uid, { email, data }]}
        <details>
            <summary><a href="#users-{email}">{email}</a>: {data.points.toLocaleString('cs')}</summary>
            <Button text="Otevřít v databázi" link icon="cloud_circle" href={`https://console.firebase.google.com/u/0/project/evidence-ir/database/evidence-ir-default-rtdb/data/~2FloyaltyProgram~2F${uid}`} />
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