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
    type WithFieldValue
} from 'firebase/firestore';
import type { Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import type { Kontrola } from '$lib/forms/Kontrola.svelte';
import type { UvedeniTC } from '$lib/forms/UvedeniTC';
import { get, readonly, writable } from 'svelte/store';
import { checkRegulusOrAdmin, currentUser } from './auth';
import { firestore } from '../../hooks.client';
import type { UvedeniSOL } from '$lib/forms/UvedeniSOL';
import type { DataSP, GenericDataSP } from '$lib/forms/SP.svelte';
import type { DataSP2 } from '$lib/forms/SP2';
import type { P } from '$lib/translations';
import type { SparePart } from '$lib/client/realtime';

const persistentCacheIndexManager = getPersistentCacheIndexManager(firestore);
if (persistentCacheIndexManager)
    enablePersistentCacheIndexAutoCreation(persistentCacheIndexManager);

/**
 * 2: IR 12;
 * 4: IR 14;
 * 3: IR 34;
 * B: BOX/HBOX/HBOXK;
 * S: SOREL;
 */
export type IRType = '2' | '4' | '3' | 'B' | 'S';
/**
 * Zastaralé IR ID: A12345;
 * Moderní IR ID: 4A12345;
 * ID SOREL: S202412312359;
 */
export type IRID = `${IRType}${string}`;
/**
 * RB-2024-12-31-23;
 */
export type SPID = `${string}-${string}-${string}`;

const extractIRTypeFromFullIRType = (fullIRType: string): IRType =>
    (fullIRType.includes('12') ? '2'
        : fullIRType.includes('14') ? '4'
            : fullIRType.includes('34') ? '3'
                : fullIRType.includes('BOX') ? 'B'
                    : fullIRType.includes('SOREL') ? 'S'
                        : undefined)!;
export const extractIRIDFromParts = (fullIRType: string, irNumber: string): IRID =>
    `${extractIRTypeFromFullIRType(fullIRType)}${irNumber.replaceAll(/[ :T-]/g, '')}`;
export const extractIRIDFromRawData = (evidence: Raw<Data>): IRID =>
    extractIRIDFromParts(evidence.ir.typ.first!, evidence.ir.cislo);
export const extractSPIDFromRawData = (zasah: Raw<GenericDataSP<never>['zasah']>): SPID => {
    const datum = zasah.datum.split('T')[0];
    const hodina = zasah.datum.split('T')[1].split(':')[0];
    const technik = zasah.inicialy;
    return `${technik}-${datum}-${hodina}`;
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
    installationProtocol?: LegacySP;
    installationProtocols: LegacySP[];
    evidence: Raw<Data> & {
        vzdalenyPristup: {
            fakturuje: 'assemblyCompany' | 'endCustomer' | 'doNotInvoice' | P<'Později, dle protokolu'>;
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

type LegacyND = {
    dil: SparePart;
    name: never;
    code: never;
    unitPrice: never;
    warehouse: never;
};
export type LegacySP = Raw<DataSP> & {
    zasah: {
        doba: string;
        zaruka: never;
    };
    ukony: {
        mnozstviPrace: string;
        doba: never;
    };
    nahradniDil1: Raw<DataSP>['nahradniDil1'] & LegacyND;
    nahradniDil2: Raw<DataSP>['nahradniDil1'] & LegacyND;
    nahradniDil3: Raw<DataSP>['nahradniDil1'] & LegacyND;
    nahradniDil4: never,
    nahradniDil5: never,
    nahradniDil6: never,
    nahradniDil7: never,
    nahradniDil8: never,
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
    legacyIR.installationProtocol ? {
        ...legacyIR,
        installationProtocols: [legacyIR.installationProtocol],
        installationProtocol: undefined
    } : legacyIR;
const addInstallationProtocols: Migration = (legacyIR: LegacyIR & IR) =>
    !legacyIR.installationProtocols ? { ...legacyIR, installationProtocols: [] } : legacyIR;
const migrateND = (d: LegacyND) => ({
    ...d,
    name: d.dil?.name ?? '',
    code: String(d.dil?.code ?? ''),
    unitPrice: String(d.dil?.unitPrice ?? ''),
    warehouse: '',
}) as Raw<DataSP>['nahradniDil1']
export const migrateSP = <D extends GenericDataSP<D>>(legacy: LegacySP) => legacy['nahradniDil8'] ? legacy : ({
    ...legacy,
    ukony: {
        ...legacy.ukony,
        doba: legacy.ukony.mnozstviPrace || legacy.zasah.doba,
    },
    nahradniDil1: migrateND(legacy.nahradniDil1),
    nahradniDil2: migrateND(legacy.nahradniDil2),
    nahradniDil3: migrateND(legacy.nahradniDil3),
    nahradniDil4: { warehouse: '', code: '', name: '', unitPrice: '', mnozstvi: '1' } as Raw<DataSP>['nahradniDil1'],
    nahradniDil5: { warehouse: '', code: '', name: '', unitPrice: '', mnozstvi: '1' } as Raw<DataSP>['nahradniDil1'],
    nahradniDil6: { warehouse: '', code: '', name: '', unitPrice: '', mnozstvi: '1' } as Raw<DataSP>['nahradniDil1'],
    nahradniDil7: { warehouse: '', code: '', name: '', unitPrice: '', mnozstvi: '1' } as Raw<DataSP>['nahradniDil1'],
    nahradniDil8: { warehouse: '', code: '', name: '', unitPrice: '', mnozstvi: '1' } as Raw<DataSP>['nahradniDil1'],
}) as Raw<D>;

const newInstallationProtocols: Migration = (legacyIR: LegacyIR & IR) => ({
    ...legacyIR,
    installationProtocols: legacyIR.installationProtocols.map(l => migrateSP(l) as LegacySP)
});

type Migration = (legacyIR: LegacyIR & IR) => LegacyIR & IR;

export const modernizeIR = (legacyIR: LegacyIR & IR): IR =>
    // -------->>>>>>
    [removeInstallationProtocol, removeUvedeni, addUserType, changeBOX, changeFaktutruje, changeHPWarranty, addInstallationProtocols, newInstallationProtocols]
        .reduce((data, migration) => migration(data), legacyIR);

const irCollection = collection(firestore, 'ir').withConverter<IR>({
    toFirestore: (modelObject: WithFieldValue<IR>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => modernizeIR(snapshot.data() as IR & LegacyIR)
});
const spCollection = collection(firestore, 'sp').withConverter<Raw<DataSP2>>({
    toFirestore: (modelObject: WithFieldValue<Raw<DataSP2>>) => modelObject,
    fromFirestore: (snapshot: QueryDocumentSnapshot) => migrateSP(snapshot.data() as LegacySP & Raw<DataSP2>) as Raw<DataSP2>
});
const checkCollection = collection(firestore, 'check');
const irDoc = (irid: IRID) => doc(irCollection, irid);
const spDoc = (spid: SPID) => doc(spCollection, spid);
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
    setDoc(spDoc(extractSPIDFromRawData(protokol.zasah)), protokol);
export const odstranitObecnyServisniProtokol = (spid: SPID) =>
    deleteDoc(spDoc(spid));

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

export const publicProtocols = () => getDocs(spCollection);
export const publicProtocol = (spid: SPID) =>
    getDoc(spDoc(spid));

