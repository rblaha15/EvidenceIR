import type { IRID, SPID } from '$lib/helpers/ir';
import type { Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { TC } from '$lib/forms/IN/defaultIN';
import type { FormRKT } from '$lib/forms/RKT/formRKT';
import type { FormRKS } from '$lib/forms/RKS/formRKS';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';
import type { FormUPS } from '$lib/forms/UPS/formUPS';
import type { FormUPF } from '$lib/forms/UPF/formUPF';
import type { FormFT } from '$lib/forms/FT/formFT';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { Readable } from 'svelte/store';
import type { Deleted, IR, Year } from '$lib/data';
import type { Timestamp } from 'firebase/firestore';

/**
 * Supported actions:
 * - get
 * - getChanged
 * - getDeleted
 * - get*AsStore
 * - exists
 */
export interface ReadDatabase {
    getIR(irid: IRID): Promise<IR | Deleted<IRID> | undefined>;

    getChangedIRs(lastUpdatedAt: Timestamp | null): Promise<IR[]>;
    getDeletedIRs(lastUpdatedAt: Timestamp | null): Promise<Deleted<IRID>[]>;

    getIRAsStore(irid: IRID): Readable<IR | Deleted<IRID> | undefined | 'loading'>;

    existsIR(irid: IRID): Promise<boolean>;

    getIndependentProtocol(spid: SPID): Promise<Raw<FormNSP> | Deleted<SPID> | undefined>;

    getIndependentProtocolAsStore(spid: SPID): Readable<Raw<FormNSP> | Deleted<SPID> | undefined | 'loading'>;

    getChangedIndependentProtocols(lastUpdatedAt: Timestamp | null): Promise<Raw<FormNSP>[]>;
    getDeletedIndependentProtocols(lastUpdatedAt: Timestamp | null): Promise<Deleted<SPID>[]>;
}

/**
 * Supported actions:
 * - add
 * - delete
 * - update
 */
export interface WriteDatabase {
    addIR(ir: IR): Promise<void>;

    deleteIR(irid: IRID, movedTo?: IRID): Promise<void>;

    updateIRRecord(rawData: Raw<FormIN>, isDraft: boolean): Promise<void>;

    addHeatPumpCheck(irid: IRID, pump: TC, year: Year, check: Raw<FormRKT>): Promise<void>;

    addSolarSystemCheck(irid: IRID, year: Year, check: Raw<FormRKS>): Promise<void>;

    addServiceProtocol(irid: IRID, protocol: Raw<FormSP>): Promise<void>;

    updateServiceProtocol(irid: IRID, index: number, protocol: Raw<FormSP>): Promise<void>;

    updateHeatPumpCommissioningProtocol(irid: IRID, protocol: IR['uvedeniTC']): Promise<void>;

    addSolarSystemCommissioningProtocol(irid: IRID, protocol: Raw<FormUPS>): Promise<void>;

    addPhotovoltaicSystemCommissioningProtocol(irid: IRID, protocol: Raw<FormUPF>): Promise<void>;

    addFaceTable(irid: IRID, faceTable: Raw<FormFT>): Promise<void>;

    updateIRUsers(irid: IRID, users: string[]): Promise<void>;

    updateHeatPumpRecommendationsSettings(irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null): Promise<void>;

    updateSolarSystemRecommendationsSettings(irid: IRID, enabled: boolean, executingCompany: 'assembly' | 'commissioning' | 'regulus' | null): Promise<void>;

    addIndependentServiceProtocol(protocol: Raw<FormNSP>): Promise<void>;

    updateIndependentServiceProtocol(protocol: Raw<FormNSP>): Promise<void>;

    deleteIndependentProtocol(spid: SPID): Promise<void>;
}

export interface Database extends ReadDatabase, WriteDatabase {
}

export const databaseMethods = [
    'getIR', 'getChangedIRs', 'getDeletedIRs', 'getIRAsStore', 'addIR', 'deleteIR', 'existsIR', 'updateIRRecord', 'addHeatPumpCheck',
    'addSolarSystemCheck', 'addServiceProtocol', 'updateServiceProtocol', 'updateHeatPumpCommissioningProtocol',
    'addSolarSystemCommissioningProtocol', 'addPhotovoltaicSystemCommissioningProtocol', 'updateIRUsers',
    'updateHeatPumpRecommendationsSettings', 'updateSolarSystemRecommendationsSettings', 'addIndependentServiceProtocol',
    'deleteIndependentProtocol', 'getIndependentProtocol', 'getIndependentProtocolAsStore', 'getChangedIndependentProtocols',
    'getDeletedIndependentProtocols', 'addFaceTable', 'updateIndependentServiceProtocol',
] as const satisfies (keyof Database)[];