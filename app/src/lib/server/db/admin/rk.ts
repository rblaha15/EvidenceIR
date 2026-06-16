import { id, irCollection, rkCollection } from "$lib/server/db";
import type { IRID } from "$lib/helpers/ir";
import type { IR, RecommendationData, RecommendationState } from "$lib/data";

export const createRK = async (code: string, data: RecommendationData) =>
    rkCollection.insertOne({ ...data, _id: code });
export const getRK = async (code: string): Promise<RecommendationData | null> =>
    rkCollection.findOne({ _id: code });
export const removeRK = async (code: string) =>
    rkCollection.deleteOne({ _id: code });

export const changeState = (irid: IRID, value: RecommendationState, type: 'TČ' | 'SOL') => {
    const field = type == 'TČ' ? 'RK.DK.TC' : 'RK.DK.SOL';
    return irCollection.updateOne(id(irid), { [field + '.state']: value });
};
export const changeCode = (irid: IRID, code: string, type: 'TČ' | 'SOL') => {
    const field = type == 'TČ' ? 'RK.DK.TC' : 'RK.DK.SOL';
    return irCollection.updateOne(id(irid), { [field + '.code']: code });
};

export const setCreatedIRBy = (irid: IRID, createdBy: IR['meta']['createdBy']) =>
    irCollection.updateOne(id(irid), { 'meta.createdBy': createdBy });
export const setGrantedCommission = (irid: IRID) =>
    irCollection.updateOne(id(irid), { 'meta.flags.grantedCommission': true });