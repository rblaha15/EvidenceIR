import {
    type Database,
    isWriteFunction,
    type ReadDatabase,
    readDatabaseMethods,
    writeDatabaseMethods
} from "$lib/client/db/def";
import { offlineDatabase, offlineDatabaseManager } from "$lib/client/db/offline.svelte";
import type { IRID, NSPID } from "$lib/helpers/ir";
import type { IR, NSP } from "$lib/data";

export const mongoDatabase: Database = [...readDatabaseMethods, ...writeDatabaseMethods].associateWith(name =>
    async (...args: Parameters<Database[typeof name]>) => {
        // logEvent(analytics(), 'fetch_mongo_database', { name, args });
        if (!isWriteFunction(name)) {
            const response = await fetch('/api/db/read', {
                method: 'POST',
                body: JSON.stringify({ name, args }),
                headers: {
                    'content-type': 'application/json',
                }
            });

            if (!response.ok) throw new Error(await response.text());
            const result = await response.json() as Awaited<ReturnType<ReadDatabase[typeof name]>>;

            if (name == 'getIR')
                await offlineDatabaseManager.put('IR', args[0] as IRID, result as IR)
            if (name == 'getNSP')
                await offlineDatabaseManager.put('NSP', args[0] as NSPID, result as NSP)

            return result;
        } else {

            const response = await fetch('/api/db/write', {
                method: 'POST',
                body: JSON.stringify({ name, args }),
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
