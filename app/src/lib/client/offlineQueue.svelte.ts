import type { EmailMessage } from '$lib/client/email';
import { type Database, isWriteFunction, type WriteFunction } from '$lib/data';
import { derived, writable } from 'svelte/store';
import { getToken } from '$lib/client/auth';
import { firestoreDatabase } from '$lib/client/firestore';
import { irName, irNumberFromIRID, irWholeName, spName, spWholeName } from '$lib/helpers/ir';
import { isOnline } from './realtime';
import type { Translations } from '$lib/translations';
import type { Template, TemplateArgs } from '$lib/helpers/templates';
import { browser } from '$app/environment';
import { openDB } from 'idb';

type DoWhenOnlineDatabase<F extends keyof Database = keyof Database> = {
    type: 'database'
    functionName: F;
    args: Parameters<Database[F]>;
}
type DoWhenOnlineEmail = {
    type: 'email',
    message: EmailMessage,
};
type DoWhenOnline<F extends keyof Database = keyof Database> =
    DoWhenOnlineDatabase<F> | DoWhenOnlineEmail;

// const doWhenOnlineQueue = storable<DoWhenOnline[]>('doWhenOnlineQueue', []);

const db = browser ? openDB<{
    doWhenOnlineQueue: {
        value: DoWhenOnline;
        key: number;
    };
}>('doWhenOnlineQueue', 1, {
    upgrade: db => {
        if (!db.objectStoreNames.contains('doWhenOnlineQueue'))
            db.createObjectStore('doWhenOnlineQueue');
    },
}) : undefined;

const stored = writable<DoWhenOnline[]>([], set => {
    get().then(set);
});

const length = async (adb: NonNullable<Awaited<typeof db>>) =>
    (await adb.getAllKeys('doWhenOnlineQueue')).length;
const add = async (i: DoWhenOnline) => {
    if (!browser) return;
    stored.update(q => [...q, i]);
    const adb = await db!;
    await adb.add('doWhenOnlineQueue', $state.snapshot(i) as DoWhenOnline, await length(adb));
}
const get = async () => {
    if (!browser) return [];
    return (await (await db!).getAll('doWhenOnlineQueue'))!;
}
const clear = async () => {
    if (!browser) return;
    stored.set([]);
    await (await db!).clear('doWhenOnlineQueue');
}

export const addToOfflineQueue = <F extends keyof Database = keyof Database>(
    functionName: F,
    args: Parameters<Database[F]>,
) => {
    console.log('Adding', functionName, 'with args', ...args, 'to the offline queue');
    add({ functionName, args, type: 'database' })
    // doWhenOnlineQueue.update(q => [...q, { functionName, args, type: 'database' }]);
};

export const addEmailToOfflineQueue = (message: EmailMessage) => {
    console.log('Adding email', message, 'to the offline queue');
    add({ message, type: 'email' })
    // doWhenOnlineQueue.update(q => [...q, { message, type: 'email' }]);
};

export const processOfflineQueue = async () => {
    const current = await get();
    await clear();
    await current.map(async dwo => {
        if (dwo.type === 'email') {
            const { message } = dwo;
            console.log('Sending email', message, 'from the offline queue');
            const token = await getToken();
            await fetch(`/api/sendEmail?token=${token}`, {
                method: 'POST',
                body: JSON.stringify({ message }),
                headers: {
                    'content-type': 'application/json',
                },
            });
        } else {
            const { args, functionName } = dwo;
            console.log('Executing', functionName, 'with args', ...args, 'from the offline queue');
            const func = firestoreDatabase[functionName];
            // @ts-expect-error TS doesn't know it's a tuple
            func(...args);
        }
    }).awaitAll();

    const after = await get();
    if (after.length) await processOfflineQueue();
};

isOnline.subscribe(async online => {
    if (online) await processOfflineQueue();
});

const importantItemsInOfflineQueue = derived(stored, q =>
    q.filter(dwo =>
        dwo.type === 'email' || isWriteFunction(dwo.functionName),
    ) as DoWhenOnline<WriteFunction>[],
);

const functions: {
    [F in WriteFunction]: (...args: Parameters<Database[F]>) => Parameters<Translations['nav']['offlineQueue']['f'][F]>[0]
} = {
    addIR: ir => ({ ir: irWholeName(ir.evidence) }),
    deleteIR: irid => ({ ir: irNumberFromIRID(irid) }),
    updateIRRecord: e => ({ ir: irName(e.ir) }),
    addHeatPumpCheck: (irid, pump, year) => ({ ir: irNumberFromIRID(irid), pump: `${pump}`, year: `${year}` }),
    addServiceProtocol: (irid, p) => ({ ir: irNumberFromIRID(irid), sp: spName(p.zasah) }),
    updateServiceProtocol: (irid, _, p) => ({ ir: irNumberFromIRID(irid), sp: spName(p.zasah) }),
    addFaceTable: irid => ({ ir: irNumberFromIRID(irid) }),
    addHeatPumpCommissioningProtocol: irid => ({ ir: irNumberFromIRID(irid) }),
    addSolarSystemCommissioningProtocol: irid => ({ ir: irNumberFromIRID(irid) }),
    addPhotovoltaicSystemCommissioningProtocol: irid => ({ ir: irNumberFromIRID(irid) }),
    updateIRUsers: irid => ({ ir: irNumberFromIRID(irid) }),
    updateRecommendationsSettings: irid => ({ ir: irNumberFromIRID(irid) }),
    addIndependentServiceProtocol: p => ({ sp: spWholeName(p) }),
    updateIndependentServiceProtocol: p => ({ sp: spWholeName(p) }),
    deleteIndependentProtocol: spid => ({ spid }),
};

const readableFunction = <F extends WriteFunction>(dwo: DoWhenOnlineDatabase<F>) =>
    (t: Translations) => (t.nav.offlineQueue.f[dwo.functionName as F] as Template<(string | number)[]>)(functions[dwo.functionName](...dwo.args) as TemplateArgs<(string | number)[]>) as string;

export const readableQueue = derived(importantItemsInOfflineQueue, q =>
    q.map(dwo => dwo.type == 'email'
        ? { type: 'email', subject: (t: Translations) => t.nav.offlineQueue.unsentEmail(dwo.message) } as const
        : { type: 'database', subject: readableFunction(dwo) } as const,
    ),
);