import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import type { IR, NSP, RecommendationDataWithCode } from '$lib/data';
import type { IRID } from '$lib/helpers/ir';
import {
    dkCollection,
    id,
    irCollection,
    loyaltyProgramCollection,
    nspCollection,
    signingCollection
} from '$lib/server/db';
import type { DocumentSigningInfo } from '$lib/server/signing';

export const getAllIRs = () => irCollection.find().project<IR>({ _id: 0 }).toArray();
export const getAllNSPs = () => nspCollection.find().project<NSP>({ _id: 0 }).toArray();
export const getAllDKs = () => dkCollection.find().project<RecommendationDataWithCode>({}).toArray();
export const getAllSNs = () => signingCollection.find().project<DocumentSigningInfo>({ _id: 0 }).toArray();
export const getAllLPs = () => loyaltyProgramCollection.find().project<LoyaltyProgramUserData>({ _id: 0 }).toArray();
export const setAllIRs = async (irs: IR[]) => {
    await irCollection.deleteMany();
    if (irs.length) await irCollection.insertMany(irs);
};
export const setAllNSPs = async (nsps: NSP[]) => {
    await nspCollection.deleteMany();
    if (nsps.length) await nspCollection.insertMany(nsps);
};
export const setAllDKs = async (dks: RecommendationDataWithCode[]) => {
    await dkCollection.deleteMany();
    if (dks.length) await dkCollection.insertMany(dks);
};
export const setAllSNs = async (sns: DocumentSigningInfo[]) => {
    await signingCollection.deleteMany();
    if (sns.length) await signingCollection.insertMany(sns);
};
export const setAllLPs = async (lps: LoyaltyProgramUserData[]) => {
    await loyaltyProgramCollection.deleteMany();
    if (lps.length) await loyaltyProgramCollection.insertMany(lps);
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