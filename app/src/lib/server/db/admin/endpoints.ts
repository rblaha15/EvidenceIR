import { env } from '$env/dynamic/private';
import { env as publicENV } from '$env/dynamic/public';
import type { Arrays, Company, Person, SparePart, Technician } from '$lib/client/db/arrays';
import type {
    LoyaltyProgramPointsTransaction,
    LoyaltyProgramUserData,
    LoyaltyProgramUserDataWithPerson
} from '$lib/client/loyaltyProgram';
import type { IR, NSP, RecommendationDataWithCode } from '$lib/data';
import type { IRID } from '$lib/helpers/ir';
import { checkUserByEmail, removeUsers, updateUserNames } from '$lib/server/db/admin/auth';
import {
    deletePermanentlyIR,
    getAllDKs,
    getAllIRs,
    getAllLPs,
    getAllNSPs,
    getAllSNs,
    restoreIR,
} from '$lib/server/db/admin/general';
import { importDataFromSEIR1, importFromBackup, importFromSEIR1 } from '$lib/server/db/admin/import';
import {
    getCompanies,
    getPeople,
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
        irs: IR[], nsps: NSP[], dks: RecommendationDataWithCode[], sns: DocumentSigningInfo[], lps: LoyaltyProgramUserData[],
    }>(async () => ({
        irs: await getAllIRs(), nsps: await getAllNSPs(), dks: await getAllDKs(), sns: await getAllSNs(), lps: await getAllLPs(),
    })),
    importBackup: defineEndpoint<File, number[]>(importFromBackup, { isFileUpload: true }),
    importFromSEIR1: defineEndpoint<undefined, number[]>(() => importFromSEIR1()),
    importDataFromSEIR1: defineEndpoint<undefined, number[]>(() => importDataFromSEIR1()),
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
    setArrays: defineEndpoint<Record<Arrays, string[]>, undefined>(async (arrays) => {
        await setArrays(arrays);
    }),
    getAllLoyaltyProgramData: defineEndpoint<undefined, Record<string, LoyaltyProgramUserDataWithPerson>>(async () => {
        const all = await getAllLPs();
        const users = await getPeople().then(p => p.associateBy(p => p.email));
        return all.associate(lp => [lp.email, {
            ...lp,
            responsiblePerson: users[lp.email]?.responsiblePerson,
        }]);
    }),
    addLoyaltyProgramTransaction: defineEndpoint<{ userEmail: string, transaction: LoyaltyProgramPointsTransaction }, undefined>(async ({ userEmail, transaction }) => {
        const exists = await checkUserByEmail(userEmail);
        if (!exists) error(400);
        await addPointsTransaction(transaction, userEmail);
    }),
    getDatabaseLink: defineEndpoint<undefined, string>(async () => {
        const [protocol, host] = (env.MONGO_EXPRESS_URI || publicENV.PUBLIC_APP_URL).split('://');
        return `${protocol}://${env.MONGO_EXPRESS_USERNAME}:${env.MONGO_EXPRESS_PASSWORD}@${host}/db/`;
    }),
};