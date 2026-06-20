import type { IRID, NSPID, SPID, SZID } from "$lib/helpers/ir";
import type { DeletedIR, DeletedNSP, ExistingIR, ExistingNSP, IR, NSP, Year, Timestamp } from "$lib/data";
import type { Raw } from "$lib/forms/Form";
import type { FormIN } from "$lib/forms/IN/formIN";
import type { TC } from "$lib/forms/IN/defaultIN";
import type { FormRKT } from "$lib/forms/RKT/formRKT";
import type { FormRKTL } from "$lib/forms/RKT/formRKTL";
import type { FormRKS } from "$lib/forms/RKS/formRKS";
import type { FormSP } from "$lib/forms/SP/formSP.svelte";
import type { FormSZ } from "$lib/forms/SP/formSZ";
import type { FormUPT } from "$lib/forms/UPT/formUPT";
import type { FormUPS } from "$lib/forms/UPS/formUPS";
import type { FormUPF } from "$lib/forms/UPF/formUPF";
import type { FormFT } from "$lib/forms/FT/formFT";
import type { FormNSP } from "$lib/forms/NSP/formNSP";

/**
 * Supported actions:
 * - get
 * - getChanged
 * - getDeleted
 * - exists
 */
export interface ReadDatabase {
    getIR(irid: IRID): Promise<IR | null>;

    getChangedIRs(lastUpdatedAt: Timestamp): Promise<ExistingIR[]>;

    getDeletedIRs(lastUpdatedAt: Timestamp): Promise<DeletedIR[]>;

    existsIR(irid: IRID): Promise<boolean>;

    getNSP(nspid: NSPID): Promise<NSP | null>;

    getChangedNSPs(lastUpdatedAt: Timestamp): Promise<ExistingNSP[]>;

    getDeletedNSPs(lastUpdatedAt: Timestamp): Promise<DeletedNSP[]>;
}

/**
 * Supported actions:
 * - add
 * - delete
 * - update
 * - move
 */
export interface WriteDatabase {
    addIR(ir: IR): Promise<void>;

    deleteIR(irid: IRID): Promise<void>;

    moveIR(irid: IRID, newIr: IR): Promise<void>;

    updateIN(irid: IRID, rawData: Raw<FormIN>, isDraft: boolean): Promise<void>;

    addRKT(irid: IRID, pump: TC, year: Year, check: Raw<FormRKT | FormRKTL>): Promise<void>;

    addRKS(irid: IRID, year: Year, check: Raw<FormRKS>): Promise<void>;

    addSPs(irid: IRID, protocols: Raw<FormSP | FormSZ>[]): Promise<void>;

    updateSP(irid: IRID, protocol: Raw<FormSP | FormSZ>): Promise<void>;

    deleteSP(irid: IRID, id: SPID | SZID): Promise<void>;

    updateUPT(irid: IRID, protocol: Raw<FormUPT>): Promise<void>;

    updateDateUPT(irid: IRID, date: string): Promise<void>;

    addUPS(irid: IRID, protocol: Raw<FormUPS>): Promise<void>;

    updateDateUPS(irid: IRID, date: string): Promise<void>;

    addUPF(irid: IRID, protocol: Raw<FormUPF>): Promise<void>;

    addFT(irid: IRID, faceTable: Raw<FormFT>): Promise<void>;

    updateUsersWithAccessToIR(irid: IRID, users: string[]): Promise<void>;

    markRefsiteConfirmed(irid: IRID): Promise<void>;

    updateDKT(irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null): Promise<void>;

    updateDKS(irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null): Promise<void>;

    addNSP(protocol: NSP): Promise<void>;

    updateNSP(nspid: NSPID, protocol: Raw<FormNSP>): Promise<void>;

    deleteNSP(nspid: NSPID): Promise<void>;
}

export interface Database extends ReadDatabase, WriteDatabase {
}

export const readDatabaseMethods = [
    'getIR', 'getChangedIRs', 'getDeletedIRs', 'existsIR', 'getNSP', 'getChangedNSPs', 'getDeletedNSPs',
] as const satisfies (keyof ReadDatabase)[];
export const writeDatabaseMethods = [
    'addIR', 'deleteIR', 'moveIR', 'updateIN',
    'addRKT', 'addRKS', 'updateUPT', 'updateDateUPT', 'addUPS', 'updateDateUPS', 'addUPF',
    'addSPs', 'updateSP', 'deleteSP', 'updateUsersWithAccessToIR', 'markRefsiteConfirmed', 'updateDKT', 'updateDKS', 'addFT',
    'addNSP', 'deleteNSP', 'updateNSP',
] as const satisfies (keyof WriteDatabase)[];
export const databaseMethods = [
    ...readDatabaseMethods,
    ...writeDatabaseMethods,
] as const satisfies (keyof Database)[];

export type WriteFunction = keyof WriteDatabase;
export const isWriteFunction = (name: keyof Database): name is WriteFunction =>
    ['add', 'update', 'delete', 'move'].some(prefix => name.startsWith(prefix));

export type GetAsStoreFunction = {
    [F in keyof ReadDatabase]: F extends `get${string}AsStore` ? F : never;
}[keyof ReadDatabase];
export const isGetAsStoreFunction = (name: keyof Database): name is GetAsStoreFunction =>
    name.endsWith('AsStore');
