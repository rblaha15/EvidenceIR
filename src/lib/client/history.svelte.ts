import { type EmailOptions, sendEmailAndUploadAttachments } from '$lib/client/email';
import { derived, writable } from 'svelte/store';
import { firestoreDatabase } from '$lib/client/firestore';
import { irName, irNumberFromIRID, irWholeName, spName, spWholeName, szName } from '$lib/helpers/ir';
import type { Translations } from '$lib/translations';
import type { Template, TemplateArgs } from '$lib/helpers/templates';
import { browser } from '$app/environment';
import { openDB } from 'idb';
import { type Database, isWriteFunction, type WriteFunction } from '$lib/Database';
import { grantPointsOnline, type LoyaltyProgramTrigger } from '$lib/client/loyaltyProgram';
import { isOnline } from '$lib/client/realtimeOnline';
import { isSP } from '$lib/forms/SP/infoSP.svelte';

type HistoryDatabase<F extends keyof Database = keyof Database> = {
    type: 'database'
    functionName: F;
    args: Parameters<Database[F]>;
}
type HistoryEmail = {
    type: 'email',
    message: EmailOptions,
};
type HistoryLoyaltyProgram = {
    type: 'loyaltyProgram',
    trigger: LoyaltyProgramTrigger,
};
type HistoryEntry<
    F extends keyof Database = keyof Database,
    T extends HistoryDatabase<F> | HistoryEmail | HistoryLoyaltyProgram = HistoryDatabase<F> | HistoryEmail | HistoryLoyaltyProgram
> = {
    timestamp: number;
    completed: boolean;
} & T;

const maxAge = 14 * 24 * 60 * 60 * 1000 /* Two weeks */;

const db = browser ? openDB<{
    history: {
        value: HistoryEntry;
        key: number;
    };
}>('history', 3, {
    upgrade: db => {
        if (!db.objectStoreNames.contains('history'))
            db.createObjectStore('history');
    },
}) : undefined;

const stored = writable<(HistoryEntry)[]>([], set => {
    get().then(set);
});
const add = async (newEntry: HistoryEntry) => {
    if (!browser) return;
    if (newEntry.completed && !isToShow(newEntry)) return; //console.log('Skipping completed entry:', newEntry);
    const adb = await db!;
    const entrySnapshot = $state.snapshot(newEntry) as HistoryEntry;
    // console.log('Adding entry to history:', newEntry.timestamp, entrySnapshot);
    await adb.add('history', entrySnapshot, newEntry.timestamp);
    stored.update(history => [...history, entrySnapshot]);
    await adb.delete('history', IDBKeyRange.upperBound(timestamp() - maxAge));
};
const get = async () => {
    if (!browser) return [];
    return (await (await db!).getAll('history'))!;
};
const getIncomplete = async () => {
    const all = await get();
    return all.filter(entry => !entry.completed);
};
const getIncompleteAndComplete = async () => {
    const incompleted = await getIncomplete();
    await (await db!).transaction('history', 'readwrite').let(async tx => {
        await incompleted.map(entry =>
            isToShow(entry)
                ? tx.objectStore('history').put({ ...entry, completed: true }, entry.timestamp)?.then?.(_ => {})
                : tx.objectStore('history').delete(entry.timestamp),
        ).awaitAll();
        await tx.done;
    });
    stored.update(history => history.map(entry => ({ ...entry, completed: true })));
    return incompleted;
};
export const clearHistory = async () => {
    if (!browser) return;
    stored.set([]);
    await (await db!).clear('history');
};

const timestamp = () => new Date().valueOf();

export const addToHistory = <F extends keyof Database = keyof Database>(
    functionName: F,
    args: Parameters<Database[F]>,
    completed: boolean,
) => {
    console.log('Adding', functionName, 'with args', ...args, 'to the history');
    add({ functionName, args, type: 'database', completed, timestamp: timestamp() }).then();
};

export const addEmailToHistory = (message: EmailOptions, completed: boolean) => {
    console.log('Adding email', message, 'to the history');
    add({ message, type: 'email', completed, timestamp: timestamp() }).then();
};

export const addLoyaltyProgramTriggerToHistory = (trigger: LoyaltyProgramTrigger, completed: boolean) => {
    console.log('Adding loyalty points trigger', trigger, 'to the history');
    add({ trigger, type: 'loyaltyProgram', completed, timestamp: timestamp() }).then();
};

export const processOfflineHistory = async () => {
    const current = await getIncompleteAndComplete();
    for (const entry of current) {
        if (entry.type === 'email') {
            const { message } = entry;
            console.log('Sending email', message, 'from the offline history');
            await sendEmailAndUploadAttachments(message);
        } else if (entry.type === 'loyaltyProgram') {
            const { trigger } = entry;
            console.log('Triggering loyalty points', trigger, 'from the offline history');
            await grantPointsOnline(trigger);
        } else {
            const { args, functionName } = entry;
            console.log('Executing', functionName, 'with args', ...args, 'from the offline history');
            const func = firestoreDatabase[functionName];
            try {
                // @ts-expect-error TS doesn't know it's a tuple
                await func(...args);
            } catch (e) {
                console.error('Error executing', functionName, 'with args', ...args, 'from the offline history:', e);
            }
        }
    }

    const after = await getIncomplete();
    if (after.length) await processOfflineHistory();
};

isOnline.subscribe(async online => {
    if (online && browser) await processOfflineHistory();
});

const functions: {
    [F in WriteFunction]: (...args: Parameters<Database[F]>) => Parameters<Translations['nav']['history']['f'][F]>[0]
} = {
    addIR: ir => ({ ir: irWholeName(ir.IN) }),
    deleteIR: irid => ({ ir: irNumberFromIRID(irid) }),
    updateIN: (_, e) => ({ ir: irName(e.ir) }),
    addRKT: (irid, pump, year) => ({ ir: irNumberFromIRID(irid), pump: `${pump}`, year: `${year}` }),
    addRKS: (irid, year) => ({ ir: irNumberFromIRID(irid), year: `${year}` }),
    addSP: (irid, p) => ({ ir: irNumberFromIRID(irid), sp: isSP(p) ? spName(p.zasah) : szName(p.zasah) }),
    updateSP: (irid, _, p) => ({ ir: irNumberFromIRID(irid), sp: isSP(p) ? spName(p.zasah) : szName(p.zasah) }),
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

const readableFunction = <F extends WriteFunction>(t: Translations, entry: HistoryDatabase<F>) =>
    (t.nav.history.f[entry.functionName as F] as Template<(string | number)[]>)(functions[entry.functionName](...entry.args) as TemplateArgs<(string | number)[]>) as string;

export type DisplayableHistoryEntry = {
    completed: boolean;
    type: 'email' | 'database';
    datetime: string;
    subject: (t: Translations) => string;
}

const isToShow = (entry: HistoryEntry): entry is HistoryEntry<WriteFunction, HistoryDatabase<WriteFunction> | HistoryEmail> =>
    entry.type === 'email' || entry.type === 'database' && isWriteFunction(entry.functionName);

export const readableHistory = derived(stored, history => {
    const all = history.filter(isToShow);

    const sorted = all.sort((a, b) => b.timestamp - a.timestamp);

    const readable = sorted.map(entry => ({
        completed: entry.completed,
        type: entry.type,
        datetime: new Date(entry.timestamp).toLocaleString('cs'),
        subject: (t: Translations) => entry.type == 'database' ? readableFunction(t, entry)
            : t.nav.history[entry.completed ? 'sentEmail' : 'unsentEmail'](entry.message),
    }));

    return {
        completed: readable.filter(entry => entry.completed),
        incompleted: readable.filter(entry => !entry.completed),
    };
});