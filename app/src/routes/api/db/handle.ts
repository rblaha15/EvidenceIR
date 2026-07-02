import type { SparePart } from '$lib/client/db/arrays';
import type { DatabaseEndpoints } from '$lib/client/db/endpoints';
import { getIsAdmin, getIsLoggedIn, getIsRegulusOrAdmin } from '$lib/server/auth';
import { removeUsers, updateUserNames } from '$lib/server/db/admin/auth';
import { getAllIRs, getAllNSPs, restoreIR } from '$lib/server/db/admin/general';
import { getTokenData } from '$lib/server/db/admin/tokens';
import {
    getArrays,
    getCompanies,
    getCompaniesByCRNs,
    getLoyaltyProgramData,
    getPeople,
    getPersonByEmail,
    getSpareParts,
    getTechnicians,
    setArrays,
    setCompanies,
    setPeople,
    setSpareParts,
    setTechnicians
} from '$lib/server/db/arrays';
import { processLoyaltyReward } from '$lib/server/loyaltyProgram';
import { error } from '@sveltejs/kit';

type Args = {
    [Type in keyof DatabaseEndpoints]: { action: Type } &
    (DatabaseEndpoints[Type] extends { params: Record<string, unknown> } ? DatabaseEndpoints[Type]['params'] : {})
}[keyof DatabaseEndpoints]

type Result = {
    [Type in keyof DatabaseEndpoints]:
    DatabaseEndpoints[Type] extends { returns: unknown } ? DatabaseEndpoints[Type]['returns'] : void
}[keyof DatabaseEndpoints]

export default async (
    args: Args,
    locals: App.Locals,
): Promise<Result> => {
    if (!args.action.startsWith('open/') && !getIsLoggedIn(locals)) return error(401);
    if (args.action.startsWith('admin/') && !getIsAdmin(locals)) return error(401);
    if (args.action.startsWith('regulus/') && !getIsRegulusOrAdmin(locals)) return error(401);

    if (args.action === 'admin/backup' as const) {
        return {
            irs: await getAllIRs(),
            nsps: await getAllNSPs(),
        };
    } else if (args.action == 'admin/restore') {
        await restoreIR(args.irid);
    } else if (args.action == 'getArrays') {
        return await getArrays();
    } else if (args.action == 'getSpareParts') {
        return (await getSpareParts()).map(it => ({
            ...it,
            name: it.name.replace('  ', ' '),
        }) satisfies SparePart);
    } else if (args.action == 'getTechnicians') {
        return await getTechnicians();
    } else if (args.action == 'regulus/getUsers') {
        return await getPeople();
    } else if (args.action == 'getMyInfo') {
        return await getPersonByEmail(locals.user!.email).then(p => p!);
    } else if (args.action == 'getCompanies') {
        if (getIsRegulusOrAdmin(locals)) {
            const all = await getCompanies();
            return { assemblyCompanies: all, commissioningCompanies: all };
        }
        const person = (await getPersonByEmail(locals.user!.email))!;
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
    } else if (args.action == 'admin/getCompanies') {
        return await getCompanies();
    } else if (args.action == 'loyaltyPoints') {
        await processLoyaltyReward(args.data, locals);
    } else if (args.action == 'getLoyaltyPoints') {
        return await getLoyaltyProgramData(locals.user!.id);
    } else if (args.action == 'admin/setUsers') {
        const people = args.array;

        await setPeople(people);

        await removeUsers(people.map(p => p.email));
        await updateUserNames(people);
    } else if (args.action == 'admin/setCompanies') {
        await setCompanies(args.array);
    } else if (args.action == 'admin/setTechnicians') {
        await setTechnicians(args.array);
    } else if (args.action == 'admin/setSpareParts') {
        await setSpareParts(args.array);
    } else if (args.action == 'admin/setArrays') {
        const { action, ...arrays } = args;
        await setArrays(arrays);
    } else if (args.action == 'open/getTokenData') {
        const { token } = args;
        return await getTokenData(token);
    } else {
        console.log('Invalid action', args);
    }

    return {} as Result;
}