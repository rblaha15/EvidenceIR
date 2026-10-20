import { checkIsAnyRegulusOrAdmin } from '$lib/client/auth';
import {
    type ExtendedLoyaltyProgramTrigger,
    loyaltyPointRewards,
    type LoyaltyPointTriggerType,
    type LoyaltyProgramPointsTransaction,
    type OtherLoyaltyProgramPointsTransaction,
    type StandardLoyaltyProgramPointsTransaction,
} from '$lib/client/loyaltyProgram';
import type { IR } from '$lib/data';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import { nowISO } from '$lib/helpers/date';
import type { User } from '$lib/server/auth';
import { getAllIRs, setCreatedIRBy, setGrantedCommission } from '$lib/server/db/admin/general';
import { getCompanyByCRN } from '$lib/server/db/arrays';
import { getLoyaltyProgramData, setLoyaltyProgramData } from '$lib/server/db/loyaltyProgram';

const isType = <T extends LoyaltyPointTriggerType>(
    data: ExtendedLoyaltyProgramTrigger, type: T,
): data is ExtendedLoyaltyProgramTrigger<T> => data.type == type;

const days = (days: number) => days * 24 /*hours*/ * 60 /*minutes*/ * 60 /*seconds*/ * 1E3 /*milliseconds*/;

export const processLoyaltyReward = async <T extends LoyaltyPointTriggerType>(
    data: ExtendedLoyaltyProgramTrigger<T>,
    locals: App.Locals,
) => {
    const user = locals.user!;
    const timestamp = nowISO(true);
    if (isType(data, 'registration')) {
        if (checkIsAnyRegulusOrAdmin(user)) return;
        const current = await getLoyaltyProgramData(user.email);
        if (current.history.some(t => t.type == 'registration')) return;
        await addPointsTransaction({ ...data, timestamp }, user.email);
    } else if (isType(data, 'connectRegulusRoute')) {
        if (checkIsAnyRegulusOrAdmin(user)) return;
        const creatingUser = await getOrSetCreatingUser(data.ir, locals);
        if (creatingUser == 'unknown') return;
        const current = await getLoyaltyProgramData(creatingUser);
        if (current.history.some(t => t.type == 'connectRegulusRoute' && t.irid == data.irid)) return;
        await addPointsTransaction({ ...data, timestamp }, creatingUser);
    } else if (isType(data, 'disconnectRegulusRoute')) {
        if (checkIsAnyRegulusOrAdmin(user)) return;
        const creatingUser = await getCreatingUserOrNull(data.ir);
        if (!creatingUser || creatingUser == 'unknown') return;
        const current = await getLoyaltyProgramData(creatingUser);
        if (current.history.some(t => t.type == 'connectRegulusRoute' && t.irid == data.irid && t.addition < 0)) return;
        if (!current.history.some(t => t.type == 'connectRegulusRoute' && t.irid == data.irid)) return;
        await addPointsTransaction({
            type: 'connectRegulusRoute', irid: data.irid, multiplier: -1, note: 'Odebrání RegulusRoute z instalace', timestamp,
        }, creatingUser);
    } else if (isType(data, 'heatPumpCommission')) {
        if (!data.ir || !data.ir.UP.dateTC || !data.ir.UP.TC?.os || !data.ir.UP.TC.uvadeni.createdAt) return null;
        if (data.ir.meta.flags?.grantedCommission) return;
        const commissionDate = new Date(data.ir.UP.dateTC);
        const dateOfCreatingUPT = new Date(data.ir.UP.TC.uvadeni.createdAt);
        if (commissionDate.valueOf() + days(180) < dateOfCreatingUPT.valueOf()) return;
        const assembly = await getCompanyUser(data.ir.IN.montazka.ico);
        const commissioning = await getCompanyUser(data.ir.IN.uvedeni.ico);
        const pumpCount = cascadePumps(data.ir.IN).length;
        if (assembly) {
            const current = await getLoyaltyProgramData(assembly);
            if (current.history.some(t => t.type == 'heatPumpAssembly' && t.irid == data.irid)) return;
            await addPointsTransaction({ type: 'heatPumpAssembly', irid: data.irid, timestamp }, assembly);
            if (pumpCount > 1) await addPointsTransaction({
                type: 'heatPumpInCascadeAssembly', irid: data.irid, timestamp, note: `Kaskáda ${pumpCount} TČ`,
                multiplier: (pumpCount - 1),
            }, assembly);
        }
        if (commissioning && !checkIsAnyRegulusOrAdmin(user)) {
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
        if (checkIsAnyRegulusOrAdmin(user)) return;
        if (!data.ir?.RK?.TC?.[data.pump]?.[data.year]) return;
        await addPointsTransaction({
            type: data.type, irid: data.irid, note: `TČ: ${data!.pump}, rok: ${data!.year}`, timestamp,
        }, user.email);
    }
};

const getCompanyUser = async (crn: string) => {
    const company = await getCompanyByCRN(crn);
    return company?.representativeUserEmail || company?.email;
}

const getCreatingUserOrNull = async (ir: IR) =>
    ir ? ir.meta.createdBy?.email : 'unknown';

const getOrSetCreatingUser = async (ir: IR, locals: App.Locals) => {
    const user = locals.user!;
    const current = await getCreatingUserOrNull(ir);
    if (current) return current;
    await setCreatedIRBy(ir.meta.id, { email: user.email, isFake: true });
    return user.email;
};

export const addPointsTransaction = async (
    data: Omit<StandardLoyaltyProgramPointsTransaction, 'addition'> & { multiplier?: number; } | OtherLoyaltyProgramPointsTransaction,
    userEmail: string,
) => {
    const current = await getLoyaltyProgramData(userEmail);
    const transaction: LoyaltyProgramPointsTransaction = data.type == 'other' ? data : {
        ...data.omit('multiplier'), addition: loyaltyPointRewards[data.type] * (data.multiplier ?? 1),
    };
    return await setLoyaltyProgramData({
        email: userEmail,
        points: current.points + transaction.addition,
        history: [...current.history, transaction],
    });
};

export const grantPointsForYesterday = async () => {
    const irs = await getAllIRs();

    for (const ir of irs) {
        if (ir.isDraft) continue;

        if (ir.meta.createdBy) await processLoyaltyReward(
            { type: ir.IN.vzdalenyPristup.chce ? 'connectRegulusRoute' : 'disconnectRegulusRoute', irid: ir.meta.id, ir },
            { user: { email: ir.meta.createdBy.email } as User, session: null },
        );

        const email = ir.UP.TC?.uvadeni?.createdBy;
        if (email) await processLoyaltyReward(
            { type: 'heatPumpCommission', irid: ir.meta.id, ir },
            { user: { email } as User, session: null },
        );
    }
};