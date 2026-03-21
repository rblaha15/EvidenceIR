<script lang="ts">
    import { InputWidget } from '$lib/forms/Widget.svelte';
    import Widget from '$lib/components/Widget.svelte';
    import { getTranslations } from '$lib/translations';
    import { dateFromISO, dayISO } from '$lib/helpers/date';
    import type { ExistingIR, ExistingNSP } from '$lib/data';
    import { adminDatabase } from '$lib/client/firestore';
    import { isSP } from '$lib/forms/SP/infoSP.svelte';

    const fromW = new InputWidget({
        type: 'date', label: 'Od (včetně)', text: dayISO(),
    });
    let from = $state(fromW.defaultValue);
    const toW = new InputWidget({
        type: 'date', label: 'Do (vyjma)', text: dayISO(),
    });
    let to = $state(toW.defaultValue);

    const cs = getTranslations('cs');

    let status = $state('none' as 'none' | 'mistake' | 'loading' | 'fail' | 'success');
    let results = $state<Record<string, number>>({});
    let currentRange = $state<[string, string]>(['', '']);

    const search = async () => {
        fromW.displayErrorVeto = true;
        toW.displayErrorVeto = true;
        if (fromW.showError({}, from) || toW.showError({}, to)) return status = 'mistake';
        status = 'loading';
        try {
            const fromD = new Date(from);
            const toD = new Date(to);

            const irs = (await adminDatabase.getAllIRs()).filter((ir): ir is ExistingIR => !ir.deleted);
            const nsps = (await adminDatabase.getAllNSPs()).filter((sp): sp is ExistingNSP => !sp.deleted);
4
            const allProtocols = [...irs.flatMap(ir => ir.SPs), ...nsps.map(sp => sp.NSP)].filter(isSP);

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

<div class="d-flex gap-1">
    <div class="flex-grow-1">
        <Widget widget={fromW} bind:value={from} context={{}} t={cs} />
    </div>
    <div class="flex-grow-1">
        <Widget widget={toW} bind:value={to} context={{}} t={cs} />
    </div>
</div>

<button class="btn btn-primary" onclick={search}>
    Vyhledat
</button>

{#if status === 'loading'}
    <div class="spinner-border text-danger"></div>
{:else if status === 'fail'}
    <p class="m-0 text-danger">Něco se nepovedlo</p>
{:else if status === 'mistake'}
    <p class="m-0 text-danger">Špatně zadaná data!</p>
{:else if status === 'success'}
    <p class="m-0 text-success">Úspěšně nalezeno!</p>
{/if}

{#if currentRange[0]}
    <p class="m-0">Počty vytvořených protokolů od {currentRange[0]} do {currentRange[1]}:</p>

    {#if !results.entries().length}
        <p class="m-0">Žádné protokoly</p>
    {/if}

    <ul class="m-0">
        {#each results.entries() as [technician, count]}
            <li>{technician}: {count}</li>
        {/each}
    </ul>
{/if}