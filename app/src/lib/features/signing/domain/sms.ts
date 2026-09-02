import type { IRID, NSPID } from '$lib/helpers/ir';
import type { PdfDefiningParameter, PdfToSign } from '$lib/pdf/pdf';
import type { OTP } from '$lib/data';


export const SMS_SEND_MINIMUM_WAIT_TIME_MIN = 2;
export const SMS_SEND_MINIMUM_WAIT_TIME = 1000 * 60 * SMS_SEND_MINIMUM_WAIT_TIME_MIN;

export const SMS_CODE_LIFETIME_MIN = 15;
export const SMS_CODE_LIFETIME = 1000 * 60 * SMS_CODE_LIFETIME_MIN;

export const SMS_ATTEMPT_MINIMUM_WAIT_TIME_SEC = 20;
export const SMS_ATTEMPT_MINIMUM_WAIT_TIME = 1000 * SMS_ATTEMPT_MINIMUM_WAIT_TIME_SEC;

export interface DocumentDefinition {
    id: IRID | NSPID;
    pdf: PdfToSign;
    parameter?: PdfDefiningParameter;
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
}