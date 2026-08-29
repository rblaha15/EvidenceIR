import type { IR, NSP, RecommendationDataWithCode } from '$lib/data';
import type { IRID } from '$lib/helpers/ir';
import { id, irCollection, nspCollection, dkCollection, signingCollection } from '$lib/server/db';
import type { DocumentSigningInfo } from '$lib/server/signing';

export const getAllIRs = () => irCollection.find().project<IR>({ _id: 0 }).toArray();
export const getAllNSPs = () => nspCollection.find().project<NSP>({ _id: 0 }).toArray();
export const getAllRKs = () => dkCollection.find().project<RecommendationDataWithCode>({}).toArray();
export const getAllSNs = () => signingCollection.find().project<DocumentSigningInfo>({ _id: 0 }).toArray();
export const setAllIRs = async (irs: IR[]) => {
    await irCollection.deleteMany();
    await putAllIRs(irs);
};
export const setAllNSPs = async (nsps: NSP[]) => {
    await nspCollection.deleteMany();
    await putAllNSPs(nsps);
};
export const setAllRKs = async (rks: RecommendationDataWithCode[]) => {
    await dkCollection.deleteMany();
    await putAllRKs(rks);
};
export const setAllSNs = async (sns: DocumentSigningInfo[]) => {
    await signingCollection.deleteMany();
    await putAllSNs(sns);
};
export const putAllIRs = async (irs: IR[]) => {
    if (irs.length) await irCollection.insertMany(irs);
};
export const putAllNSPs = async (nsps: NSP[]) => {
    if (nsps.length) await nspCollection.insertMany(nsps);
};
export const putAllRKs = async (rks: RecommendationDataWithCode[]) => {
    if (rks.length) await dkCollection.insertMany(rks);
};
export const putAllSNs = async (sns: DocumentSigningInfo[]) => {
    if (sns.length) await signingCollection.insertMany(sns);
};

export const restoreIR = (irid: IRID) => irCollection.updateOne(id(irid), {
    $set: {
        deleted: false,
        'meta.deletedAt': undefined,
        'meta.movedTo': undefined,
        'meta.changedAt': new Date(),
    },
});
export const deletePermanentlyIR = (irid: IRID) => irCollection.deleteOne(id(irid));

export const setCreatedIRBy = (irid: IRID, createdBy: IR['meta']['createdBy']) =>
    irCollection.updateOne(id(irid), { 'meta.createdBy': createdBy });

export const setGrantedCommission = (irid: IRID) =>
    irCollection.updateOne(id(irid), { 'meta.flags.grantedCommission': true });