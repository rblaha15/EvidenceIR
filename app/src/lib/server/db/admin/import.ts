import { env } from '$env/dynamic/private';
import { type Company, type Person, type SparePart, type Technician } from '$lib/client/db/arrays';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import type { IR, NSP, RecommendationData, RecommendationDataWithCode } from '$lib/data';
import type { DocumentDefinition } from '$lib/features/signing/domain/sms';
import type { IRID, NSPID } from '$lib/helpers/ir';
import type { PdfDefiningParameter, PdfToSign } from '$lib/pdf/pdf';
import { setAllDKs, setAllIRs, setAllLPs, setAllNSPs, setAllSNs } from '$lib/server/db/admin/general';
import { setArrays, setCompanies, setPeople, setSpareParts, setTechnicians } from '$lib/server/db/arrays';
import type { DocumentSigningInfo } from '$lib/server/signing';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
import { getFirestore } from 'firebase-admin/firestore';
import { json } from 'stream/consumers';
import yauzl from 'yauzl';

type OldTimestamp = {
    type?: 'firestore/timestamp/1.0',
    seconds: number,
    nanoseconds: number,
} | {
    _seconds: number,
    _nanoseconds: number,
}
type OldTimestamp2 = OldTimestamp | {
    _methodName: 'serverTimestamp',
}

const migrateTimestamp = (t: OldTimestamp) =>
    '_seconds' in t ? t._seconds * 1E3 + t._nanoseconds * 1E-6
        : t.seconds * 1E3 + t.nanoseconds * 1E-6;

const migrateIRFromSEIR1 = (ir: IR) => ({
    ...ir,
    meta: {
        ...ir.meta,
        deletedAt: 'deletedAt' in ir.meta ? migrateTimestamp(ir.meta.deletedAt as unknown as OldTimestamp) : undefined,
        changedAt: migrateTimestamp(ir.meta.changedAt as unknown as OldTimestamp),
        createdAt: 'createdAt' in ir.meta ? '_methodName' in (ir.meta.createdAt as unknown as OldTimestamp2) ? migrateTimestamp(ir.meta.changedAt as unknown as OldTimestamp) : migrateTimestamp(ir.meta.createdAt as unknown as OldTimestamp) : migrateTimestamp(ir.meta.changedAt as unknown as OldTimestamp),
        keysChangedAt: undefined,
    },
}) as unknown as IR;
const getTimestampFromDate = (nsp: NSP) => new Date(nsp.NSP.zasah.datum).valueOf();
const migrateNSPFromSEIR1 = (nsp: NSP) => ({
    ...nsp,
    meta: {
        ...nsp.meta,
        deletedAt: 'deletedAt' in nsp.meta ? migrateTimestamp(nsp.meta.deletedAt as unknown as OldTimestamp) : undefined,
        changedAt: 'changedAt' in nsp.meta ? '_methodName' in (nsp.meta.changedAt as unknown as OldTimestamp2) ? getTimestampFromDate(nsp) : migrateTimestamp(nsp.meta.changedAt as unknown as OldTimestamp) : getTimestampFromDate(nsp),
        createdAt: '_methodName' in (nsp.meta.createdAt as unknown as OldTimestamp2) ? getTimestampFromDate(nsp) : migrateTimestamp(nsp.meta.createdAt as unknown as OldTimestamp),
    },
}) as NSP;

export const importFromSEIR1 = async () => {
    const getApp = () => initializeApp({
        credential: cert(JSON.parse(env.FIREBASE_INFO)),
        databaseURL: 'https://evidence-ir-default-rtdb.europe-west1.firebasedatabase.app'
    });
    const app = getApps()[0] ?? getApp();

    const firestore = getFirestore(app);
    const realtime = getDatabase(app);
    const fbAuth = getAuth(app);

    const irCollection = firestore.collection('ir');
    const spCollection = firestore.collection('sp');
    const dkCollection = firestore.collection('rk');
    const snCollection = firestore.collection(`signing`);
    const lpRef = realtime.ref('/loyaltyProgram');

    const originalIRs = await irCollection.get().then(s => s.docs.map(doc => doc.data() as IR));
    const originalNSPs = await spCollection.get().then(s => s.docs.map(doc => doc.data() as NSP));
    const dks = await dkCollection.get().then(s => s.docs.map(doc => ({
        _id: doc.id,
        ...(doc.data() as RecommendationData),
    })));
    const sns = await (await snCollection.listDocuments()).map(r =>
        r.collection('documents').get().then(s => s.docs.map(doc => ({
            def: {
                id: r.id as IRID | NSPID,
                pdf: doc.id.split('-')[0] as PdfToSign,
                ...(doc.id.includes('-') ? { parameter: doc.id.match(/(?<=-).*/)![0] as PdfDefiningParameter } : {}),
            } satisfies DocumentDefinition,
            ...(doc.data() as Omit<DocumentSigningInfo, 'def'>),
        }))),
    ).awaitAll().then(a => a.flat());
    const originalLPs = (await lpRef.get()).val() as Record<string, Omit<LoyaltyProgramUserData, 'email'>>;
    const lps = await originalLPs.mapTo(async (uid, lp) => {
        const user = await fbAuth.getUser(uid);
        const email = user.email!;
        return { ...lp, email };
    }).awaitAll();

    const irs = originalIRs.map(migrateIRFromSEIR1);
    const nsps = originalNSPs.map(migrateNSPFromSEIR1);

    await importBackup({ irs, nsps, dks, sns, lps });
    return [irs.length, nsps.length, dks.length, sns.length, lps.length];
};

export const importDataFromSEIR1 = async () => {
    const getApp = () => initializeApp({
        credential: cert(JSON.parse(env.FIREBASE_INFO)),
        databaseURL: 'https://evidence-ir-default-rtdb.europe-west1.firebasedatabase.app'
    });
    const app = getApps()[0] ?? getApp();

    const realtime = getDatabase(app);

    const usersRef = realtime.ref('/people');
    const companiesRef = realtime.ref('/companies');
    const techniciansRef = realtime.ref('/technicians');
    const sparePartsRef = realtime.ref('/spareParts');
    const accumulationTanksRef = realtime.ref('/accumulationTanks');
    const waterTanksRef = realtime.ref('/waterTanks');
    const solarCollectorsRef = realtime.ref('/solarCollectors');
    const invertersRef = realtime.ref('/inverters');
    const batteriesRef = realtime.ref('/batteries');

    const users = await usersRef.get().then(s => s.val()) as Record<string, Person>;
    const companies = await companiesRef.get().then(s => s.val()) as Record<string, Company>;
    const technicians = await techniciansRef.get().then(s => s.val()) as Technician[];
    const spareParts = await sparePartsRef.get().then(s => s.val()) as SparePart[];
    const arrays = {
        accumulationTanks: await accumulationTanksRef.get().then(s => s.val()) as string[],
        waterTanks: await waterTanksRef.get().then(s => s.val()) as string[],
        solarCollectors: await solarCollectorsRef.get().then(s => s.val()) as string[],
        inverters: await invertersRef.get().then(s => s.val()) as string[],
        batteries: await batteriesRef.get().then(s => s.val()) as string[],
    };

    await setPeople(users.getValues());
    await setCompanies(companies.getValues());
    await setTechnicians(technicians);
    await setSpareParts(spareParts);
    await setArrays(arrays);

    return [users.getValues().length, companies.getValues().length, technicians.length, spareParts.length,
        arrays.accumulationTanks.length, arrays.waterTanks.length, arrays.solarCollectors.length, arrays.inverters.length, arrays.batteries.length];
};

export const importFromBackup = async (file: File) => {
    const buffer = Buffer.from(await file.arrayBuffer());
    const zip = await yauzl.fromBufferPromise(buffer);
    const files = new Map<string, yauzl.Entry>();
    for await (let entry of zip.eachEntry()) {
        if (entry.fileName.endsWith('/')) continue;
        files.set(entry.fileName, entry);
    }
    const getJSON = async <T>(name: string) => !files.has(name) ? null
        : await json(await zip.openReadStreamPromise(files.get(name)!)) as Promise<T>;

    const info: { version: number } | null = await getJSON('info.json');
    const isFromSEIR1 = !info || info.version < 2;

    const originalIRs = await getJSON<IR[]>('backupIR.json');
    const originalNSPs = await getJSON<NSP[]>('backupSP.json');
    const dks = await getJSON<RecommendationDataWithCode[]>('backupDK.json');
    const sns = await getJSON<DocumentSigningInfo[]>('backupSN.json');
    const lps = await getJSON<LoyaltyProgramUserData[]>('backupLP.json');
    if (!originalIRs || !originalNSPs) {
        return [];
    }

    if (!isFromSEIR1 && dks && sns && lps) {
        await importBackup({ irs: originalIRs, nsps: originalNSPs, dks, sns, lps });
        return [originalIRs.length, originalNSPs.length, dks.length, sns.length, lps.length];
    } else {
        const irs = originalIRs.map(migrateIRFromSEIR1);
        const nsps = originalNSPs.map(migrateNSPFromSEIR1);

        await importBackup({ irs, nsps, dks: [], sns: [], lps: [] });
        return [originalIRs.length, originalNSPs.length, 0, 0, 0];
    }
};

const importBackup = async ({ irs, nsps, dks, sns, lps }: {
    irs: IR[],
    nsps: NSP[],
    dks: RecommendationDataWithCode[],
    sns: DocumentSigningInfo[],
    lps: LoyaltyProgramUserData[],
}) => {
    await setAllIRs(irs);
    await setAllNSPs(nsps);
    await setAllDKs(dks);
    await setAllSNs(sns);
    await setAllLPs(lps);
};