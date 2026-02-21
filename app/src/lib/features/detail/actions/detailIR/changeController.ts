import type { FormGroupIR } from '$lib/forms/IN/defaultIN';
import {
    type AlsoChange,
    alsoChangeDefault,
    type DataChangeIRID,
    type StateChangeIRID,
} from '$lib/features/detail/domain/detailIR/changeController';
import { detailIrUrl } from '$lib/helpers/runes.svelte.js';
import { goto } from '$app/navigation';
import { extractIRIDFromParts, type IRID } from '$lib/helpers/ir';
import db from '$lib/Database';
import type { IR } from '$lib/data';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import { serverTimestamp, type Timestamp } from 'firebase/firestore';

export const changeController = (
    part: FormGroupIR<DataChangeIRID>,
    d: DataChangeIRID,
    alsoChange: AlsoChange,
    changeState: (state: StateChangeIRID, error?: string) => void,
    irid: IRID,
) => async () => {
    try {
        part.typ.displayErrorVeto = true;
        part.cislo.displayErrorVeto = true;
        if (part.typ.showError(d) || part.cislo.showError(d)) return;
        const newNumber = part.cislo.value;
        const newType = part.typ.value;
        const newIRID = extractIRIDFromParts(newType.first!, newNumber);
        changeState('sending');
        const record = await db.getIR(irid!) as IR;
        record.IN.ir.cislo = newNumber;
        record.IN.ir.typ = newType;
        if (alsoChange.setPumpType) record.IN.tc.typ = alsoChange.setPumpType;
        if (alsoChange.setPumpModel) record.IN.tc.model = alsoChange.setPumpModel;
        if (alsoChange.setPumpNumber) record.IN.tc.cislo = alsoChange.setPumpNumber;
        if (alsoChange.resetBoxNumber) record.IN.ir.cisloBox = '';
        if (alsoChange.resetRemoteAccess) record.IN.vzdalenyPristup.chce = false;
        if (alsoChange.setFVEType) record.IN.fve.typ = 'DG-450-B';
        if (alsoChange.setHP) record.IN.ir.chceVyplnitK = ['heatPump'];
        if (irid! == newIRID) {
            await db.updateIN(irid!, record.IN, record.isDraft);
            alsoChange = alsoChangeDefault;
        } else {
            const user = get(currentUser)!;
            record.deleted = false;
            record.meta.id = newIRID;
            record.meta.createdAt = serverTimestamp() as Timestamp;
            record.meta.changedAt = serverTimestamp() as Timestamp;
            record.meta.keysChangedAt = serverTimestamp() as Timestamp;
            record.meta.createdBy = { uid: user.uid, email: user.email! };
            await db.addIR(record);
            alsoChange = alsoChangeDefault;
            const newRecord = await db.getIR(newIRID);
            if (!newRecord || newRecord.deleted || !newRecord.IN) return changeState('fail');
            await db.deleteIR(irid!, newIRID);
            await goto(detailIrUrl(newIRID), { replaceState: true, invalidateAll: true });
        }
        changeState('hidden');
    } catch (e) {
        console.log(e);
        changeState('fail', `${e}`);
    }
};