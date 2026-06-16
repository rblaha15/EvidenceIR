<script lang="ts">
    import Widget from '$lib/components/Widget.svelte';
    import { getTranslations } from '$lib/translations';
    import { dateFromISO, dayISO } from '$lib/helpers/date';
    import { isSP } from '$lib/forms/SP/infoSP.svelte';
    import { newInputWidget } from '$lib/forms/Widget';
    import { Alert, AlertTitle } from '$lib/components/ui/alert';
    import { OctagonAlert, Check } from '@lucide/svelte';
    import { Spinner } from "$lib/components/ui/spinner";
    import { Button } from "$lib/components/ui/button";
    import { backup } from "$lib/client/db/mongo";

    const fromW = newInputWidget({
        type: 'date', label: 'Od (včetně)', text: dayISO(),
    });
    let from = $state(fromW.defaultValue);
    const toW = newInputWidget({
        type: 'date', label: 'Do (vyjma)', text: dayISO(),
    });
    let to = $state(toW.defaultValue);

    const cs = getTranslations('cs');

    let status = $state('none' as 'none' | 'mistake' | 'loading' | 'fail' | 'success');
    let showAllErrors = $state(false);
    let results = $state<Record<string, number>>({});
    let currentRange = $state<[string, string]>(['', '']);

    const search = async () => {
        showAllErrors = true;
        if (fromW.isError({}, from) || toW.isError({}, to)) return status = 'mistake';
        status = 'loading';
        try {
            const fromD = new Date(from);
            const toD = new Date(to);

            const { irs, nsps } = await backup();

            const allProtocols = [
                ...irs.filter(ir => !ir.deleted).flatMap(ir => ir.SPs.getValues()),
                ...nsps.filter(sp => !sp.deleted).map(sp => sp.NSP),
            ].filter(isSP);

            const namesAndDates = allProtocols.map(p => ({
                name: p.zasah.clovek.trim(),
                initials: p.zasah.inicialy.trim(),
                date: new Date(p.zasah.datum),
            }));

            const filtered = namesAndDates.filter(p =>
                fromD <= p.date && p.date < toD,
            );

            status = 'success';
            results = filtered.groupBy(p => `${p.name} (${p.initials})`)
                .mapValues((_, ps) => ps.length)
                .entries()
                .toSorted(([_, a], [__, b]) => b - a)
                .toRecord();
            currentRange = [dateFromISO(from), dateFromISO(to)];
        } catch (e) {
            console.error(e);
            status = 'fail';
        }
    };
</script>

<div class="flex gap-1">
    <div class="grow">
        <Widget widget={fromW} bind:value={from} context={{}} t={cs} {showAllErrors} />
    </div>
    <div class="grow">
        <Widget widget={toW} bind:value={to} context={{}} t={cs} {showAllErrors} />
    </div>
</div>

<Button onclick={search}>
    Vyhledat
</Button>

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
{:else if status === 'mistake'}
    <Alert variant="danger">
        <OctagonAlert />
        <AlertTitle>Špatně zadaná data!</AlertTitle>
    </Alert>
{:else if status === 'success'}
    <Alert variant="success">
        <Check />
        <AlertTitle>Úspěšně nalezeno!</AlertTitle>
    </Alert>
{/if}

{#if currentRange[0]}
    <p>Počty vytvořených protokolů od {currentRange[0]} do {currentRange[1]}:</p>

    {#if !results.entries().length}
        <p>Žádné protokoly</p>
    {/if}

    <ul>
        {#each results.entries() as [technician, count]}
            <li>{technician}: {count}</li>
        {/each}
    </ul>
{/if}