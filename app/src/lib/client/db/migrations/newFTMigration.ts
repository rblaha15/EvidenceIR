import type { Migration } from '$lib/client/db/migrations/index';
import type { IR } from '$lib/data';
import type { Raw } from '$lib/forms/Form';
import type { FormFT } from '$lib/forms/FT/formFT';

type C<T extends Record<PropertyKey, { chosen: unknown }>> = {
    [K in keyof T]: T[K]['chosen']
}

export type BeforeNewFTMigrationIR = Omit<IR, 'FT'> & {
    FT?: Pick<NonNullable<IR['FT']>, 'info'> & {
        inputsC: C<Omit<NonNullable<IR['FT']>['inputs'], 'B8' | 'B9'>>,
        inputsB: C<Pick<NonNullable<IR['FT']>['inputs'], 'B8' | 'B9'>>,
        outputsF: C<Omit<NonNullable<IR['FT']>['outputs'], 'B2' | 'B3' | 'UNI_AO1' | 'UNI2_AO1'>>,
        outputsB: C<Pick<NonNullable<IR['FT']>['outputs'], 'B2' | 'B3' | 'UNI_AO1' | 'UNI2_AO1'>>,
    }
};

export const newFTMigration: Migration<'IR', BeforeNewFTMigrationIR, IR> = {
    type: 'IR',
    name: 'newFTMigration',
    description: 'Nové FT (přeházené výstupy a vstupy)',
    fromVersion: 5,
    run: oldIR => ({
        ...oldIR,
        FT: oldIR.FT ? {
            ...oldIR.FT,
            inputs: {
                ...oldIR.FT.inputsB.mapValues((_, v) => ({ chosen: v, text: '' })),
                ...oldIR.FT.inputsC.mapValues((_, v) => ({ chosen: v, text: '' })),
            },
            outputs: {
                ...oldIR.FT.outputsB.mapValues((_, v) => ({ chosen: v, text: '' })),
                ...oldIR.FT.outputsF.mapValues((_, v) => ({ chosen: v, text: '' })),
            },
        } satisfies Raw<FormFT> : undefined,
    }) as IR,
};