import type { Migration } from '$lib/client/db/migrations/index';
import type { BeforeNewFTMigrationIR } from '$lib/client/db/migrations/newFTMigration';
import type { IR, NSP } from '$lib/data';
import type { Raw } from '$lib/forms/Form';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';
import type { FormSZ } from '$lib/forms/SP/formSZ';
import type { SPID } from '$lib/helpers/ir';

export type BeforePaymentMethodMigrationSP = Omit<Raw<FormSP>, 'fakturace'> & {
    fakturace: Omit<Raw<FormSP>['fakturace'], 'paymentMethod'> & {
        hotove: 'yes' | 'no' | 'doNotInvoice';
    };
};

export type BeforePaymentMethodMigrationIR = Omit<IR, 'SPs' | 'FT'> & {
    SPs: Record<SPID, BeforePaymentMethodMigrationSP | Raw<FormSZ>>,
    FT?: {
        inputsC: Omit<NonNullable<IR['FT']>['inputs'], 'B8' | 'B9'>,
        inputsB: Pick<NonNullable<IR['FT']>['inputs'], 'B8' | 'B9'>,
        outputsF: Omit<NonNullable<IR['FT']>['outputs'], 'B2' | 'B3' | 'UNI_AO1' | 'UNI2_AO1'>,
        outputsB: Pick<NonNullable<IR['FT']>['outputs'], 'B2' | 'B3' | 'UNI_AO1' | 'UNI2_AO1'>,
    }
};

export type BeforePaymentMethodMigrationNSP = Omit<NSP, 'NSP'> & {
    NSP: Omit<Raw<FormNSP>, 'fakturace'> & {
        fakturace: BeforePaymentMethodMigrationSP['fakturace'];
    };
};

const migrateSP = <Old>(oldSP: Old & { fakturace: BeforePaymentMethodMigrationSP['fakturace'] }) => ({
    ...oldSP,
    fakturace: {
        ...oldSP.fakturace.omit('hotove'),
        paymentMethod: ('paymentMethod' in oldSP.fakturace)
            ? oldSP.fakturace.paymentMethod as Raw<FormSP>['fakturace']['paymentMethod']
            : {
                chosen: oldSP.fakturace.hotove == 'yes' ? 'cash' as const
                    : oldSP.fakturace.hotove == 'no' ? 'transfer' as const
                        : oldSP.fakturace.hotove,
                text: '',
            },
    },
}) satisfies Old & { fakturace: Raw<FormSP>['fakturace'] };

const isOldSP = (
    raw: BeforePaymentMethodMigrationSP | Raw<FormSZ> | undefined,
): raw is BeforePaymentMethodMigrationSP =>
    !!raw && ('ukony' in raw);

export const paymentMethodMigrationIR: Migration<'IR', BeforePaymentMethodMigrationIR, BeforeNewFTMigrationIR> = {
    type: 'IR',
    name: 'paymentMigrationIR',
    description: 'Možnost nefakturovat u platby hotově + důvod nefakturace (IR)',
    fromVersion: 4,
    run: oldIR => ({
        ...oldIR,
        SPs: oldIR.SPs.mapValues((_, protocol) =>
            isOldSP(protocol)
                ? migrateSP(protocol) satisfies Omit<Raw<FormSP>, 'fakturace'> & Pick<Raw<FormSP>, 'fakturace'>
                : protocol,
        ),
    }) as BeforeNewFTMigrationIR,
};

export const paymentMethodMigrationNSP: Migration<'NSP', BeforePaymentMethodMigrationNSP, NSP> = {
    type: 'NSP',
    name: 'paymentMigrationNSP',
    description: 'Možnost nefakturovat u platby hotově + důvod nefakturace (NSP)',
    fromVersion: 4,
    run: oldNSP => ({
        ...oldNSP,
        NSP: migrateSP(oldNSP.NSP) satisfies Omit<NSP['NSP'], 'fakturace'> & Pick<NSP['NSP'], 'fakturace'>,
    }) as NSP,
};