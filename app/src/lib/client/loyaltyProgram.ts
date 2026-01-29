import type { IRID } from '$lib/helpers/ir';
import { getToken } from '$lib/client/auth';
import type { TC } from '$lib/forms/IN/defaultIN';
import { addLoyaltyProgramTriggerToOfflineQueue } from '$lib/client/offlineQueue.svelte';
import { getIsOnline } from '$lib/client/realtimeOnline';

export type Points = number;

export const loyaltyPointRewards = {
    /** Granted to every user upon registration */
    registration: 1000,
    /** Granted on non-draft installation save with rroute turned on (revoked if turned off when already granted) to the user* who created the installation. */
    // * - if unknown, given to the currently logged-in user
    connectRegulusRoute: 100,
    /** Granted to the assembly company on UPT creation if less than 180 days from the commission */
    heatPumpAssembly: 600,
    /** Granted to the assembly company on UPT creation if less than 180 days from the commission */
    heatPumpInCascadeAssembly: 300,
    /** Granted to the commissioning company on UPT creation if less than 180 days from the commission */
    heatPumpCommission: 300,
    /** Granted to the commissioning company on UPT creation if less than 180 days from the commission */
    heatPumpInCascadeCommission: 150,
    /** Granted to the logged-in user on pump check creation */
    heatPumpYearlyCheck: 300,
} satisfies Record<string, Points>

export type LoyaltyPointRewardType = keyof typeof loyaltyPointRewards;

export type LoyaltyPointTriggerData = {
    /** Granted to every user upon registration */
    registration: {  };
    /** Granted on non-draft installation save with rroute turned on to the user* who created the installation. */
    // * - if unknown, given to the currently logged-in user
    connectRegulusRoute: { irid: IRID };
    /** Revoked on non-draft installation save with rroute turned off (and if already granted) from the user* who created the installation. */
    // * - if unknown, presumed not to have been granted
    disconnectRegulusRoute: { irid: IRID };
    /** Granted to the assembly and commissioning company on UPT creation if less than 180 days from the commission */
    heatPumpCommission: { irid: IRID };
    /** Granted to the logged-in user on pump check creation */
    heatPumpYearlyCheck: { pump: TC, year: number, irid: IRID };
}

export type LoyaltyPointTriggerType = keyof LoyaltyPointTriggerData;

export type LoyaltyProgramTrigger<T extends LoyaltyPointTriggerType = LoyaltyPointTriggerType> = {
    type: T;
} & LoyaltyPointTriggerData[T];

export const grantPoints = async <T extends LoyaltyPointTriggerType>(data: LoyaltyProgramTrigger<T>) =>
    getIsOnline() ? grantPointsOnline(data) : addLoyaltyProgramTriggerToOfflineQueue(data);

export const grantPointsOnline = async <T extends LoyaltyPointTriggerType>(data: LoyaltyProgramTrigger<T>) =>
    await fetch(`/api/update-data?type=loyaltyPoints&token=${await getToken()}`, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'content-type': 'application/json',
        },
    })

export type StandardLoyaltyProgramPointsTransaction = {
    addition: Points;
    type: LoyaltyPointRewardType;
    note?: string | undefined;
    irid?: IRID;
    timestamp: string;
};
export type OtherLoyaltyProgramPointsTransaction = {
    addition: Points;
    type: 'other';
    note: string;
    irid?: undefined;
    timestamp: string;
};
export type LoyaltyProgramPointsTransaction = StandardLoyaltyProgramPointsTransaction | OtherLoyaltyProgramPointsTransaction;

export type LoyaltyProgramUserData = {
    points: Points;
    history: (LoyaltyProgramPointsTransaction)[];
};

export const adminDescriptions: Record<LoyaltyPointRewardType, string> = {
    registration: 'Registrace',
    connectRegulusRoute: 'Připojen RegulusRoute',
    heatPumpAssembly: 'Montáž TČ',
    heatPumpInCascadeAssembly: 'Montáž TČ v kaskádě',
    heatPumpCommission: 'Uvedení TČ do provozu',
    heatPumpInCascadeCommission: 'Uvedení TČ v kaskádě do provozu',
    heatPumpYearlyCheck: 'Roční kontrola TČ',
}