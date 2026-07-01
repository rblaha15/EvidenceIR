<script lang="ts">
    import { people, type Person } from '$lib/client/db/arrays';
    import { adminDescriptions, type LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
    import { detailUrlIR } from '$lib/helpers/runes.svelte';
    import { datetimeFromISO, nowISO } from '$lib/helpers/date';
    import type { IR } from '$lib/data';
    import { derived } from 'svelte/store';
    import { irLabel, irName } from '$lib/helpers/ir';
    import Widget from '$lib/components/Widget.svelte';
    import { getTranslations } from '$lib/translations';
    import { getAllIRs } from '$lib/client/incrementalUpdates';
    import { storable } from '$lib/helpers/stores';
    import { newInputWidget, newSearchWidget } from '$lib/forms/Widget';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { Spinner } from "$lib/components/ui/spinner";
    import { Button } from "$lib/components/ui/button";
    import { PencilRuler, Server, Trash2, OctagonAlert, Check } from "@lucide/svelte";

    const userW = newSearchWidget<unknown, Person>({
        label: 'Uživatel', items: people, getSearchItem: i => ({
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
                    icon: i.deleted ? Trash2 : i.isDraft ? PencilRuler : undefined,
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
        const response = await fetch(`/api/loyalty-program`);
        if (!response.ok) return status = 'fail';
        status = 'success';
        $results = { date: new Date().toISOString(), data: await response.json() };
    };
    const add = async () => {
        showAllErrors = true;
        if (dateW.isError({}, date) || pointsW.isError({}, points) || userW.isError({}, user)) return statusA = 'mistake';
        statusA = 'loading';
        const response = await fetch(`/api/loyalty-program`, {
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

<div class="grid gap-1">
    <Widget widget={userW} bind:value={user} context={{}} t={cs} {showAllErrors} />
    <Widget widget={pointsW} bind:value={points} context={{}} t={cs} {showAllErrors} />
    <Widget widget={noteW} bind:value={note} context={{}} t={cs} {showAllErrors} />
    <Widget widget={dateW} bind:value={date} context={{}} t={cs} {showAllErrors} />
    <Widget widget={installationW} bind:value={installation} context={{}} t={cs} {showAllErrors} />
</div>

<Button onclick={add}>Přičíst</Button>

{#if statusA === 'loading'}
    <Alert>
        <Spinner />
        <AlertTitle>Odesílání dat</AlertTitle>
    </Alert>
{:else if statusA === 'fail'}
    <Alert variant="danger">
        <OctagonAlert />
        <AlertTitle>Něco se nepovedlo</AlertTitle>
    </Alert>
{:else if statusA === 'mistake'}
    <Alert variant="danger">
        <OctagonAlert />
        <AlertTitle>Špatně zadaná data!</AlertTitle>
    </Alert>
{:else if statusA === 'success'}
    <Alert variant="success">
        <Check />
        <AlertTitle>Úspěšně přičteno!</AlertTitle>
    </Alert>
{/if}

<h3>Statistiky a historie věrnostních bodů uživatelů</h3>

<Button onclick={search}>Vyhledat</Button>

{#if status === 'loading'}
    <Alert>
        <Spinner />
        <AlertTitle>Odesílání dat</AlertTitle>
    </Alert>
{:else if status === 'fail'}
    <Alert variant="danger">
        <OctagonAlert />
        <AlertTitle>Něco se nepovedlo</AlertTitle>
    </Alert>
{:else if status === 'success'}
    <Alert variant="success">
        <Check />
        <AlertTitle>Úspěšně nalezeno!</AlertTitle>
    </Alert>
{/if}

{#if $results}
    <p>Zobrazena data z {datetimeFromISO($results.date)}</p>
    {#if !$results.data.entries().length}
        <p>Žádná data</p>
    {/if}
    {#each $results.data.entries().toSorted((a, b) => a[0].localeCompare(b[0])) as [uid, { email, data }]}
        <details class="w-full">
            <summary class="cursor-pointer">
                <Button variant="link" class="px-0" href="#users-{email}">{email}</Button>: {data.points.toLocaleString('cs')}
            </summary>
            <Button variant="link" href={`https://console.firebase.google.com/u/0/project/evidence-ir/database/evidence-ir-default-rtdb/data/~2FloyaltyProgram~2F${uid}`}>
                <Server /> Otevřít v databázi
            </Button>
            {#each data.history as entry}
                {#if entry.type === 'other'}
                    <p>{datetimeFromISO(entry.timestamp)}: {entry.addition} b. – {entry.note} {#if entry.irid} (<a href="{detailUrlIR(entry.irid)}">{entry.irid}</a>){/if}</p>
                {:else}
                    <p>{datetimeFromISO(entry.timestamp)}: {entry.addition} b. – {adminDescriptions[entry.type]} {#if entry.irid}u <a href="{detailUrlIR(entry.irid)}">{entry.irid}</a>{/if} {#if entry.note}({entry.note}){/if}</p>
                {/if}
            {/each}
        </details>
    {/each}
{/if}