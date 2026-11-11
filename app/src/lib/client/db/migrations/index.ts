import { paymentMethodMigrationIR, paymentMethodMigrationNSP } from './paymentMethodMigration';
import type { Data, DataType } from '$lib/data';

export type Migration<
    T extends DataType,
    OldType = any,
    NewType = any,
> = {
    type: T,
    name: string,
    description: string,
    fromVersion: number,
    run: (old: OldType) => NewType,
}

type CheckMigrations<
    T extends DataType,
    L extends Migration<T>[],
> = L extends [...infer Rest extends Migration<T>[], infer M1, infer M2]
    ? M1 extends Migration<T, infer From>
        ? M2 extends Migration<T, any, infer To>
            ? [To] extends [From]
                ? [...CheckMigrations<T, [...Rest, M1]>, M2]
                : never : never : never
    : L extends [infer M]
        ? M extends Migration<T, any, infer To>
            ? [To] extends [Data<T>]
                ? [M]
                : never : never
        : L extends [] ? [] : never;

const checkMigrations = <
    T extends DataType,
    const L extends Migration<T>[],
>(...migrations: L & CheckMigrations<T, L>): L => migrations;

export const migrationsIR: Migration<'IR'>[] = checkMigrations(
    paymentMethodMigrationIR,
);
export const migrationsNSP: Migration<'NSP'>[] = checkMigrations(
    paymentMethodMigrationNSP,
);