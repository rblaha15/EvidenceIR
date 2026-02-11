import { type EmailOptions, sendEmailAndUploadAttachments } from '$lib/client/email';
import { derived, writable } from 'svelte/store';
import { firestoreDatabase } from '$lib/client/firestore';
import { irName, irNumberFromIRID, irWholeName, spName, spWholeName } from '$lib/helpers/ir';
import type { Translations } from '$lib/translations';
import type { Template, TemplateArgs } from '$lib/helpers/templates';
import { browser } from '$app/environment';
import { openDB } from 'idb';
import { type Database, isWriteFunction, type WriteFunction } from '$lib/Database';
import { grantPointsOnline, type LoyaltyProgramTrigger } from '$lib/client/loyaltyProgram';
import { isOnline } from '$lib/client/realtimeOnline';

type DoWhenOnlineDatabase<F extends keyof Database = keyof Database> = {
    type: 'database'
    functionName: F;
    args: Parameters<Database[F]>;
}
type DoWhenOnlineEmail = {
    type: 'email',
    message: EmailOptions,
};
type DoWhenOnlineLoyaltyProgram = {
    type: 'loyaltyProgram',
    trigger: LoyaltyProgramTrigger,
};
type DoWhenOnline<F extends keyof Database = keyof Database> =
    DoWhenOnlineDatabase<F> | DoWhenOnlineEmail | DoWhenOnlineLoyaltyProgram;

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
};
const get = async () => {
    if (!browser) return [];
    return (await (await db!).getAll('doWhenOnlineQueue'))!;
};
export const clearOfflineQueue = async () => {
    if (!browser) return;
    stored.set([]);
    await (await db!).clear('doWhenOnlineQueue');
};

export const addToOfflineQueue = <F extends keyof Database = keyof Database>(
    functionName: F,
    args: Parameters<Database[F]>,
) => {
    console.log('Adding', functionName, 'with args', ...args, 'to the offline queue');
    add({ functionName, args, type: 'database' });
    // doWhenOnlineQueue.update(q => [...q, { functionName, args, type: 'database' }]);
};

export const addEmailToOfflineQueue = (message: EmailOptions) => {
    console.log('Adding email', message, 'to the offline queue');
    add({ message, type: 'email' });
    // doWhenOnlineQueue.update(q => [...q, { message, type: 'email' }]);
};

export const addLoyaltyProgramTriggerToOfflineQueue = (trigger: LoyaltyProgramTrigger) => {
    console.log('Adding loyalty poits trigger', trigger, 'to the offline queue');
    add({ trigger, type: 'loyaltyProgram' });
    // doWhenOnlineQueue.update(q => [...q, { message, type: 'email' }]);
};

export const processOfflineQueue = async () => {
    const current = await get();
    await clearOfflineQueue();
    for (const dwo of current) {
        if (dwo.type === 'email') {
            const { message } = dwo;
            console.log('Sending email', message, 'from the offline queue');
            await sendEmailAndUploadAttachments(message);
        } else if (dwo.type === 'loyaltyProgram') {
            const { trigger } = dwo;
            console.log('Triggering loyalty points', trigger, 'from the offline queue');
            await grantPointsOnline(trigger);
        } else {
            const { args, functionName } = dwo;
            console.log('Executing', functionName, 'with args', ...args, 'from the offline queue');
            const func = firestoreDatabase[functionName];
            try {
                // @ts-expect-error TS doesn't know it's a tuple
                await func(...args);
            } catch (e) {
                console.error('Error executing', functionName, 'with args', ...args, 'from the offline queue:', e);
            }
        }
    }

    const after = await get();
    if (after.length) await processOfflineQueue();
};

isOnline.subscribe(async online => {
    if (online) await processOfflineQueue();
});

const importantItemsInOfflineQueue = derived(stored, q =>
    q.filter(dwo =>
        dwo.type !== 'database' || isWriteFunction(dwo.functionName),
    ) as DoWhenOnline<WriteFunction>[],
);

const functions: {
    [F in WriteFunction]: (...args: Parameters<Database[F]>) => Parameters<Translations['nav']['offlineQueue']['f'][F]>[0]
} = {
    addIR: ir => ({ ir: irWholeName(ir.IN) }),
    deleteIR: irid => ({ ir: irNumberFromIRID(irid) }),
    updateIN: (_, e) => ({ ir: irName(e.ir) }),
    addRKT: (irid, pump, year) => ({ ir: irNumberFromIRID(irid), pump: `${pump}`, year: `${year}` }),
    addRKS: (irid, year) => ({ ir: irNumberFromIRID(irid), year: `${year}` }),
    addSP: (irid, p) => ({ ir: irNumberFromIRID(irid), sp: spName(p.zasah) }),
    updateSP: (irid, _, p) => ({ ir: irNumberFromIRID(irid), sp: spName(p.zasah) }),
    deleteSP: irid => ({ ir: irNumberFromIRID(irid) }),
    addFT: irid => ({ ir: irNumberFromIRID(irid) }),
    updateUPT: irid => ({ ir: irNumberFromIRID(irid) }),
    updateDateUPT: irid => ({ ir: irNumberFromIRID(irid) }),
    addUPS: irid => ({ ir: irNumberFromIRID(irid) }),
    updateDateUPS: irid => ({ ir: irNumberFromIRID(irid) }),
    addUPF: irid => ({ ir: irNumberFromIRID(irid) }),
    updateUsersWithAccessToIR: irid => ({ ir: irNumberFromIRID(irid) }),
    markRefsiteConfirmed: irid => ({ ir: irNumberFromIRID(irid) }),
    updateDKT: irid => ({ ir: irNumberFromIRID(irid) }),
    updateDKS: irid => ({ ir: irNumberFromIRID(irid) }),
    addNSP: p => ({ sp: spWholeName(p.NSP) }),
    updateNSP: (_, p) => ({ sp: spWholeName(p) }),
    deleteNSP: spid => ({ spid }),
};

const readableFunction = <F extends WriteFunction>(dwo: DoWhenOnlineDatabase<F>) =>
    (t: Translations) => (t.nav.offlineQueue.f[dwo.functionName as F] as Template<(string | number)[]>)(functions[dwo.functionName](...dwo.args) as TemplateArgs<(string | number)[]>) as string;

export const readableQueue = derived(importantItemsInOfflineQueue, q =>
    q.map(dwo => dwo.type == 'email'
        ? { type: 'email', subject: (t: Translations) => t.nav.offlineQueue.unsentEmail(dwo.message) } as const
        : dwo.type == 'loyaltyProgram'
            ? { type: 'loyaltyProgram', subject: (t: Translations) => t.nav.offlineQueue.unverifiedLoyaltyPoints(dwo.trigger) } as const
            : { type: 'database', subject: readableFunction(dwo) } as const,
    ),
);