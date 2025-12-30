import { getLoyaltyProgramData, people, setLoyaltyProgramData } from '$lib/server/realtime';
import type { IRID } from '$lib/helpers/ir';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getIR, setCreatedIRBy } from '$lib/server/firestore';
import {
    loyaltyPointRewards,
    type LoyaltyPointTriggerType,
    type LoyaltyProgramPointsTransaction,
    type LoyaltyProgramTrigger,
} from '$lib/client/loyaltyProgram';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { nowISO } from '$lib/helpers/date';
import { checkRegulusOrAdmin } from '$lib/server/auth';


const isType = <T extends LoyaltyPointTriggerType>(
    data: LoyaltyProgramTrigger, type: T,
): data is LoyaltyProgramTrigger<T> => data.type == type;

const days = (days: number) => days * 24 /*hours*/ * 60 /*minutes*/ * 60 /*seconds*/ * 1E3 /*milliseconds*/;

export const processLoyaltyReward = async (
    data: LoyaltyProgramTrigger,
    user: DecodedIdToken,
) => {
    if (checkRegulusOrAdmin(user) || new Date() < new Date(2026, 0, 1)) return
    const timestamp = nowISO(true);
    if (isType(data, 'registration')) {
        const current = await getLoyaltyProgramData(user.uid);
        if (current.history.some(t => t.type == 'registration')) return;
        await addPointsTransaction({
            ...data, addition: loyaltyPointRewards.registration, timestamp,
        }, user.uid);
    } else if (isType(data, 'connectRegulusRoute')) {
        const creatingUser = await getOrSetCreatingUser(data.irid, user);
        if (creatingUser == 'unknown') return
        const current = await getLoyaltyProgramData(creatingUser);
        if (current.history.some(t => t.type == 'connectRegulusRoute' && t.irid == data.irid)) return;
        await addPointsTransaction({
            ...data, addition: loyaltyPointRewards.connectRegulusRoute, timestamp,
        }, creatingUser);
    } else if (isType(data, 'disconnectRegulusRoute')) {
        const creatingUser = await getCreatingUserOrNull(data.irid);
        if (!creatingUser || creatingUser == 'unknown') return;
        const current = await getLoyaltyProgramData(creatingUser);
        if (current.history.some(t => t.type == 'connectRegulusRoute' && t.irid == data.irid && t.addition < 0)) return;
        if (!current.history.some(t => t.type == 'connectRegulusRoute' && t.irid == data.irid)) return;
        await addPointsTransaction({
            type: 'connectRegulusRoute', irid: data.irid, addition: -loyaltyPointRewards.connectRegulusRoute,
            note: 'Odebrání RegulusRoute z instalace', timestamp,
        }, creatingUser);
    } else if (isType(data, 'heatPumpCommission')) {
        const d = await getCompaniesCascadeGrantedAndCommission(data.irid);
        if (!d) return;
        const { assembly, commissioning, pumpCount, granted, commissionDate } = d;
        if (granted) return;
        const now = new Date();
        if (commissionDate.valueOf() + days(180) < now.valueOf()) return
        if (assembly) {
            const current = await getLoyaltyProgramData(assembly);
            if (current.history.some(t => t.type == 'heatPumpAssembly' && t.irid == data.irid)) return;
            await addPointsTransaction({
                type: 'heatPumpAssembly', irid: data.irid, addition: loyaltyPointRewards.heatPumpAssembly, timestamp,
            }, assembly);
            if (pumpCount > 1) await addPointsTransaction({
                type: 'heatPumpInCascadeAssembly', irid: data.irid, timestamp, note: `Kaskáda ${pumpCount} TČ`,
                addition: loyaltyPointRewards.heatPumpInCascadeAssembly * (pumpCount - 1),
            }, assembly);
        }
        if (commissioning) {
            const current = await getLoyaltyProgramData(commissioning);
            if (current.history.some(t => t.type == 'heatPumpCommission' && t.irid == data.irid)) return;
            await addPointsTransaction({
                type: 'heatPumpCommission', irid: data.irid, addition: loyaltyPointRewards.heatPumpCommission, timestamp,
            }, commissioning);
            if (pumpCount > 1) await addPointsTransaction({
                type: 'heatPumpInCascadeCommission', irid: data.irid, timestamp, note: `Kaskáda ${pumpCount} TČ`,
                addition: loyaltyPointRewards.heatPumpInCascadeCommission * (pumpCount - 1),
            }, commissioning);
        }
    } else if (isType(data, 'heatPumpYearlyCheck')) {
        const ir = await getIR(data.irid);
        if (!ir?.kontrolyTC?.[data.pump]?.[data.year]) return
        await addPointsTransaction({
            type: data.type, irid: data.irid, addition: loyaltyPointRewards.registration,
            note: `TČ: ${data!.pump}, rok: ${data!.year}`, timestamp,
        }, user.uid);
    }
};

const getCompanyUser = async (email: string) =>
    (await people()).entries().find(([_, p]) => p.email == email)?.[0] || null;

const getCompaniesCascadeGrantedAndCommission = async (irid: IRID) => {
    const ir = await getIR(irid);
    return ir && ir.uvedeniTC.os ? {
        assembly: await getCompanyUser(ir.evidence.montazka.email),
        commissioning: await getCompanyUser(ir.evidence.uvedeni.email),
        pumpCount: cascadePumps(ir.evidence).length,
        granted: ir.loyaltyProgram?.grantedCommission ?? false,
        commissionDate: new Date(ir.uvedeniTC.uvadeni.date),
    } : null;
};

const getCreatingUserOrNull = async (irid: IRID) => {
    const ir = await getIR(irid);
    return ir ? ir.createdBy?.uid : 'unknown';
};

const getOrSetCreatingUser = async (irid: IRID, user: DecodedIdToken) => {
    const current = await getCreatingUserOrNull(irid);
    if (current) return current;
    await setCreatedIRBy(irid, { uid: user.uid, email: user.email!, isFake: true });
    return user.uid;
};

const addPointsTransaction = async (
    data: LoyaltyProgramPointsTransaction,
    uid: string,
) => {
    const current = await getLoyaltyProgramData(uid);
    return await setLoyaltyProgramData(uid, {
        points: current.points + data.addition,
        history: [...current.history, data],
    });
};