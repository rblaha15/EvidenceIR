import type { Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { FormRKT } from '$lib/forms/RKT/formRKT';
import type { FormUPT } from '$lib/forms/UPT/formUPT';
import type { FormUPS } from '$lib/forms/UPS/formUPS';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';
import { extractIRIDFromRawData, extractSPIDFromRawData, type IRID, type SPID } from '$lib/helpers/ir';
import type { FormUPF } from '$lib/forms/UPF/formUPF';
import type { TC } from '$lib/forms/IN/defaultIN';
import type { FormFT } from '$lib/forms/FT/formFT';
import { serverTimestamp, Timestamp } from 'firebase/firestore';
import '$lib/extensions';
import type { FormRKS } from '$lib/forms/RKS/formRKS';
import type { FormRKTL } from '$lib/forms/RKT/formRKTL';
import type { User } from 'firebase/auth';
import type { FormNSP } from '$lib/forms/NSP/formNSP';

export type Year = number;

export type RecommendationState = 'waiting' | 'sentRecommendation' | 'sentRequest';
export type RecommendationSettings = {
    executingCompany: 'assembly' | 'commissioning' | 'regulus',
    state: RecommendationState,
    code?: string,
};

export type IR = ExistingIR | DeletedIR;

export interface DeletedIR extends BaseIR {
    deleted: true;
    meta: BaseIR['meta'] & {
        deletedAt: Timestamp;
        movedTo?: IRID;
    };
}

export interface ExistingIR extends BaseIR {
    deleted: false;
}

interface BaseIR {
    isDraft: boolean;
    meta: {
        id: IRID;
        keysChangedAt: Timestamp;
        changedAt?: Timestamp;
        createdAt?: Timestamp;
        createdBy?: {
            uid: string;
            email: string;
            isFake?: boolean;
        };
        usersWithAccess: string[];
        loyaltyProgram?: {
            grantedCommission?: boolean;
        };
    };
    IN: Raw<FormIN>;
    UP: {
        TC?: Raw<FormUPT>;
        SOL?: Raw<FormUPS>;
        FVE?: Raw<FormUPF>;
        dateTC?: string;
        dateSOL?: string;
    };
    RK: {
        TC: { [_ in TC]?: { [_ in Year]?: Raw<FormRKT | FormRKTL> }; };
        SOL?: Record<Year, Raw<FormRKS>>;
        DK: {
            TC?: RecommendationSettings;
            SOL?: RecommendationSettings;
        };
    };
    SPs: Raw<FormSP>[];
    FT?: Raw<FormFT>;
}

export type NSP = ExistingNSP | DeletedNSP;

export interface DeletedNSP extends BaseNSP {
    deleted: true;
    meta: BaseNSP['meta'] & {
        deletedAt: Timestamp;
    };
}

export interface ExistingNSP extends BaseNSP {
    deleted: false;
}

interface BaseNSP {
    meta: {
        id: SPID;
        changedAt?: Timestamp;
        createdAt: Timestamp;
        createdBy?: {
            uid: string;
            email: string;
        };
    };
    NSP: Raw<FormNSP>;
}

export const newIR = (
    raw: Raw<FormIN>,
    user: User,
    isDraft: boolean,
): ExistingIR => ({
    isDraft,
    deleted: false,
    meta: {
        id: extractIRIDFromRawData(raw),
        keysChangedAt: serverTimestamp() as Timestamp,
        changedAt: serverTimestamp() as Timestamp,
        createdAt: serverTimestamp() as Timestamp,
        createdBy: {
            uid: user.uid,
            email: user.email!,
        },
        usersWithAccess: [user.email!, raw.uvedeni.email, raw.montazka.email].distinct().filter(Boolean),
        loyaltyProgram: {
            grantedCommission: false,
        },
    },
    IN: raw,
    UP: {},
    RK: {
        TC: {},
        DK: {},
    },
    SPs: [],
});

export const newNSP = (
    raw: Raw<FormNSP>,
    user: User,
): ExistingNSP => ({
    deleted: false,
    meta: {
        id: extractSPIDFromRawData(raw.zasah),
        changedAt: serverTimestamp() as Timestamp,
        createdAt: serverTimestamp() as Timestamp,
        createdBy: {
            uid: user.uid,
            email: user.email!,
        },
    },
    NSP: raw,
});

export type RecommendationData = {
    irid: IRID;
    user: string;
    company: string;
    companyEmail: string;
    location: string;
    type: 'TČ' | 'SOL',
};

export const deletedIR = (
    ir: IR,
    movedTo?: IRID,
): DeletedIR => ({
    ...ir,
    deleted: true,
    meta: {
        ...ir.meta,
        deletedAt: serverTimestamp() as Timestamp,
        ...movedTo ? { movedTo } : {},
    },
});

export const deletedNSP = (
    nsp: NSP,
): DeletedNSP => ({
    ...nsp,
    deleted: true,
    meta: {
        ...nsp.meta,
        deletedAt: serverTimestamp() as Timestamp,
    },
});