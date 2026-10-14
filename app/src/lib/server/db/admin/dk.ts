import type { RecommendationData, RecommendationState } from '$lib/data';
import type { IRID } from '$lib/helpers/ir';
import { id, irCollection, dkCollection } from '$lib/server/db';

export const createDK = async (code: string, data: RecommendationData) =>
    dkCollection.insertOne({ ...data, _id: code });
export const getDK = async (code: string): Promise<RecommendationData | null> =>
    dkCollection.findOne({ _id: code });
export const setDKResolved = async (code: string, reason: 'requested' | 'ignored') =>
    dkCollection.updateOne({ _id: code }, { $set: { resolved: { reason } } });

export const changeRecommendationState = (irid: IRID, value: RecommendationState, type: 'TČ' | 'SOL') => {
    const field = type == 'TČ' ? 'RK.DK.TC' : 'RK.DK.SOL';
    return irCollection.updateOne(id(irid), { $set: { [field + '.state']: value } });
};
export const changeRecommendationCode = (irid: IRID, code: string, type: 'TČ' | 'SOL') => {
    const field = type == 'TČ' ? 'RK.DK.TC' : 'RK.DK.SOL';
    return irCollection.updateOne(id(irid), { $set: { [field + '.code']: code } });
};
