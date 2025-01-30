import {
    collection,
    deleteDoc,
    doc, enablePersistentCacheIndexAutoCreation,
    getDoc,
    getDocs, getPersistentCacheIndexManager,
    onSnapshot,
    query,
    type QueryDocumentSnapshot,
    setDoc,
    updateDoc,
    where,
    type WithFieldValue,
} from 'firebase/firestore';
import type { RawData } from '$lib/Data';
import type { Kontrola } from '$lib/Kontrola';
import type { RawUvedeniTC } from '$lib/UvedeniTC';
import { get, readonly, writable } from 'svelte/store';
import { checkRegulusOrAdmin, currentUser } from './auth';
import { firestore } from '../../hooks.client';
import type { RawUvedeniSOL } from '$lib/UvedeniSOL';
import type { RawDataSP } from '$lib/SP';
import type { TranslationReference } from '$lib/translations';

const persistentCacheIndexManager = getPersistentCacheIndexManager(firestore);
if (persistentCacheIndexManager)
    enablePersistentCacheIndexAutoCreation(persistentCacheIndexManager);

export type IRType = '2' | '4' | 'B';
export type IRID = `${IRType}${string}`;

const extractIRTypeFromFullIRType = (fullIRType: string): IRType =>
    (fullIRType.includes('12') ? '2'
        : fullIRType.includes('14') ? '4'
            : fullIRType.includes('BOX') ? 'B'
                : undefined)!;
export const extractIRIDFromParts = (fullIRType: string, irNumber: string): IRID =>
    `${extractIRTypeFromFullIRType(fullIRType)}${irNumber.replace(' ', '')}`;
export const extractIRIDFromRawData = (evidence: RawData): IRID =>
    extractIRIDFromParts(evidence.ir.typ.first!, evidence.ir.cislo);

export const IRNumberFromIRID = (irid: IRID): string =>
    irid.slice(1, 3) + ' ' + irid.slice(3, 7);

export type IR = {
    evidence: RawData;
    uvedeniTC?: RawUvedeniTC;
    uvedeniSOL?: RawUvedeniSOL;
    kontroly: {
        1?: Kontrola;
        2?: Kontrola;
        3?: Kontrola;
        4?: Kontrola;
    };
    users: string[];
    installationProtocols: RawDataSP[];
};

export type LegacyIR = {
    uvedeni?: RawUvedeniTC;
    installationProtocol?: RawDataSP;
    evidence: RawData & {
        vzdalenyPristup: {
            fakturuje: TranslationReference;
        };
        ir: {
            cisloBOX: string;
        };
    };
    uvedeniTC?: RawUvedeniTC & {
        uvadeni: {
            typZaruky: null | TranslationReference | 'extendedWarranty10Years' | 'extendedWarranty7Years'
        };
    };
};

const changeHPWarranty: Migration = (legacyIR: LegacyIR & IR) => {
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
    legacyIR.uvedeni ? { uvedeniTC: legacyIR.uvedeni, ...legacyIR, uvedeni: undefined } : legacyIR;
const removeInstallationProtocol: Migration = (legacyIR: LegacyIR & IR) =>
    legacyIR.installationProtocol ? { ...legacyIR, installationProtocols: [legacyIR.installationProtocol], installationProtocol: undefined } : legacyIR;

type Migration = (legacyIR: LegacyIR & IR) => LegacyIR & IR;

export const modernizeIR = (legacyIR: LegacyIR & IR): IR =>
    [removeInstallationProtocol, removeUvedeni, addUserType, changeBOX, changeFaktutruje, changeHPWarranty]
        .reduce((data, migration) => migration(data), legacyIR);

const irCollection = collection(firestore, 'ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => modernizeIR(snapshot.data() as IR & LegacyIR),
});
const checkCollection = collection(firestore, 'check');
const irDoc = (irid: IRID) => doc(irCollection, irid.replace(' ', ''));
const checkDoc = (irid: IRID) => doc(checkCollection, irid.replace(' ', ''));

export const evidence = (irid: IRID) =>
    getDoc(irDoc(irid));
export const novaEvidence = (data: IR) =>
    setDoc(irDoc(extractIRIDFromRawData(data.evidence)), data);
export const upravitEvidenci = (rawData: RawData) =>
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

export const posledniKontrola = async (irid: IRID) => {
    const snapshot = await getDoc(irDoc(irid));
    const kontroly = snapshot.data()!.kontroly;
    if (kontroly?.[1] == undefined) return 0;
    return Math.max(...Object.keys(kontroly).map((it) => Number(it)));
};

export const pridatKontrolu = (irid: IRID, rok: number, kontrola: Kontrola) =>
    updateDoc(irDoc(irid), `kontroly.${rok}`, kontrola);

export const vyplnitServisniProtokol = async (irid: IRID, protokol: RawDataSP) => {
    const p = (await evidence(irid)).data()!.installationProtocols ?? [];
    await updateDoc(
        irDoc(irid), `installationProtocols`,
        [...p, protokol]
    );
};

export const upravitServisniProtokol = async (irid: IRID, index: number, protokol: RawDataSP) => {
    const p = (await evidence(irid)).data()!.installationProtocols;
    p[index] = protokol;
    await updateDoc(irDoc(irid), `installationProtocols`, p);
};

export const uvestTCDoProvozu = (irid: IRID, uvedeni: RawUvedeniTC) =>
    updateDoc(irDoc(irid), `uvedeniTC`, uvedeni);

export const uvestSOLDoProvozu = (irid: IRID, uvedeni: RawUvedeniSOL) =>
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
