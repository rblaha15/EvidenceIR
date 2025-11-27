<script lang="ts">
    import { DoubleChooserWidget, InputWidget } from '$lib/forms/Widget.svelte';
    import type { IRSubTypes, IRTypes } from '$lib/forms/IN/formIN';
    import { type Translations } from '$lib/translations';
    import { untrack } from 'svelte';
    import { extractIRIDFromParts, type IRID } from '$lib/helpers/ir';
    import db, { type IR } from '$lib/data';
    import { goto } from '$app/navigation';
    import { detailIrUrl } from '$lib/helpers/runes.svelte';
    import Widget from '$lib/components/Widget.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { irTypeAndNumber } from '$lib/forms/IN/defaultIN';

    const { t, ir, irid }: {
        t: Translations, ir: IR, irid: IRID,
    } = $props();
    const td = $derived(t.detail);

    let change: 'no' | 'input' | 'sending' | 'fail' | 'unchanged' = $state('no');

    type D = { ir: { typ: DoubleChooserWidget<D, IRTypes, IRSubTypes>, cislo: InputWidget<D> } };

    const alsoChangeDefault = {
        setAirToWater: false,
        resetBoxNumber: false,
        resetRemoteAccess: false,
        setFVEType: false,
        setHP: false,
    };
    let alsoChange = $state(alsoChangeDefault);

    const part = irTypeAndNumber<D>({
        setAirToWater: _ => alsoChange.setAirToWater = true,
        resetBoxNumber: _ => alsoChange.resetBoxNumber = true,
        resetRemoteAccess: _ => alsoChange.resetRemoteAccess = true,
        setFVEType: _ => alsoChange.setFVEType = true,
        setHP: _ => alsoChange.setHP = true,
    });

    const d = $derived({ ir: part });

    $effect(() => {
        if (!ir) return;
        untrack(() => {
            part.typ.setValue(d, ir.evidence.ir.typ);
            part.cislo.setValue(d, ir.evidence.ir.cislo);
        });
    });

    const changeController = async () => {
        try {
            part.typ.displayErrorVeto = true;
            part.cislo.displayErrorVeto = true;
            if (part.typ.showError(d) || part.cislo.showError(d)) return;
            const newNumber = part.cislo.value;
            const newType = part.typ.value;
            const newIRID = extractIRIDFromParts(newType.first!, newNumber);
            change = 'sending';
            const record = (await db.getIR(irid!))!;
            record.evidence.ir.cislo = newNumber;
            record.evidence.ir.typ = newType;
            if (alsoChange.setAirToWater) record.evidence.tc.typ = 'airToWater';
            if (alsoChange.resetBoxNumber) record.evidence.ir.cisloBox = '';
            if (alsoChange.resetRemoteAccess) record.evidence.vzdalenyPristup.chce = false;
            if (alsoChange.setFVEType) record.evidence.fve.typ = 'DG-450-B';
            if (alsoChange.setHP) record.evidence.ir.chceVyplnitK = ['heatPump'];
            if (irid! == newIRID) {
                await db.updateIRRecord(record.evidence);
                alsoChange = alsoChangeDefault;
            } else {
                await db.addIR(record);
                alsoChange = alsoChangeDefault;
                const newRecord = await db.getIR(newIRID);
                if (!newRecord?.evidence) return change = 'fail';
                await db.deleteIR(irid!);
                await goto(detailIrUrl(newIRID), { replaceState: true, invalidateAll: true });
            }
            change = 'no';
        } catch (e) {
            console.log(e);
            change = 'fail';
        }
    };
</script>

{#if change === 'no'}
    <button class="btn btn-warning d-block" onclick={() => (change = 'input')}>
        <Icon icon="drive_file_rename_outline" />
        {td.changeController}
    </button>
{:else if change === 'input'}
    <div class="d-flex flex-column gap-3 w-100">
        <Widget bind:widget={part.typ} data={d} {t} />
        <Widget bind:widget={part.cislo} data={d} {t} />
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
{:else if change === 'fail'}
    <p class="text-danger">{td.changeWentWrong}</p>
{/if}