import type { Readable } from 'svelte/store';
import { getIsOnline, isOnline } from '$lib/client/realtimeOnline';
import { flatDerived } from '$lib/helpers/stores';
import { offlineDatabase } from '$lib/client/db/offline.svelte';
import { addToHistory } from '$lib/client/history.svelte';
import { type Database, databaseMethods, type GetAsStoreFunction, isGetAsStoreFunction, } from "$lib/client/db/def";
import { mongoDatabase } from "$lib/client/db/mongo";

type GetAsStoreFunctionReturnType = ReturnType<Database[GetAsStoreFunction]> extends Readable<infer T> ? Readable<T> : never;
const mergedStore = (name: GetAsStoreFunction, args: Parameters<Database[GetAsStoreFunction]>): GetAsStoreFunctionReturnType => flatDerived(
    isOnline,
    $isOnline => {
        const db = $isOnline ? mongoDatabase : offlineDatabase;
        // @ts-expect-error TS doesn't know it's a tuple
        return db[name](...args) as GetAsStoreFunctionReturnType;
    },
    (_, $isOnline) => {
        // console.log('Got value from the', name, 'store from the', $isOnline ? 'online' : 'offline', 'database')
    },
);

const decide = <F extends keyof Database>(name: F, args: Parameters<Database[F]>): ReturnType<Database[F]> => {
    // console.log('Executing', name, 'with args', ...args);

    if (isGetAsStoreFunction(name)) {
        return mergedStore(name, args as Parameters<Database[GetAsStoreFunction]>) as ReturnType<Database[F]>;
    } else {
        const isOnline = getIsOnline();
        const db = isOnline ? mongoDatabase : offlineDatabase;
        addToHistory(name, args, isOnline);

        // @ts-expect-error TS doesn't know it's a tuple
        return db[name](...args);
    }
};

const db: Database = databaseMethods.associateWith(name =>
    (...args: Parameters<Database[typeof name]>) => decide(name, args),
) as {
    [F in typeof databaseMethods[number]]: Database[F];
};

export default db;