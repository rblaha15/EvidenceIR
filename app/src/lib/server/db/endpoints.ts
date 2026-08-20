import type { Arrays, FriendlyCompanies, Person, SparePart, Technician } from '$lib/client/db/arrays';
import type { LoyaltyProgramTrigger, LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import type { RecommendationData } from '$lib/data';
import { adminEndpoints } from '$lib/server/db/admin/endpoints';
import {
    getArrays,
    getCompanies,
    getCompaniesByCRNs,
    getLoyaltyProgramData,
    getPeople,
    getPersonByEmail,
    getSpareParts,
    getTechnicians
} from '$lib/server/db/arrays';
import { checkForRecommendations, getRecommendationData, sendRequest } from '$lib/server/db/recommend-rk';
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
        const allCompanies = await getCompaniesByCRNs([
            ...person.assemblyCompanies,
            ...person.commissioningCompanies,
        ]).then(array =>
            array.associateBy(company => company.crn)
        );
        return {
            assemblyCompanies: person.assemblyCompanies.map(crn => allCompanies[crn]).sortedBy(c => c.companyName),
            commissioningCompanies: person.commissioningCompanies.map(crn => allCompanies[crn]).sortedBy(c => c.companyName),
        };
    }),
    addLoyaltyPoints: defineEndpoint<{ data: LoyaltyProgramTrigger }, undefined>(async ({ data }, { locals }) => {
        await processLoyaltyReward(data, locals);
    }),
    getLoyaltyPoints: defineEndpoint<undefined, LoyaltyProgramUserData>(async (_, { userEmail }) => {
        return await getLoyaltyProgramData(userEmail);
    }),
    'open/checkForRecommendations': defineEndpoint(async (_, { headers }) => {
        await checkForRecommendations(headers);
    }),
    'open/getRecommendationData': defineEndpoint<{ code: string }, RecommendationData>(async ({ code }) => {
        return await getRecommendationData(code);
    }),
    'open/sendRequest': defineEndpoint<{ code: string }, undefined>(async ({ code }) => {
        await sendRequest(code);
    }),
};