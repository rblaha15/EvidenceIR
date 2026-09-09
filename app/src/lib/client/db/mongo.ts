import {
    type Database,
    isWriteFunction,
    type ReadDatabase,
    readDatabaseMethods,
    writeDatabaseMethods
} from "$lib/client/db/def";
import type { DatabaseWithFetch } from '$lib/client/db/index';
import { offlineDatabase, offlineDatabaseManager } from "$lib/client/db/offline.svelte";
import type { IRID, NSPID } from "$lib/helpers/ir";
import type { IR, NSP } from "$lib/data";

export const mongoDatabase: DatabaseWithFetch = [...readDatabaseMethods, ...writeDatabaseMethods].associateWith(name =>
    async (...argsWithFetch: Parameters<DatabaseWithFetch[typeof name]>) => {
        const last = argsWithFetch.at(-1);
        const args = (!last ? [] : last instanceof Function ? argsWithFetch.slice(0, -1) : argsWithFetch) as Parameters<Database[typeof name]>;
        const fetch = last && last instanceof Function ? last as typeof window.fetch : window.fetch;

        if (!isWriteFunction(name)) {
            const response = await fetch(`/api/db/read?name=${name}`, {
                method: 'POST',
                body: JSON.stringify({ args }),
                headers: {
                    'content-type': 'application/json',
                }
            });

            if (!response.ok) throw new Error(await response.text());
            const result = await response.json() as Awaited<ReturnType<ReadDatabase[typeof name]>>;

            if (name == 'getIR')
                await offlineDatabaseManager.set('IR', args[0] as IRID, result as IR)
            if (name == 'getNSP')
                await offlineDatabaseManager.set('NSP', args[0] as NSPID, result as NSP)

            return result;
        } else {
            const response = await fetch(`/api/db/write?name=${name}`, {
                method: 'POST',
                body: JSON.stringify({ args }),
                headers: {
                    'content-type': 'application/json',
                }
            });

            if (!response.ok) throw new Error(await response.text());

            const func = offlineDatabase[name];
            // @ts-expect-error TS doesn't know it's a tuple
            func(...args).then();
        }
    },
) as Database;
