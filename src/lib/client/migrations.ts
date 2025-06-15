import type { Raw } from '$lib/forms/Form';
import type { UvedeniTC } from '$lib/forms/UvedeniTC';
import type { P } from '$lib/translations';
import type { Kontrola } from '$lib/forms/Kontrola.svelte';
import type { SparePart } from '$lib/client/realtime';
import type { DataSP, GenericDataSP } from '$lib/forms/SP.svelte';
import type { IR } from '$lib/client/data';

export type LegacyIR = {
    uvedeni?: Raw<UvedeniTC>;
    installationProtocol?: LegacySP;
    installationProtocols: LegacySP[];
    evidence: {
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
    kontroly?: {
        [R in 1 | 2 | 3 | 4]?: Raw<Kontrola>;
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
        installationProtocol: undefined,
    } : legacyIR;
const addInstallationProtocols: Migration = (legacyIR: LegacyIR & IR) =>
    !legacyIR.installationProtocols ? { ...legacyIR, installationProtocols: [] } : legacyIR;
const migrateND = (d: LegacyND) => ({
    ...d,
    name: d.dil?.name ?? '',
    code: String(d.dil?.code ?? ''),
    unitPrice: String(d.dil?.unitPrice ?? ''),
    warehouse: '',
}) as Raw<DataSP>['nahradniDil1'];
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
    installationProtocols: legacyIR.installationProtocols.map(l => migrateSP(l) as LegacySP),
});
const removeNoPump: Migration = (legacyIR: LegacyIR & IR) => {
    if (legacyIR.evidence.tc.model2 as 'noPump' == 'noPump') legacyIR.evidence.tc.model2 = null;
    if (legacyIR.evidence.tc.model3 as 'noPump' == 'noPump') legacyIR.evidence.tc.model3 = null;
    if (legacyIR.evidence.tc.model4 as 'noPump' == 'noPump') legacyIR.evidence.tc.model4 = null;
    return legacyIR;
};
const addPumpSpecificYearlyChecks: Migration = legacyIR => legacyIR.kontroly ? {
    ...legacyIR,
    kontrolyTC: {
        1: legacyIR.kontroly,
    },
    kontroly: undefined,
} : legacyIR;

type Migration = (legacyIR: LegacyIR & IR) => LegacyIR & IR;

export const modernizeIR = (legacyIR: LegacyIR & IR): IR =>
    // -------->>>>>>
    [removeInstallationProtocol, removeUvedeni, addUserType, changeBOX, changeFaktutruje, changeHPWarranty, addInstallationProtocols, newInstallationProtocols, removeNoPump, addPumpSpecificYearlyChecks]
        .reduce((data, migration) => migration(data), legacyIR);
