<script lang="ts">
    import { people, type Person } from '$lib/client/db/arrays';
    import { call } from '$lib/client/endpoints';
    import { getAllIRs } from '$lib/client/incrementalUpdates';
    import {
        adminDescriptions,
        type LoyaltyProgramUserDataWithPerson
    } from '$lib/client/loyaltyProgram';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';
    import { Spinner } from '$lib/components/ui/spinner';
    import Widget from '$lib/components/Widget.svelte';
    import type { IR } from '$lib/data';
    import { newInputWidget, newSearchWidget } from '$lib/forms/Widget';
    import { datetimeFromISO, nowISO } from '$lib/helpers/date';
    import { irLabel, irName } from '$lib/helpers/ir';
    import { detailUrlIR } from '$lib/helpers/runes.svelte';
    import { storable } from '$lib/helpers/stores';
    import { getTranslations } from '$lib/translations';
    import { Check, OctagonAlert, PencilRuler, Trash2 } from '@lucide/svelte';
    import { derived } from 'svelte/store';
    import writeXlsxFile from 'write-excel-file';

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

    const results = storable<{ date: string, data: Record<string, LoyaltyProgramUserDataWithPerson> }>('loyalty_data2');
    let status = $state('none' as 'none' | 'loading' | 'fail' | 'success');
    let statusA = $state('none' as 'none' | 'mistake' | 'loading' | 'fail' | 'success');
    let showAllErrors = $state(false);

    const search = async () => {
        status = 'loading';
        try {
            const data = await call('db/admin/getAllLoyaltyProgramData');

            status = 'success';
            $results = { date: new Date().toISOString(), data };
        } catch (e) {
            console.error(e);
            return status = 'fail';
        }
    };
    const add = async () => {
        showAllErrors = true;
        if (dateW.isError({}, date) || pointsW.isError({}, points) || userW.isError({}, user)) return statusA = 'mistake';
        statusA = 'loading';
        try {
            await call('db/admin/addLoyaltyProgramTransaction', {
                userEmail: user!.email,
                transaction: {
                    addition: points.toNumber(),
                    type: 'other',
                    note: note,
                    irid: installation?.meta?.id,
                    timestamp: date,
                },
            });
            statusA = 'success';
        } catch (e) {
            console.error(e);
            statusA = 'fail';
        }
    };

    const download = async () => {
        await search();
        const rows = $results!.data
            .getValues()
            .filter(({ email }) => !!email && !email.split('@')[1].includes('regulus'))
            .filter(({ email }) => email != 'radek.blaha@mensa.cz' && email != 'aja.blahova@centrum.cz')
            .sortedByDescending(({ points }) => points)
            .map(({ email, points, responsiblePerson }) => [email, points, responsiblePerson ?? '']);
        const headers = ['Email', 'Body', 'Zodpovědná osoba Regulus'];
        await writeXlsxFile([headers, ...rows].map(r => r.map(value => ({ value }))), {
            fileName: `Věrnostní program ${$results!.date.split('T')[0]}.xlsx`,
        });
    }
</script>

<h3>Přičtení bodů</h3>

<div class="grid gap-1">
    <Widget bind:value={user} context={{}} {showAllErrors} t={cs} widget={userW}/>
    <Widget bind:value={points} context={{}} {showAllErrors} t={cs} widget={pointsW}/>
    <Widget bind:value={note} context={{}} {showAllErrors} t={cs} widget={noteW}/>
    <Widget bind:value={date} context={{}} {showAllErrors} t={cs} widget={dateW}/>
    <Widget bind:value={installation} context={{}} {showAllErrors} t={cs} widget={installationW}/>
</div>

<Button onclick={add}>Přičíst</Button>

{#if statusA === 'loading'}
    <Alert>
        <Spinner/>
        <AlertTitle>Odesílání dat</AlertTitle>
    </Alert>
{:else if statusA === 'fail'}
    <Alert variant="danger">
        <OctagonAlert/>
        <AlertTitle>Něco se nepovedlo</AlertTitle>
    </Alert>
{:else if statusA === 'mistake'}
    <Alert variant="danger">
        <OctagonAlert/>
        <AlertTitle>Špatně zadaná data!</AlertTitle>
    </Alert>
{:else if statusA === 'success'}
    <Alert variant="success">
        <Check/>
        <AlertTitle>Úspěšně přičteno!</AlertTitle>
    </Alert>
{/if}

<h3>Statistiky a historie věrnostních bodů uživatelů</h3>

<Button onclick={search}>Vyhledat</Button>

<button class="btn btn-secondary" onclick={download}>
    Stáhnout
</button>

{#if status === 'loading'}
    <Alert>
        <Spinner/>
        <AlertTitle>Odesílání dat</AlertTitle>
    </Alert>
{:else if status === 'fail'}
    <Alert variant="danger">
        <OctagonAlert/>
        <AlertTitle>Něco se nepovedlo</AlertTitle>
    </Alert>
{:else if status === 'success'}
    <Alert variant="success">
        <Check/>
        <AlertTitle>Úspěšně nalezeno!</AlertTitle>
    </Alert>
{/if}

{#if $results}
    <p>Zobrazena data z {datetimeFromISO($results.date)}</p>
    {#if !$results.data.entries().length}
        <p>Žádná data</p>
    {/if}
    {#each $results.data.entries().sortedBy(([email]) => email) as [email, data] (email)}
        <details class="w-full">
            <summary class="cursor-pointer">
                <Button variant="link" class="px-0" href="#users-{email}">{email}</Button>
                : {data.points.toLocaleString('cs')}
            </summary>
            {#each data.history as entry}
                {#if entry.type === 'other'}
                    <p>{datetimeFromISO(entry.timestamp)}: {entry.addition} b. – {entry.note}
                        {#if entry.irid} (<a href="{detailUrlIR(entry.irid)}">{entry.irid}</a>){/if}
                    </p>
                {:else}
                    <p>{datetimeFromISO(entry.timestamp)}: {entry.addition} b. – {adminDescriptions[entry.type]}
                        {#if entry.irid}u <a href="{detailUrlIR(entry.irid)}">{entry.irid}</a>{/if}
                        {#if entry.note}({entry.note}){/if}
                    </p>
                {/if}
            {/each}
        </details>
    {/each}
{/if}