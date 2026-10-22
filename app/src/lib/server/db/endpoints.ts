import type { Arrays, FriendlyCompanies, HetaPumpDetails, Person, SparePart, Technician } from '$lib/client/db/arrays';
import type { LoyaltyProgramTrigger, LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import type { RecommendationData } from '$lib/data';
import { regulusCRN } from '$lib/helpers/ares';
import { adminEndpoints } from '$lib/server/db/admin/endpoints';
import {
    getArrays,
    getCompanies,
    getCompaniesByCRNs, getHeatPumps,
    getPeople,
    getPersonByEmail,
    getSpareParts,
    getTechnicians
} from '$lib/server/db/arrays';
import { getLoyaltyProgramData } from '$lib/server/db/loyaltyProgram';
import { mongoReadDatabase } from '$lib/server/db/read';
import { getRecommendationData, sendRequest } from '$lib/server/db/recommend-rk';
import { defineEndpoint, prefixEndpoints } from '$lib/server/defineEndpoints';
import { processLoyaltyReward } from '$lib/server/loyaltyProgram';

export const dbEndpoints = {
    ...prefixEndpoints(adminEndpoints, 'admin'),
    getArrays: defineEndpoint<undefined, Record<Arrays, string[]>>(async () => {
        return await getArrays();
    }),
    getSpareParts: defineEndpoint<undefined, SparePart[]>(async () => {
        return (await getSpareParts()).map(it => ({ ...it, name: it.name.replace('  ', ' ') }) satisfies SparePart);
    }),
    getHeatPumps: defineEndpoint<undefined, HetaPumpDetails[]>(async () => {
        return await getHeatPumps();
    }),
    getTechnicians: defineEndpoint<undefined, Technician[]>(async () => {
        return await getTechnicians();
    }),
    'regulus/getPeople': defineEndpoint<undefined, Person[]>(async () => {
        return await getPeople();
    }),
    getMyInfo: defineEndpoint<undefined, Person>(async (_, { userEmail }) => {
        return await getPersonByEmail(userEmail).then(p => p!);
    }),
    getCompanies: defineEndpoint<undefined, FriendlyCompanies>(async (_, { userEmail, isRegulusOrAdmin }) => {
        if (isRegulusOrAdmin) {
            const all = await getCompanies();
            return { assemblyCompanies: all, commissioningCompanies: all };
        }
        const person = (await getPersonByEmail(userEmail))!;
        const assemblyCRNs = [...person.assemblyCompanies, regulusCRN.toString()].distinct();
        const commissioningCRNs = person.commissioningCompanies;
        const allCompanies = await getCompaniesByCRNs([
            ...assemblyCRNs,
            ...commissioningCRNs,
        ].distinct()).then(array =>
            array.associateBy(company => company.crn)
        );
        return {
            assemblyCompanies: assemblyCRNs.map(crn => allCompanies[crn]).sortedBy(c => c.companyName),
            commissioningCompanies: commissioningCRNs.map(crn => allCompanies[crn]).sortedBy(c => c.companyName),
        };
    }),
    addLoyaltyPoints: defineEndpoint<{ data: LoyaltyProgramTrigger }, undefined>(async ({ data }, { locals }) => {
        const extendedData = 'irid' in data ? { ...data, ir: await mongoReadDatabase.getIR(data.irid, locals) } : data;
        await processLoyaltyReward(extendedData, locals);
    }),
    getLoyaltyPoints: defineEndpoint<undefined, LoyaltyProgramUserData>(async (_, { userEmail }) => {
        return await getLoyaltyProgramData(userEmail);
    }),
    'open/getRecommendationData': defineEndpoint<{ code: string }, RecommendationData>(async ({ code }) => {
        return await getRecommendationData(code);
    }),
    'open/sendRequest': defineEndpoint<{ code: string }, undefined>(async ({ code }) => {
        await sendRequest(code);
    }),
};