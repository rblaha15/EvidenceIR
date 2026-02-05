import { getLoyaltyProgramData, people, setLoyaltyProgramData } from '$lib/server/realtime';
import type { IRID } from '$lib/helpers/ir';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getIR, setCreatedIRBy, setGrantedCommission } from '$lib/server/firestore';
import {
    loyaltyPointRewards,
    type LoyaltyPointTriggerType,
    type LoyaltyProgramPointsTransaction,
    type LoyaltyProgramTrigger,
    type OtherLoyaltyProgramPointsTransaction,
    type StandardLoyaltyProgramPointsTransaction,
} from '$lib/client/loyaltyProgram';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { nowISO } from '$lib/helpers/date';
import { checkAnyRegulusOrAdmin } from '$lib/server/auth';


const isType = <T extends LoyaltyPointTriggerType>(
    data: LoyaltyProgramTrigger, type: T,
): data is LoyaltyProgramTrigger<T> => data.type == type;

const days = (days: number) => days * 24 /*hours*/ * 60 /*minutes*/ * 60 /*seconds*/ * 1E3 /*milliseconds*/;

export const processLoyaltyReward = async (
    data: LoyaltyProgramTrigger,
    user: DecodedIdToken,
) => {
    if (checkAnyRegulusOrAdmin(user)) return;
    const timestamp = nowISO(true);
    if (isType(data, 'registration')) {
        const current = await getLoyaltyProgramData(user.uid);
        if (current.history.some(t => t.type == 'registration')) return;
        await addPointsTransaction({ ...data, timestamp }, user.uid);
    } else if (isType(data, 'connectRegulusRoute')) {
        const creatingUser = await getOrSetCreatingUser(data.irid, user);
        if (creatingUser == 'unknown') return;
        const current = await getLoyaltyProgramData(creatingUser);
        if (current.history.some(t => t.type == 'connectRegulusRoute' && t.irid == data.irid)) return;
        await addPointsTransaction({ ...data, timestamp }, creatingUser);
    } else if (isType(data, 'disconnectRegulusRoute')) {
        const creatingUser = await getCreatingUserOrNull(data.irid);
        if (!creatingUser || creatingUser == 'unknown') return;
        const current = await getLoyaltyProgramData(creatingUser);
        if (current.history.some(t => t.type == 'connectRegulusRoute' && t.irid == data.irid && t.addition < 0)) return;
        if (!current.history.some(t => t.type == 'connectRegulusRoute' && t.irid == data.irid)) return;
        await addPointsTransaction({
            type: 'connectRegulusRoute', irid: data.irid, multiplier: -1, note: 'Odebrání RegulusRoute z instalace', timestamp,
        }, creatingUser);
    } else if (isType(data, 'heatPumpCommission')) {
        const d = await getCompaniesCascadeGrantedAndCommission(data.irid);
        if (!d) return;
        const { assembly, commissioning, pumpCount, granted, commissionDate } = d;
        if (granted) return;
        const now = new Date();
        if (commissionDate.valueOf() + days(180) < now.valueOf()) return;
        if (assembly) {
            const current = await getLoyaltyProgramData(assembly);
            if (current.history.some(t => t.type == 'heatPumpAssembly' && t.irid == data.irid)) return;
            await addPointsTransaction({ type: 'heatPumpAssembly', irid: data.irid, timestamp }, assembly);
            if (pumpCount > 1) await addPointsTransaction({
                type: 'heatPumpInCascadeAssembly', irid: data.irid, timestamp, note: `Kaskáda ${pumpCount} TČ`,
                multiplier: (pumpCount - 1),
            }, assembly);
        }
        if (commissioning) {
            const current = await getLoyaltyProgramData(commissioning);
            if (current.history.some(t => t.type == 'heatPumpCommission' && t.irid == data.irid)) return;
            await addPointsTransaction({ type: 'heatPumpCommission', irid: data.irid, timestamp }, commissioning);
            if (pumpCount > 1) await addPointsTransaction({
                type: 'heatPumpInCascadeCommission', irid: data.irid, timestamp, note: `Kaskáda ${pumpCount} TČ`,
                multiplier: (pumpCount - 1),
            }, commissioning);
        }
        await setGrantedCommission(data.irid)
    } else if (isType(data, 'heatPumpYearlyCheck')) {
        const ir = await getIR(data.irid);
        if (!ir?.RK?.TC?.[data.pump]?.[data.year]) return;
        await addPointsTransaction({
            type: data.type, irid: data.irid, note: `TČ: ${data!.pump}, rok: ${data!.year}`, timestamp,
        }, user.uid);
    }
};

const getCompanyUser = async (email: string) =>
    (await people()).entries().find(([_, p]) => p.email == email)?.[0] || null;

const getCompaniesCascadeGrantedAndCommission = async (irid: IRID) => {
    const ir = await getIR(irid);
    return ir && ir.UP.dateTC && ir.UP.TC ? {
        assembly: await getCompanyUser(ir.IN.montazka.email),
        commissioning: await getCompanyUser(ir.IN.uvedeni.email),
        pumpCount: cascadePumps(ir.IN).length,
        granted: ir.meta.loyaltyProgram?.grantedCommission ?? false,
        commissionDate: new Date(ir.UP.dateTC),
    } : null;
};

const getCreatingUserOrNull = async (irid: IRID) => {
    const ir = await getIR(irid);
    return ir ? ir.meta.createdBy?.uid : 'unknown';
};

const getOrSetCreatingUser = async (irid: IRID, user: DecodedIdToken) => {
    const current = await getCreatingUserOrNull(irid);
    if (current) return current;
    await setCreatedIRBy(irid, { uid: user.uid, email: user.email!, isFake: true });
    return user.uid;
};

const addPointsTransaction = async (
    data: Omit<StandardLoyaltyProgramPointsTransaction, 'addition'> & { multiplier?: number; } | OtherLoyaltyProgramPointsTransaction,
    uid: string,
) => {
    const current = await getLoyaltyProgramData(uid);
    const transaction: LoyaltyProgramPointsTransaction = data.type == 'other' ? data : {
        ...data.omit('multiplier'), addition: loyaltyPointRewards[data.type] * (data.multiplier ?? 1),
    };
    return await setLoyaltyProgramData(uid, {
        points: current.points + transaction.addition,
        history: [...current.history, transaction],
    });
};