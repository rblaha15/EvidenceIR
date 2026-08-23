import type { IR, NSP, RecommendationDataWithCode } from '$lib/data';
import { setAllIRs, setAllNSPs, setAllRKs, setAllSNs } from '$lib/server/db/admin/general';
import type { DocumentSigningInfo } from '$lib/server/signing';
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
    return true;
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

    const info: { SEIRVersion: number } | null = await getJSON('info.json');
    const isFromSEIR1 = !info || info.SEIRVersion == 1;

    const originalIRs = await getJSON<IR[]>('backupIR.json');
    const originalNSPs = await getJSON<NSP[]>('backupSP.json');
    const rks = await getJSON<RecommendationDataWithCode[]>('backupRK.json');
    const sns = await getJSON<DocumentSigningInfo[]>('backupSN.json');
    if (!originalIRs || !originalNSPs) {
        return false;
    }

    if (!isFromSEIR1) {
        await importBackup({ irs: originalIRs, nsps: originalNSPs, rks: rks!, sns: sns! });
        return true;
    } else {
        const irs = originalIRs.map(migrateIRFromSEIR1);
        const nsps = originalNSPs.map(migrateNSPFromSEIR1);

        await importBackup({ irs, nsps, rks: [], sns: [] });
        return true;
    }
};

const importBackup = async ({ irs, nsps, rks, sns }: {
    irs: IR[], nsps: NSP[], rks: RecommendationDataWithCode[], sns: DocumentSigningInfo[],
}) => {
    await setAllIRs(irs);
    await setAllNSPs(nsps);
    await setAllRKs(rks);
    await setAllSNs(sns);
}