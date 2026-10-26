import type { WriteDatabase, WriteFunctionIR, WriteFunctionNSP } from '$lib/client/db/def';
import { deletedIR, deletedNSP, type IR, type NSP } from '$lib/data';
import type { Tail } from '$lib/extensions';
import { extractIDFromSPOrSZ } from '$lib/helpers/ir';

export type WriteDatabaseUpdates = {
    [F in WriteFunctionIR]?: ((...args: [oldIR: IR, ...Tail<Parameters<WriteDatabase[F]>>]) => IR)
} & {
    [F in WriteFunctionNSP]?: ((...args: [oldNSP: NSP, ...Tail<Parameters<WriteDatabase[F]>>]) => NSP)
}

export const updates = {
    deleteIR: oldIR => deletedIR(oldIR),
    updateIN: (oldIR, rawData, isDraft) => {
        const newIR = structuredClone(oldIR);
        newIR.IN = rawData;
        newIR.isDraft = isDraft;
        return newIR;
    },
    addRKT: (oldIR, pump, year, check) => {
        const newIR = structuredClone(oldIR);
        newIR.RK.TC[pump] = newIR.RK.TC[pump] ?? {};
        newIR.RK.TC[pump][year] = check;
        return newIR;
    },
    addRKS: (oldIR, year, check) => {
        const newIR = structuredClone(oldIR);
        newIR.RK.SOL = newIR.RK.SOL ?? {};
        newIR.RK.SOL[year] = check;
        return newIR;
    },
    addSPs: (oldIR, protocols) => {
        const newIR = structuredClone(oldIR);
        for (const protocol of protocols) {
            newIR.SPs[extractIDFromSPOrSZ(protocol)] = protocol;
        }
        return newIR;
    },
    updateSP: (oldIR, protocol) => {
        const newIR = structuredClone(oldIR);
        newIR.SPs[extractIDFromSPOrSZ(protocol)] = protocol;
        return newIR;
    },
    deleteSP: (oldIR, id) => {
        const newIR = structuredClone(oldIR);
        const { [id]: _, ...newSPs } = newIR.SPs;
        newIR.SPs = newSPs;
        return newIR;
    },
    updateUPT: (oldIR, protocol) => {
        const newIR = structuredClone(oldIR);
        newIR.UP.TC = protocol;
        return newIR;
    },
    updateDateUPT: (oldIR, date) => {
        const newIR = structuredClone(oldIR);
        newIR.UP.dateTC = date;
        return newIR;
    },
    addUPS: (oldIR, protocol) => {
        const newIR = structuredClone(oldIR);
        newIR.UP.SOL = protocol;
        return newIR;
    },
    updateDateUPS: (oldIR, date) => {
        const newIR = structuredClone(oldIR);
        newIR.UP.dateTC = date;
        return newIR;
    },
    updateUPF: (oldIR, protocol) => {
        const newIR = structuredClone(oldIR);
        newIR.UP.FVE = protocol;
        return newIR;
    },
    addFT: (oldIR, faceTable) => {
        const newIR = structuredClone(oldIR);
        newIR.FT = faceTable;
        return newIR;
    },
    updateUsersWithAccessToIR: (oldIR, users) => {
        const newIR = structuredClone(oldIR);
        newIR.meta.usersWithAccess = users;
        return newIR;
    },
    markRefsiteConfirmed: oldIR => {
        const newIR = structuredClone(oldIR);
        newIR.meta.flags.confirmedRefsite = true;
        return newIR;
    },
    updateDKT: (oldIR, enabled, executingCompany) => {
        const newIR = structuredClone(oldIR);
        newIR.RK.DK.TC = enabled ? {
            state: 'waiting',
            ...newIR.RK.DK.TC ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        return newIR;
    },
    updateDKS: (oldIR, enabled, executingCompany) => {
        const newIR = structuredClone(oldIR);
        newIR.RK.DK.SOL = enabled ? {
            state: 'waiting',
            ...newIR.RK.DK.SOL ?? {},
            executingCompany: executingCompany!,
        } : undefined;
        return newIR;
    },

    updateNSP: (oldNSP, rawData) => {
        const newNSP = structuredClone(oldNSP);
        newNSP.NSP = rawData;
        newNSP.deleted = false;
        return newNSP;
    },
    deleteNSP: oldNSP => deletedNSP(oldNSP),
} as const satisfies WriteDatabaseUpdates;