import type { LoyaltyProgramTrigger } from '$lib/client/loyaltyProgram';
import type { Company, Person, SparePart, Technician } from '$lib/client/realtime';

export type UpdateDataEndpoints = {
    users: {
        array: Person[],
    },
    companies: {
        array: Company[],
    },
    technicians: {
        array: Technician[],
    },
    spareParts: {
        array: SparePart[],
    },
    arrays: {
        arrays: {
            accumulationTanks: string[],
            waterTanks: string[],
            solarCollectors: string[],
            inverters: string[],
            batteries: string[],
        },
    },
    loyaltyPoints: {
        data: LoyaltyProgramTrigger,
    },
};

export default <T extends keyof UpdateDataEndpoints>(
    type: T,
    params: UpdateDataEndpoints[T],
) => fetch(`/api/update-data`, {
    method: 'POST',
    body: JSON.stringify({ ...params, type }),
    headers: {
        'content-type': 'application/json'
    }
});