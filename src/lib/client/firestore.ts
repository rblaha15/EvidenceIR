import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    onSnapshot,
    query,
    type QueryDocumentSnapshot,
    setDoc,
    updateDoc,
    where,
    type WithFieldValue
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
    legacyIR.uvedeni ? { uvedeniTC: legacyIR.uvedeni, ...legacyIR } : legacyIR;
const removeInstallationProtocol: Migration = (legacyIR: LegacyIR & IR) =>
    legacyIR.installationProtocol ? { ...legacyIR, installationProtocols: [legacyIR.installationProtocol] } : legacyIR;

type Migration = (legacyIR: LegacyIR & IR) => LegacyIR & IR;

export const modernizeIR = (legacyIR: LegacyIR & IR): IR =>
    [removeInstallationProtocol, removeUvedeni, addUserType, changeBOX, changeFaktutruje, changeHPWarranty]
        .reduce((data, migration) => migration(data), legacyIR);

const irCollection = collection(firestore, 'ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => modernizeIR(snapshot.data() as IR & LegacyIR),
});
const checkCollection = collection(firestore, 'check');
const irDoc = (ir: string) => doc(irCollection, ir.replace(' ', ''));
const checkDoc = (ir: string) => doc(checkCollection, ir.replace(' ', ''));

export const evidence = (ir: string) =>
    getDoc(irDoc(ir));
export const novaEvidence = (data: IR) =>
    setDoc(irDoc(data.evidence.ir.cislo), data);
export const upravitEvidenci = (rawData: RawData) =>
    updateDoc(irDoc(rawData.ir.cislo), `evidence`, rawData);
export const odstranitEvidenci = (ir: string) =>
    deleteDoc(irDoc(ir));
export const existuje = async (ir: string) => {
    try {
        await getDoc(checkDoc(ir));
        return true;
    } catch (e) {
        if ((e as Record<string, string>)?.code == 'permission-denied') return false;
        else throw e;
    }
};

export const posledniKontrola = async (ir: string) => {
    const snapshot = await getDoc(irDoc(ir));
    const kontroly = snapshot.data()!.kontroly;
    if (kontroly?.[1] == undefined) return 0;
    return Math.max(...Object.keys(kontroly).map((it) => Number(it)));
};

export const pridatKontrolu = (ir: string, rok: number, kontrola: Kontrola) =>
    updateDoc(irDoc(ir), `kontroly.${rok}`, kontrola);

export const vyplnitServisniProtokol = async (ir: string, protokol: RawDataSP) => {
    const p = (await evidence(ir)).data()!.installationProtocols;
    await updateDoc(
        irDoc(ir), `installationProtocols`,
        [...p, protokol]
    );
};

export const uvestTCDoProvozu = (ir: string, uvedeni: RawUvedeniTC) =>
    updateDoc(irDoc(ir), `uvedeniTC`, uvedeni);

export const uvestSOLDoProvozu = (ir: string, uvedeni: RawUvedeniSOL) =>
    updateDoc(irDoc(ir), `uvedeniSOL`, uvedeni);

export const upravitUzivatele = (ir: string, users: string[]) =>
    updateDoc(irDoc(ir), `users`, users);

export const evidenceStore = (ir: string) => {
    const currentState = writable<IR>(undefined as IR | undefined);
    onSnapshot(irDoc(ir), (data) => currentState.set(data.data()!));
    return readonly(currentState);
};
export const getAll = async () => {
    const user = get(currentUser);
    if (await checkRegulusOrAdmin())
        return await getDocs(irCollection);
    return await getDocs(query(irCollection, where('users', 'array-contains', user?.email)));
};
