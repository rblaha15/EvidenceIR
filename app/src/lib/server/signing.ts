import type { OTP } from '$lib/data';
import type { IRID, SPID } from '$lib/helpers/ir';
import { app } from '$lib/server/firebase';
import { FieldValue, getFirestore, type QueryDocumentSnapshot, type WithFieldValue } from 'firebase-admin/firestore';
import type { DocumentDefinition } from '$lib/features/signing/domain/sms';

export interface DocumentSigningInfo {
    messages: SentMessage[];
    attempts: CodeAttempt[];
    result?: SigningResult;
}

export interface SentMessage {
    code: OTP;
    sentAt: number;
    sentBy: string;
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

const firestore = app ? getFirestore(app) : getFirestore();

const signingCollection = (id: IRID | SPID) =>
    firestore.collection(`signing/${id}/documents`).withConverter<DocumentSigningInfo>({
        toFirestore: (modelObject: WithFieldValue<DocumentSigningInfo>) => modelObject,
        fromFirestore: (snapshot: QueryDocumentSnapshot) => snapshot.data() as DocumentSigningInfo,
    });

const signingDoc = (def: DocumentDefinition) => {
    const collection = signingCollection(def.id);
    const id = def.parameter ? `${def.pdf}-${def.parameter}` : def.pdf;
    return collection.doc(id);
};

export const getSigning = async (def: DocumentDefinition) => {
    const snapshot = await signingDoc(def).get();
    const data = snapshot.data();
    if (!data) await signingDoc(def).set({ messages: [], attempts: [] });
    return data || { messages: [], attempts: [] };
};

export const putSentMessage = async (def: DocumentDefinition, message: SentMessage) => {
    const doc = signingDoc(def);
    await doc.update({ messages: FieldValue.arrayUnion(message) });
};
export const putCodeAttempt = async (def: DocumentDefinition, attempt: CodeAttempt) => {
    const doc = signingDoc(def);
    await doc.update({ attempts: FieldValue.arrayUnion(attempt) });
};
export const putSigningResult = async (def: DocumentDefinition, result: SigningResult) => {
    const doc = signingDoc(def);
    await doc.update({ result });
};