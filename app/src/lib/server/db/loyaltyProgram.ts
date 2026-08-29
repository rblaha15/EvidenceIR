import type { LoyaltyProgramUserData } from '$lib/client/loyaltyProgram';
import { loyaltyProgramCollection } from '$lib/server/db/index';

export const getLoyaltyProgramData = (email: string) => loyaltyProgramCollection
    .findOne<LoyaltyProgramUserData>({ email }, { projection: { _id: 0 } })
    .then(doc => doc ?? { email, points: 0, history: [] });

export const setLoyaltyProgramData = (data: LoyaltyProgramUserData) =>
    loyaltyProgramCollection.updateOne(
        { email: data.email },
        { $set: data },
        { upsert: true },
    );