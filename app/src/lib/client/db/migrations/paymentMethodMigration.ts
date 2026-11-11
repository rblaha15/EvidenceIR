import type { Migration } from '$lib/client/db/migrations/index';
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

export type BeforePaymentMethodMigrationIR = Omit<IR, 'SPs'> & {
    SPs: Record<SPID, BeforePaymentMethodMigrationSP | Raw<FormSZ>>,
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

export const paymentMethodMigrationIR: Migration<'IR', BeforePaymentMethodMigrationIR, IR> = {
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
    }) as IR,
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