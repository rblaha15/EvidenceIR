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
import type { IR, Year } from '$lib/data';

/**
 * Supported actions:
 * - get
 * - getAll
 * - get*AsStore
 * - getAll*AsStore
 * - exists
 */
export interface ReadDatabase {
    getIR(irid: IRID): Promise<IR | undefined>;

    getAllIRs(): Promise<IR[]>;

    getAllIRsAsStore(): Readable<IR[] | 'loading'>;

    getIRAsStore(irid: IRID): Readable<IR | undefined | 'loading'>;

    existsIR(irid: IRID): Promise<boolean>;

    getIndependentProtocol(spid: SPID): Promise<Raw<FormNSP> | undefined>;

    getIndependentProtocolAsStore(spid: SPID): Readable<Raw<FormNSP> | undefined | 'loading'>;

    getAllIndependentProtocols(): Promise<Raw<FormNSP>[]>;

    getAllIndependentProtocolsAsStore(): Readable<Raw<FormNSP>[] | 'loading'>;
}

/**
 * Supported actions:
 * - add
 * - delete
 * - update
 */
export interface WriteDatabase {
    addIR(ir: IR): Promise<void>;

    deleteIR(irid: IRID): Promise<void>;

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
    'getIR', 'getAllIRs', 'getAllIRsAsStore', 'getIRAsStore', 'addIR', 'deleteIR', 'existsIR', 'updateIRRecord', 'addHeatPumpCheck',
    'addSolarSystemCheck', 'addServiceProtocol', 'updateServiceProtocol', 'updateHeatPumpCommissioningProtocol',
    'addSolarSystemCommissioningProtocol', 'addPhotovoltaicSystemCommissioningProtocol', 'updateIRUsers',
    'updateHeatPumpRecommendationsSettings', 'updateSolarSystemRecommendationsSettings', 'addIndependentServiceProtocol',
    'deleteIndependentProtocol', 'getIndependentProtocol', 'getIndependentProtocolAsStore', 'getAllIndependentProtocols',
    'getAllIndependentProtocolsAsStore', 'addFaceTable', 'updateIndependentServiceProtocol',
] as const satisfies (keyof Database)[];