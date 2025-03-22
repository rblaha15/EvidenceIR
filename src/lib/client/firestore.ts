import {
    collection,
    deleteDoc,
    doc,
    enablePersistentCacheIndexAutoCreation,
    getDoc,
    getDocs,
    getPersistentCacheIndexManager,
    onSnapshot,
    query,
    type QueryDocumentSnapshot,
    setDoc,
    updateDoc,
    where,
    type WithFieldValue,
} from 'firebase/firestore';
import type { Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import type { Kontrola } from '$lib/forms/Kontrola.svelte';
import type { UvedeniTC } from '$lib/forms/UvedeniTC';
import { get, readonly, writable } from 'svelte/store';
import { checkRegulusOrAdmin, currentUser } from './auth';
import { firestore } from '../../hooks.client';
import type { UvedeniSOL } from '$lib/forms/UvedeniSOL';
import type { DataSP } from '$lib/forms/SP.svelte';
import type { TranslationReference } from '$lib/translations';
import type { DataSP2 } from '$lib/forms/SP2';

const persistentCacheIndexManager = getPersistentCacheIndexManager(firestore);
if (persistentCacheIndexManager)
    enablePersistentCacheIndexAutoCreation(persistentCacheIndexManager);

export type IRType = '2' | '4' | 'B';
export type IRID = `${IRType}${string}`;
export type SPID = `${string}-${string}-${string}`;

const extractIRTypeFromFullIRType = (fullIRType: string): IRType =>
    (fullIRType.includes('12') ? '2'
        : fullIRType.includes('14') ? '4'
            : fullIRType.includes('BOX') ? 'B'
                : undefined)!;
export const extractIRIDFromParts = (fullIRType: string, irNumber: string): IRID =>
    `${extractIRTypeFromFullIRType(fullIRType)}${irNumber.replace(' ', '')}`;
export const extractIRIDFromRawData = (evidence: Raw<Data>): IRID =>
    extractIRIDFromParts(evidence.ir.typ.first!, evidence.ir.cislo);
export const extractSPIDFromRawData = (p: Raw<DataSP2>): SPID => {
    const datum = p.zasah.datum.split('T')[0]
    const hodina = p.zasah.datum.split('T')[1].split(':')[0]
    const technik = p.zasah.inicialy
    return `${technik}-${datum}-${hodina}`
};

export const IRNumberFromIRID = (irid: IRID): string =>
    irid.slice(1, 3) + ' ' + irid.slice(3, 7);

export type IR = {
    evidence: Raw<Data>;
    uvedeniTC?: Raw<UvedeniTC>;
    uvedeniSOL?: Raw<UvedeniSOL>;
    kontroly: {
        1?: Raw<Kontrola>;
        2?: Raw<Kontrola>;
        3?: Raw<Kontrola>;
        4?: Raw<Kontrola>;
    };
    users: string[];
    installationProtocols: Raw<DataSP>[];
};

export type LegacyIR = {
    uvedeni?: Raw<UvedeniTC>;
    installationProtocol?: Raw<DataSP>;
    evidence: Raw<Data> & {
        vzdalenyPristup: {
            fakturuje: TranslationReference;
        };
        ir: {
            cisloBOX: string;
        };
    };
    uvedeniTC?: Raw<UvedeniTC> & {
        uvadeni: {
            typZaruky: null | string
        };
    };
};

const changeHPWarranty: Migration = (legacyIR: LegacyIR & IR): LegacyIR & IR => {
    if (!legacyIR.uvedeniTC) return legacyIR;
    if (!legacyIR.uvedeniTC.uvadeni.typZaruky!.includes('extended')) return legacyIR;
    legacyIR.uvedeniTC.uvadeni.typZaruky =
        legacyIR.uvedeniTC.uvadeni.typZaruky as string == 'extendedWarranty10Years' ? 'yes' : 'no';
    return legacyIR;
};
const changeBOX: Migration = (legacyIR: LegacyIR & IR) => {
    if (!legacyIR.evidence.vzdalenyPristup.fakturuje) return legacyIR;
    legacyIR.evidence.vzdalenyPristup.plati = legacyIR.evidence.vzdalenyPristup.fakturuje;
    return legacyIR;
};
const changeFaktutruje: Migration = (legacyIR: LegacyIR & IR) => {
    if (!legacyIR.evidence.ir.cisloBOX) return legacyIR;
    legacyIR.evidence.ir.cisloBox = legacyIR.evidence.ir.cisloBOX;
    return legacyIR;
};
const addUserType: Migration = (legacyIR: LegacyIR & IR) => {
    if (legacyIR.evidence.koncovyUzivatel.typ) return legacyIR;
    legacyIR.evidence.koncovyUzivatel.typ = `individual`;
    return legacyIR;
};
const removeUvedeni: Migration = (legacyIR: LegacyIR & IR) =>
    legacyIR.uvedeni ? <LegacyIR & IR>{ uvedeniTC: legacyIR.uvedeni, ...legacyIR, uvedeni: undefined } : legacyIR;
const removeInstallationProtocol: Migration = (legacyIR: LegacyIR & IR) =>
    legacyIR.installationProtocol ? { ...legacyIR, installationProtocols: [legacyIR.installationProtocol], installationProtocol: undefined } : legacyIR;
const addInstallationProtocols: Migration = (legacyIR: LegacyIR & IR) =>
    !legacyIR.installationProtocols ? { ...legacyIR, installationProtocols: [] } : legacyIR;

type Migration = (legacyIR: LegacyIR & IR) => LegacyIR & IR;

export const modernizeIR = (legacyIR: LegacyIR & IR): IR =>
    [removeInstallationProtocol, removeUvedeni, addUserType, changeBOX, changeFaktutruje, changeHPWarranty, addInstallationProtocols]
        .reduce((data, migration) => migration(data), legacyIR);

const irCollection = collection(firestore, 'ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => modernizeIR(snapshot.data() as IR & LegacyIR),
});
const spCollection = collection(firestore, 'sp').withConverter<Raw<DataSP2>>({
    toFirestore: (modelObject: WithFieldValue<Raw<DataSP2>>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as Raw<DataSP2>,
})
const checkCollection = collection(firestore, 'check');
const irDoc = (irid: IRID) => doc(irCollection, irid);
const checkDoc = (irid: IRID) => doc(checkCollection, irid);

export const evidence = (irid: IRID) =>
    getDoc(irDoc(irid));
export const novaEvidence = (data: IR) =>
    setDoc(irDoc(extractIRIDFromRawData(data.evidence)), data);
export const upravitEvidenci = (rawData: Raw<Data>) =>
    updateDoc(irDoc(extractIRIDFromRawData(rawData)), `evidence`, rawData);
export const odstranitEvidenci = (irid: IRID) =>
    deleteDoc(irDoc(irid));
export const existuje = async (irid: IRID) => {
    try {
        await getDoc(checkDoc(irid));
        return true;
    } catch (e) {
        if ((e as Record<string, string>)?.code == 'permission-denied') return false;
        else throw e;
    }
};

export const pridatKontrolu = (irid: IRID, rok: number, kontrola: Raw<Kontrola>) =>
    updateDoc(irDoc(irid), `kontroly.${rok}`, kontrola);

export const vyplnitServisniProtokol = async (irid: IRID, protokol: Raw<DataSP>) => {
    const p = (await evidence(irid)).data()!.installationProtocols ?? [];
    await updateDoc(
        irDoc(irid), `installationProtocols`,
        [...p, protokol]
    );
};
export const vyplnitObecnyServisniProtokol = (protokol: Raw<DataSP2>) =>
    setDoc(doc(spCollection, extractSPIDFromRawData(protokol)), protokol);

export const upravitServisniProtokol = async (irid: IRID, index: number, protokol: Raw<DataSP>) => {
    const p = (await evidence(irid)).data()!.installationProtocols;
    p[index] = protokol;
    await updateDoc(irDoc(irid), `installationProtocols`, p);
};

export const uvestTCDoProvozu = (irid: IRID, uvedeni: Raw<UvedeniTC>) =>
    updateDoc(irDoc(irid), `uvedeniTC`, uvedeni);

export const uvestSOLDoProvozu = (irid: IRID, uvedeni: Raw<UvedeniSOL>) =>
    updateDoc(irDoc(irid), `uvedeniSOL`, uvedeni);

export const upravitUzivatele = (irid: IRID, users: string[]) =>
    updateDoc(irDoc(irid), `users`, users);

export const evidenceStore = (irid: IRID) => {
    const currentState = writable<IR>(undefined as IR | undefined);
    onSnapshot(irDoc(irid), (data) => currentState.set(data.data()!));
    return readonly(currentState);
};
export const getAll = async () => {
    const user = get(currentUser);
    if (await checkRegulusOrAdmin())
        return await getDocs(irCollection);
    return await getDocs(query(irCollection, where('users', 'array-contains', user?.email)));
};
