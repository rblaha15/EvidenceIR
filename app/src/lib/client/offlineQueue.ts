import type { EmailMessage } from '$lib/client/email';
import { type Database, isWriteFunction, type WriteFunction } from '$lib/client/data';
import { derived, get } from 'svelte/store';
import { storable } from '$lib/helpers/stores';
import { getToken } from '$lib/client/auth';
import { firestoreDatabase } from '$lib/client/firestore';
import { irName, irNumberFromIRID, irWholeName, spName, spWholeName } from '$lib/helpers/ir';
import { isOnline } from './realtime';

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

const doWhenOnlineQueue = storable<DoWhenOnline[]>('doWhenOnlineQueue', []);

export const addToOfflineQueue = <F extends keyof Database = keyof Database>(
    functionName: F,
    args: Parameters<Database[F]>,
) => {
    console.log('Adding', functionName, 'with args', ...args, 'to the offline queue');
    doWhenOnlineQueue.update(q => [...q, { functionName, args, type: 'database' }]);
};

export const addEmailToOfflineQueue = (message: EmailMessage) => {
    console.log('Adding email', message, 'to the offline queue');
    doWhenOnlineQueue.update(q => [...q, { message, type: 'email' }]);
};

export const processOfflineQueue = async () => {
    const current = get(doWhenOnlineQueue);
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

    doWhenOnlineQueue.update(q => q.slice(current.length));
    const after = get(doWhenOnlineQueue);
    if (after.length) await processOfflineQueue();
};

isOnline.subscribe(async online => {
    if (online) await processOfflineQueue();
});

const importantItemsInOfflineQueue = derived(doWhenOnlineQueue, q =>
    q.filter(dwo =>
        dwo.type === 'email' || isWriteFunction(dwo.functionName),
    ) as DoWhenOnline<WriteFunction>[],
);

const functions: {
    [F in WriteFunction]: (...args: Parameters<Database[F]>) => string
} = {
    addIR: ir => `Zaevidován nový regulátor (${irWholeName(ir.evidence)})`,
    deleteIR: irid => `Odstraněna evidence IR ${irNumberFromIRID(irid)}`,
    updateIRRecord: e => `Upravena data u IR ${irName(e.ir)}`,
    addHeatPumpCheck: (irid, pump, year) =>
        `Vytvořena roční kontrola TČ ${pump} pro rok ${year} u IR ${irNumberFromIRID(irid)}`,
    addServiceProtocol: (irid, p) => `Vytvořen servisní protokol ${spName(p.zasah)} u IR ${irNumberFromIRID(irid)}`,
    updateServiceProtocol: (irid, _, p) => `Upraven servisní protokol ${spName(p.zasah)} u IR ${irNumberFromIRID(irid)}`,
    addHeatPumpCommissioningProtocol: irid => `Vytvořen protokol o uvedení TČ do provozu u IR ${irNumberFromIRID(irid)}`,
    addSolarSystemCommissioningProtocol: irid => `Vytvořen protokol o uvedení SOL do provozu u IR ${irNumberFromIRID(irid)}`,
    addPhotovoltaicSystemCommissioningProtocol: irid => `Vytvořen protokol o uvedení FVE do provozu u IR ${irNumberFromIRID(irid)}`,
    updateIRUsers: irid => `Změněn seznam uživatelů s přístupem k ${irNumberFromIRID(irid)}`,
    addIndependentServiceProtocol: p => `Vytvořen nezávislý servisní protokol ${spWholeName(p)}`,
    deleteIndependentProtocol: spid => `Odstraněn nezávislý servisní protokol ${spid}`,
};

const readableFunction = <F extends WriteFunction>(dwo: DoWhenOnlineDatabase<F>) => functions[dwo.functionName](...dwo.args);

export const readableQueue = derived(importantItemsInOfflineQueue, q =>
    q.map(dwo => dwo.type == 'email'
        ? { type: 'email', subject: 'Neodeslaný email: ' + dwo.message.subject } as const
        : { type: 'database', subject: readableFunction(dwo) } as const,
    ),
);