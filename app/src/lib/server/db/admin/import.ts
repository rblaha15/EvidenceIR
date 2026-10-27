import { type AllArrays } from '$lib/client/db/arrays';
import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import type { IR, NSP, RecommendationDataWithCode } from '$lib/data';
import { setAllDKs, setAllIRs, setAllLPs, setAllNSPs, setAllSNs } from '$lib/server/db/admin/general';
import { setArrays, setCompanies, setHeatPumps, setPeople, setSpareParts, setTechnicians } from '$lib/server/db/arrays';
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
    const allArrays = await getJSON<AllArrays>('backupArrays.json');
    if (!originalIRs || !originalNSPs) {
        return [];
    }

    const arrays = ['person', 'company', 'technician', 'sparePart', 'heatPump'] as const;
    const stringArrays = ['accumulationTanks', 'waterTanks', 'solarCollectors', 'inverters', 'batteries', 'fvePanels'] as const;
    if (!isFromSEIR1 && dks && sns && lps) {
        await importBackup({ irs: originalIRs, nsps: originalNSPs, dks, sns, lps, ...allArrays });
        return [
            originalIRs, originalNSPs, dks, sns, lps,
            ...arrays.map(a => allArrays?.[a] ?? []),
            ...stringArrays.map(a => allArrays?.arrays?.[a] ?? []),
        ].map(a => a.length);
    } else {
        const irs = originalIRs.map(migrateIRFromSEIR1);
        const nsps = originalNSPs.map(migrateNSPFromSEIR1);

        await importBackup({ irs, nsps, dks: [], sns: [], lps: [] });
        return [
            originalIRs.length, originalNSPs.length, 0, 0, 0,
            ...arrays.map(_ => 0),
            ...stringArrays.map(_ => 0),
        ];
    }
};

const importBackup = async (
    {
        irs, nsps, dks, sns, lps,
        person, company, technician, sparePart, heatPump, arrays,
    }: {
        irs: IR[],
        nsps: NSP[],
        dks: RecommendationDataWithCode[],
        sns: DocumentSigningInfo[],
        lps: LoyaltyProgramUserData[],
    } & Partial<AllArrays>,
) => {
    await setAllIRs(irs);
    await setAllNSPs(nsps);
    await setAllDKs(dks);
    await setAllSNs(sns);
    await setAllLPs(lps);
    if (person) await setPeople(person);
    if (company) await setCompanies(company);
    if (technician) await setTechnicians(technician);
    if (sparePart) await setSpareParts(sparePart);
    if (heatPump) await setHeatPumps(heatPump);
    if (arrays) await setArrays(arrays);
};