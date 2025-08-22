<script lang="ts">
    import { ChooserWidget, InputWidget } from '$lib/forms/Widget.svelte';
    import type { IRTypes } from '$lib/forms/IN/formIN';
    import { type Translations } from '$lib/translations';
    import { time, todayISO } from '$lib/helpers/date';
    import { untrack } from 'svelte';
    import { extractIRIDFromParts, type IRID } from '$lib/helpers/ir';
    import db, { type IR } from '$lib/data';
    import { goto } from '$app/navigation';
    import { detailIrUrl } from '$lib/helpers/runes.svelte';
    import Widget from '$lib/components/Widget.svelte';

    const { t, ir, irid }: {
        t: Translations, ir: IR, irid: IRID,
    } = $props()
    const td = $derived(t.detail);

    let change: 'no' | 'input' | 'sending' | 'fail' | 'unchanged' = $state('no');

    type D = { type: ChooserWidget<D, IRTypes>, number: InputWidget<D> };

    const sorel = (d: D) => d.type.value == 'SOREL';
    const irFVE = (d: D) => d.type.value == 'fve';

    let irType = $state(new ChooserWidget<D, IRTypes>({
        label: t => t.in.controllerType,
        options: ['IR RegulusBOX', 'IR RegulusHBOX', 'IR RegulusHBOX K', 'IR 34', 'IR 14', 'IR 12', 'SOREL', 'fve'],
        onValueSet: (d, v) => {
            if (v == 'SOREL') {
                d.number.setValue(d, `${todayISO()} ${time()}`);
            }
        },
        labels: t => t.in.ir,
    }));
    let irNumber = $state(new InputWidget<D>({
        label: t => t.in.serialNumber,
        onError: t => t.wrong.number,
        regex: d => sorel(d) || irFVE(d)
            ? /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}/
            : d.type.value == 'IR 12'
                ? /[A-Z][1-9OND] [0-9]{4}|00:0A:14:0[69]:[0-9A-F]{2}:[0-9A-F]{2}/
                : /[A-Z][1-9OND] [0-9]{4}/,
        capitalize: true,
        maskOptions: d => ({
            mask: sorel(d) ? `0000-00-00T00:00` :
                d.type.value != 'IR 12' ? 'Z9 0000'
                    : d.number.value.length == 0 ? 'X'
                        : d.number.value[0] == '0'
                            ? 'NN:NA:14:N6:FF:FF'
                            : 'Z9 0000',
            definitions: {
                X: /[0A-Za-z]/,
                N: /0/,
                A: /[Aa]/,
                6: /[69]/,
                1: /1/,
                4: /4/,
                F: /[0-9A-Fa-f]/,
                Z: /[A-Za-z]/,
                9: /[1-9ONDond]/,
            },
        }),
        show: d => !sorel(d) && !irFVE(d),
    }));

    const d = $derived({ number: irNumber, type: irType });

    $effect(() => {
        if (!ir) return;
        untrack(() => {
            irNumber.setValue(d, ir.evidence.ir.cislo);
            irType.setValue(d, ir.evidence.ir.typ.first);
        });
    });

    const changeController = async () => {
        try {
            irNumber.displayErrorVeto = true;
            irType.displayErrorVeto = true;
            if (irNumber.showError(d) || irType.showError(d)) return;
            const newNumber = irNumber.value;
            const newType = irType.value;
            const newIRID = extractIRIDFromParts(newType!, newNumber);
            if (irid! == newIRID) return change = 'unchanged';
            change = 'sending';
            const record = (await db.getIR(irid!))!;
            record.evidence.ir.cislo = newNumber;
            record.evidence.ir.typ.first = newType;
            await db.addIR(record);
            const newRecord = await db.getIR(newIRID);
            if (!newRecord?.evidence) return change = 'fail';
            await db.deleteIR(irid!);
            await goto(detailIrUrl(newIRID), { replaceState: true, invalidateAll: true });
            change = 'no';
        } catch (e) {
            console.log(e);
            change = 'fail';
        }
    };
</script>

{#if change === 'no'}
    <button class="btn btn-warning d-block" onclick={() => (change = 'input')}
    >{td.changeController}</button>
{:else if change === 'input'}
    <div class="d-flex flex-column gap-3 w-100">
        <Widget bind:widget={irType} data={d} {t} />
        <Widget bind:widget={irNumber} data={d} {t} />
        <div class="d-flex gap-3">
            <button class="btn btn-danger" onclick={changeController}>{td.confirm}</button>
            <button class="btn btn-secondary" onclick={() => (change = 'no')}>{td.cancel}</button>
        </div>
    </div>
{:else if change === 'sending'}
    <div class="d-flex align-items-center">
        <span>{td.saving}</span>
        <div class="spinner-border text-danger"></div>
    </div>
{:else if change === 'unchanged'}
    <p class="text-danger">Tento regulátor již existuje!</p>
{:else if change === 'fail'}
    <p class="text-danger">{td.changeWentWrong}</p>
{/if}