import type { Arrays, Company, FriendlyCompanies, Person, SparePart, Technician } from '$lib/client/db/arrays';
import type { LoyaltyProgramTrigger, LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import type { IR, NSP } from '$lib/data';
import type { IRID } from '$lib/helpers/ir';

export type DatabaseEndpoints = {
    'admin/backup': {
        returns: { irs: IR[], nsps: NSP[] },
    },
    'admin/restore': {
        params: { irid: IRID },
    },
    getArrays: {
        returns: Record<Arrays, string[]>,
    },
    getSpareParts: {
        returns: SparePart[],
    },
    getTechnicians: {
        returns: Technician[],
    },
    'regulus/getUsers': {
        returns: Person[],
    },
    'getMyInfo': {
        returns: Person,
    },
    'getCompanies': {
        returns: FriendlyCompanies,
    },
    'admin/getCompanies': {
        returns: Company[],
    },
    'admin/setUsers': {
        params: {
            array: Omit<Person, 'id'>[],
        },
    },
    'admin/setCompanies': {
        params: {
            array: Company[],
        },
    },
    'admin/setTechnicians': {
        params: {
            array: Technician[],
        },
    },
    'admin/setSpareParts': {
        params: {
            array: SparePart[],
        },
    },
    'admin/setArrays': {
        params: Record<Arrays, string[]>,
    },
    loyaltyPoints: {
        params: {
            data: LoyaltyProgramTrigger,
        },
    },
    getLoyaltyPoints: {
        returns: LoyaltyProgramUserData,
    },
};

export const fetchDB = async <T extends keyof DatabaseEndpoints>(
    type: T,
    ...other: DatabaseEndpoints[T] extends { params: Record<string, unknown> } ? [
        args: DatabaseEndpoints[T]['params'],
        fetch?: typeof window.fetch,
    ] : [
        fetch?: typeof window.fetch,
    ]
): Promise<
    DatabaseEndpoints[T] extends { returns: unknown } ? DatabaseEndpoints[T]['returns'] : undefined
> => {
    const [arg1, arg2] = other;
    const fetch = typeof arg1 == 'function' ? arg1 : arg2 ?? window.fetch;
    const args = typeof arg1 == 'function' ? undefined : JSON.stringify(arg1);
    return await fetch(`/api/db?other=${type}`, {
        method: 'POST',
        body: args,
        headers: {
            'content-type': 'application/json'
        }
    }).then(r => r.json());
};