import { type Migration, migrationsIR, migrationsNSP } from '$lib/client/db/migrations';
import type { Data, DataType, IR, NSP } from '$lib/data';
import { getAllIRs, getAllNSPs, setAllIRs, setAllNSPs } from '$lib/server/db/admin/general';

export const migrateFromVersion = <T extends DataType>(
    type: T,
    oldVersion: number,
    oldData: unknown[],
) => {
    const all: Migration<DataType>[] = {
        IR: migrationsIR,
        NSP: migrationsNSP,
    }[type];

    const filtered = all.filter(m => m.fromVersion > oldVersion);

    return filtered.reduceRight(applyMigration, oldData) as Data<T>[];
};

export const applyMigration = <T extends DataType, Old, New>(
    oldData: Old[],
    migration: Migration<T, Old, New>,
) => oldData.map(migration.run);

export const runMigrationOnCurrentData = async ({ migrationName }: {
    migrationName: string,
}) => {
    const migration = [...migrationsIR, ...migrationsNSP].find(m => m.name == migrationName);
    console.log(migration);
    if (migration?.type == 'IR') {
        const all = await getAllIRs();
        const migrated = applyMigration<'IR', IR, IR>(all, migration);
        await setAllIRs(migrated);
        return migrated.length;
    } else if (migration?.type == 'NSP') {
        const all = await getAllNSPs();
        const migrated = applyMigration<'NSP', NSP, NSP>(all, migration);
        await setAllNSPs(migrated);
        return migrated.length;
    }
    return 0;
};