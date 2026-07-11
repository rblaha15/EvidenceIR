import type { Arrays, Company, Person, SparePart, Technician } from '$lib/client/db/arrays';
import type { LoyaltyProgramPointsTransaction, LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import type { IR, NSP, RecommendationDataWithCode } from '$lib/data';
import type { IRID } from '$lib/helpers/ir';
import { checkUserByEmail, removeUsers, updateUserNames } from '$lib/server/db/admin/auth';
import {
    deletePermanentlyIR,
    getAllIRs,
    getAllNSPs, getAllRKs, getAllSNs,
    putAllIRs,
    putAllNSPs, putAllRKs, putAllSNs,
    restoreIR
} from '$lib/server/db/admin/general';
import {
    getAllLoyaltyProgramData,
    getCompanies,
    setArrays,
    setCompanies,
    setPeople,
    setSpareParts,
    setTechnicians
} from '$lib/server/db/arrays';
import { defineEndpoint } from '$lib/server/defineEndpoints';
import { addPointsTransaction } from '$lib/server/loyaltyProgram';
import type { DocumentSigningInfo } from '$lib/server/signing';
import { error } from '@sveltejs/kit';

export const adminEndpoints = {
    backup: defineEndpoint<undefined, {
        irs: IR[], nsps: NSP[], rks: RecommendationDataWithCode[], sns: DocumentSigningInfo[],
    }>(async () => ({
        irs: await getAllIRs(),
        nsps: await getAllNSPs(),
        rks: await getAllRKs(),
        sns: await getAllSNs(),
    })),
    import: defineEndpoint<{
        irs: IR[], nsps: NSP[], rks: RecommendationDataWithCode[], sns: DocumentSigningInfo[],
    }, undefined>(async ({ irs, nsps, rks, sns }) => {
        await putAllIRs(irs);
        await putAllNSPs(nsps);
        await putAllRKs(rks);
        await putAllSNs(sns);
    }),
    restore: defineEndpoint<{ irid: IRID }, undefined>(async ({ irid }) => {
        await restoreIR(irid);
    }),
    deletePermanentlyIR: defineEndpoint<{ irid: IRID }, undefined>(async ({ irid }) => {
        await deletePermanentlyIR(irid);
    }),
    getCompanies: defineEndpoint<undefined, Company[]>(async () => {
        return await getCompanies();
    }),
    setUsers: defineEndpoint<{ array: Person[] }, undefined>(async ({ array: people }) => {
        await setPeople(people);

        await removeUsers(people.map(p => p.email));
        await updateUserNames(people);
    }),
    setCompanies: defineEndpoint<{ array: Company[] }, undefined>(async ({ array }) => {
        await setCompanies(array);
    }),
    setTechnicians: defineEndpoint<{ array: Technician[] }, undefined>(async ({ array }) => {
        await setTechnicians(array);
    }),
    setSpareParts: defineEndpoint<{ array: SparePart[] }, undefined>(async ({ array }) => {
        await setSpareParts(array);
    }),
    setArrays: defineEndpoint<Record<Arrays, string[]> , undefined>(async (arrays) => {
        await setArrays(arrays);
    }),
    getAllLoyaltyProgramData: defineEndpoint<undefined, Record<string, LoyaltyProgramUserData>>(async () => {
        return await getAllLoyaltyProgramData();
    }),
    addLoyaltyProgramTransaction: defineEndpoint<{ userEmail: string, transaction: LoyaltyProgramPointsTransaction }, undefined>(async ({ userEmail, transaction }) => {
        const exists = await checkUserByEmail(userEmail);
        if (!exists) error(400);
        await addPointsTransaction(transaction, userEmail);
    }),
}