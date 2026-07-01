import type { Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { FormRKT } from '$lib/forms/RKT/formRKT';
import type { FormUPT } from '$lib/forms/UPT/formUPT';
import type { FormUPS } from '$lib/forms/UPS/formUPS';
import {
    extractIRIDFromRawData,
    extractSPIDFromRawData,
    type IRID,
    type NSPID,
    type SPID
} from '$lib/helpers/ir';
import type { FormUPF } from '$lib/forms/UPF/formUPF';
import type { TC } from '$lib/forms/IN/defaultIN';
import type { FormFT } from '$lib/forms/FT/formFT';
import '$lib/extensions';
import type { FormRKS } from '$lib/forms/RKS/formRKS';
import type { FormRKTL } from '$lib/forms/RKT/formRKTL';
import type { User } from '$lib/client/auth';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';
import type { FormSZ } from '$lib/forms/SP/formSZ';
import type { FriendlyCompanies } from '$lib/client/db/arrays';
import type { PdfDefiningParameter, PdfToSign, PdfWithDefiningParameter } from '$lib/pdf/pdf';
import type { MatchKeysAndValues } from "mongodb";

export type Timestamp = number;

export type Year = number;

export type RecommendationState = 'waiting' | 'sentRecommendation' | 'sentRequest';
export type RecommendationSettings = {
    executingCompany: 'assembly' | 'commissioning' | 'regulus',
    state: RecommendationState,
    code?: string,
    /**
     * Count commission anniversaries x days later
     * */
    offset?: number,
};

export type OTP = string

export type SignatureState = {
    state: 'sentCodes';
    initiatingUser: {
        uid: string;
        email: string;
        name?: string;
    };
} | {
    state: 'signed';
    initiatingUser: {
        uid: string;
        email: string;
        name?: string;
    };
    signedBy: {
        phone: string;
        email: string;
        name: string;
    };
    signedAt: number;
    code: OTP;
    timezone: string;
}

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

export type Signatures<T extends 'IR' | 'NSP'> = {
    [P in PdfToSign<T>]?: P extends PdfWithDefiningParameter
        ? Record<PdfDefiningParameter<P>, SignatureState> : SignatureState;
};

interface BaseIR {
    isDraft: boolean;
    meta: {
        id: IRID;
        changedAt: Timestamp;
        createdAt?: Timestamp;
        createdBy?: {
            uid: string;
            email: string;
            isFake?: boolean;
        };
        usersWithAccess: string[];
        flags: {
            grantedCommission?: boolean;
            confirmedRefsite?: boolean;
        };
    };
    signatures?: Signatures<'IR'>;
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
    SPs: Record<SPID, Raw<FormSP | FormSZ>>;
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
        id: NSPID;
        changedAt?: Timestamp;
        createdAt: Timestamp;
        createdBy?: {
            uid: string;
            email: string;
        };
    };
    signatures?: Signatures<'NSP'>;
    NSP: Raw<FormNSP>;
}

export type DataType = 'IR' | 'NSP';
export type Data<T extends DataType> = {
    IR: IR,
    NSP: NSP,
}[T]
export type ExistingData<T extends DataType> = {
    IR: ExistingIR,
    NSP: ExistingNSP,
}[T]
export type DeletedData<T extends DataType> = {
    IR: DeletedIR,
    NSP: DeletedNSP,
}[T]
export type ID<T extends DataType> = {
    IR: IRID,
    NSP: NSPID,
}[T]

export const newIR = (
    raw: Raw<FormIN>,
    user: User,
    isDraft: boolean,
    friendlyCompanies: FriendlyCompanies,
): ExistingIR => ({
    isDraft,
    deleted: false,
    meta: {
        id: extractIRIDFromRawData(raw),
        changedAt: new Date().valueOf(),
        createdAt: new Date().valueOf(),
        createdBy: {
            uid: user.id,
            email: user.email,
        },
        usersWithAccess: [
            user.email!,
            friendlyCompanies.commissioningCompanies.find(c => c.email == raw.uvedeni.email)
                ?.representativeUserEmail,
            raw.uvedeni.email,
            friendlyCompanies.assemblyCompanies.find(c => c.email == raw.montazka.email)
                ?.representativeUserEmail,
            raw.montazka.email,
        ].filterNotUndefined().distinct().filter(Boolean),
        flags: {
            grantedCommission: false,
            confirmedRefsite: false,
        },
    },
    IN: raw,
    UP: {},
    RK: {
        TC: {},
        DK: {},
    },
    SPs: {},
});

export const newNSP = (
    raw: Raw<FormNSP>,
    user: User,
): ExistingNSP => ({
    deleted: false,
    meta: {
        id: extractSPIDFromRawData(raw.zasah),
        changedAt: new Date().valueOf(),
        createdAt: new Date().valueOf(),
        createdBy: {
            uid: user.id,
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

export const deleteIR = (
    movedTo?: IRID,
): MatchKeysAndValues<IR> => ({
    deleted: true,
    'meta.deletedAt': new Date().valueOf(),
    'meta.movedTo': movedTo,
});

export const deletedIR = (
    ir: IR,
    movedTo?: IRID,
): DeletedIR => ({
    ...ir,
    deleted: true,
    meta: {
        ...ir.meta,
        deletedAt: new Date().valueOf(),
        movedTo,
    },
});

export const deleteNSP = (): MatchKeysAndValues<NSP> => ({
    deleted: true,
    'meta.deletedAt': new Date().valueOf(),
});

export const deletedNSP = (
    nsp: NSP,
): DeletedNSP => ({
    ...nsp,
    deleted: true,
    meta: {
        ...nsp.meta,
        deletedAt: new Date().valueOf(),
    },
});