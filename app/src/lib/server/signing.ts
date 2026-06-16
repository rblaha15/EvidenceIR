import type { OTP } from '$lib/data';
import type { DocumentDefinition } from "$lib/features/signing/domain/sms";

export interface DocumentSigningInfo {
    def: DocumentDefinition;
    messages: SentMessage[];
    attempts: CodeAttempt[];
    result?: SigningResult;
}

export interface SentMessage {
    code: OTP;
    sentAt: number;
    sentBy: string;
    sentTo: {
        name: string,
        email: string,
        phone: string,
    };
}

export interface CodeAttempt {
    code: OTP;
    triedAt: number;
    triedBy: string;
}

export interface SigningResult {
    code: OTP;
    signedBy: {
        name: string,
        email: string,
        phone: string,
    };
    sentAt: number;
    signedAt: number;
    initiatingUser: {
        uid: string;
        email: string;
        name?: string;
    };
}