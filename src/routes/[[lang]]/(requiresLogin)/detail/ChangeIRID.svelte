<script lang="ts">
    import { type Translations } from '$lib/translations';
    import { untrack } from 'svelte';
    import { extractIRIDFromParts, type IRID } from '$lib/helpers/ir';
    import db, { type IR } from '$lib/data';
    import { goto } from '$app/navigation';
    import { detailIrUrl } from '$lib/helpers/runes.svelte';
    import Widget from '$lib/components/Widget.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { type FormGroupIR, irTypeAndNumber } from '$lib/forms/IN/defaultIN';
    import type { HeatPump } from '$lib/helpers/products';
    import { serverTimestamp, Timestamp } from 'firebase/firestore';
    import { get } from 'svelte/store';
    import { currentUser } from '$lib/client/auth';

    const { t, ir, irid }: {
        t: Translations, ir: IR, irid: IRID,
    } = $props();
    const td = $derived(t.detail);

    let change: 'no' | 'input' | 'sending' | 'fail' | 'unchanged' = $state('no');

    type D = { ir: FormGroupIR<D> };

    const alsoChangeDefault = {
        setPumpType: null as 'airToWater' | 'groundToWater' | null,
        setPumpModel: null as HeatPump | null,
        setPumpNumber: null as string | null,
        resetBoxNumber: false,
        resetRemoteAccess: false,
        setFVEType: false,
        setHP: false,
    };
    let alsoChange = $state(alsoChangeDefault);

    const part = irTypeAndNumber<D>({
        setPumpType: (_, v) => alsoChange.setPumpType = v,
        setPumpModel: (_, v) => alsoChange.setPumpModel = v,
        setPumpNumber: (_, v) => alsoChange.setPumpNumber = v,
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
            const record = await db.getIR(irid!) as IR;
            record.evidence.ir.cislo = newNumber;
            record.evidence.ir.typ = newType;
            if (alsoChange.setPumpType) record.evidence.tc.typ = alsoChange.setPumpType;
            if (alsoChange.setPumpModel) record.evidence.tc.model = alsoChange.setPumpModel;
            if (alsoChange.setPumpNumber) record.evidence.tc.cislo = alsoChange.setPumpNumber;
            if (alsoChange.resetBoxNumber) record.evidence.ir.cisloBox = '';
            if (alsoChange.resetRemoteAccess) record.evidence.vzdalenyPristup.chce = false;
            if (alsoChange.setFVEType) record.evidence.fve.typ = 'DG-450-B';
            if (alsoChange.setHP) record.evidence.ir.chceVyplnitK = ['heatPump'];
            if (irid! == newIRID) {
                await db.updateIRRecord(record.evidence, record.isDraft);
                alsoChange = alsoChangeDefault;
            } else {
                const user = get(currentUser)!;
                record.deleted = false;
                record.createdAt = serverTimestamp() as Timestamp;
                record.changedAt = serverTimestamp() as Timestamp;
                record.keysChangedAt = serverTimestamp() as Timestamp;
                record.createdBy = { uid: user.uid, email: user.email! };
                await db.addIR(record);
                alsoChange = alsoChangeDefault;
                const newRecord = await db.getIR(newIRID);
                if (!newRecord || newRecord.deleted || !newRecord.evidence) return change = 'fail';
                await db.deleteIR(irid!, newIRID);
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