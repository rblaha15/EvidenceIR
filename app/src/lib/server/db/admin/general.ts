import type { IR, NSP, RecommendationDataWithCode } from '$lib/data';
import type { IRID } from '$lib/helpers/ir';
import { id, irCollection, nspCollection, rkCollection, signingCollection } from '$lib/server/db';
import type { DocumentSigningInfo } from '$lib/server/signing';

export const getAllIRs = () => irCollection.find().project<IR>({ _id: 0 }).toArray();
export const getAllNSPs = () => nspCollection.find().project<NSP>({ _id: 0 }).toArray();
export const getAllRKs = () => rkCollection.find().project<RecommendationDataWithCode>({}).toArray();
export const getAllSNs = () => signingCollection.find().project<DocumentSigningInfo>({ _id: 0 }).toArray();
export const putAllIRs = async (irs: IR[]) => {
    await irCollection.deleteMany();
    await irCollection.insertMany(irs);
};
export const putAllNSPs = async (nsps: NSP[]) => {
    await nspCollection.deleteMany();
    await nspCollection.insertMany(nsps);
};
export const putAllRKs = async (rks: RecommendationDataWithCode[]) => {
    await rkCollection.deleteMany();
    await rkCollection.insertMany(rks);
};
export const putAllSNs = async (sns: DocumentSigningInfo[]) => {
    await signingCollection.deleteMany();
    await signingCollection.insertMany(sns);
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