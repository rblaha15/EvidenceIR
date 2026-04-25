import type { IRID, SPID } from '$lib/helpers/ir';
import type { PdfToSign } from '$lib/pdf/pdf';
import type { OTP } from '$lib/data';

/** 2 min */
export const SMS_SEND_MINIMUM_WAIT_TIME = 1000 * 60 * 2;
/** 10 min */
export const SMS_CODE_LIFETIME = 1000 * 60 * 10;
/** 30 s */
export const SMS_ATTEMPT_MINIMUM_WAIT_TIME = 1000 * 30;

export interface DocumentDefinition {
    id: IRID | SPID;
    pdf: PdfToSign;
    parameter?: number;
}

export interface CodeAttemptParams extends SendCodeParams {
    code: OTP;
    timezone: string;
}

export interface SendCodeParams {
    def: DocumentDefinition;
    signingBy: {
        phone: string;
        email: string;
        name: string;
    };
    initiatingUserName?: string;
}