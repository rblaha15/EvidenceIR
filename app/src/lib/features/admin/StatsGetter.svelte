<script lang="ts">
    import { call } from '$lib/client/endpoints';
    import DangerAlert from '$lib/components/alerts/DangerAlert.svelte';
    import SpinnerAlert from '$lib/components/alerts/SpinnerAlert.svelte';
    import SuccessAlert from '$lib/components/alerts/SuccessAlert.svelte';
    import Widget from '$lib/components/Widget.svelte';
    import { getTranslations } from '$lib/translations';
    import { dateFromISO, dayISO } from '$lib/helpers/date';
    import { isSP } from '$lib/forms/SP/infoSP.svelte';
    import { newInputWidget } from '$lib/forms/Widget';
    import { Button } from "$lib/components/ui/button";

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

            const { irs, nsps } = await call('db/admin/backup');

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
    <SpinnerAlert title="Odesílání dat" />
{:else if status === 'fail'}
    <DangerAlert title="Něco se nepovedlo" />
{:else if status === 'mistake'}
    <DangerAlert title="Špatně zadaná data!" />
{:else if status === 'success'}
    <SuccessAlert title="Úspěšně nalezeno!" />
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