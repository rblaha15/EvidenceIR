import type { Readable } from 'svelte/store';
import { getIsOnline, isOnline } from '$lib/client/online';
import { flatDerived } from '$lib/helpers/stores';
import { offlineDatabase } from '$lib/client/db/offline.svelte';
import { addToHistory } from '$lib/client/history.svelte';
import {
    type Database,
    databaseMethods,
    type GetAsStoreFunction,
    isGetAsStoreFunction,
} from '$lib/client/db/def';
import { mongoDatabase } from "$lib/client/db/mongo";

type GetAsStoreFunctionReturnType = ReturnType<Database[GetAsStoreFunction]> extends Readable<infer T> ? Readable<T> : never;
const mergedStore = (name: GetAsStoreFunction, args: Parameters<DatabaseWithFetch[GetAsStoreFunction]>): GetAsStoreFunctionReturnType => flatDerived(
    isOnline,
    $isOnline => {
        const db = $isOnline ? mongoDatabase : offlineDatabase;
        // @ts-expect-error TS doesn't know it's a tuple
        return db[name](...args) as GetAsStoreFunctionReturnType;
    },
);

const decide = <F extends keyof Database>(name: F, args: Parameters<DatabaseWithFetch[F]>): ReturnType<Database[F]> => {
    // console.log('Executing', name, 'with args', ...args);

    if (isGetAsStoreFunction(name)) {
        return mergedStore(name, args as Parameters<DatabaseWithFetch[GetAsStoreFunction]>) as ReturnType<Database[F]>;
    } else {
        const isOnline = getIsOnline();
        const db = isOnline ? mongoDatabase : offlineDatabase;
        addToHistory(name, args, isOnline);

        return db[name](...args);
    }
};

export type DatabaseWithFetch = {
    [F in keyof Database]: ((...args: [...Parameters<Database[F]>, fetch?: typeof window.fetch]) => ReturnType<Database[F]>)
}

const db: DatabaseWithFetch = databaseMethods.associateWith(name =>
    (...argsWithFetch: Parameters<DatabaseWithFetch[typeof name]>) => decide(name, argsWithFetch),
) as {
    [F in typeof databaseMethods[number]]: DatabaseWithFetch[F];
};

export default db;