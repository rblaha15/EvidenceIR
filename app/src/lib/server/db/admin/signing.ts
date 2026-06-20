import { id, irCollection, nspCollection, signingCollection } from "$lib/server/db";
import type { IRID, NSPID } from "$lib/helpers/ir";
import type { SignatureState } from "$lib/data";
import type { PdfDefiningParameter, PdfToSign } from "$lib/pdf/pdf";
import type { DocumentDefinition } from '$lib/features/signing/domain/sms';
import type { CodeAttempt, DocumentSigningInfo, SentMessage, SigningResult } from "$lib/server/signing";

export const setSignature = async (
    type: 'IR' | 'NSP',
    docId: IRID | NSPID,
    pdf: PdfToSign,
    parameter: PdfDefiningParameter | undefined,
    signature: SignatureState,
) => {
    const collection = type == 'IR' ? irCollection : nspCollection;
    const path = parameter ? `signatures.${pdf}.${parameter}` : `signatures.${pdf}`;
    await collection.updateOne(id(docId), { [path]: signature });
}

export const getSigning = async (def: DocumentDefinition): Promise<Omit<DocumentSigningInfo, 'def'>> => {
    const data = await signingCollection.findOne({ def }, { projection: { _id: 0, def: 0 } });
    if (!data) await signingCollection.insertOne({ def, messages: [], attempts: [] });
    return data || { messages: [], attempts: [] };
};

export const putSentMessage = async (def: DocumentDefinition, message: SentMessage) => {
    await signingCollection.updateOne({ def }, { $push: { messages: message } });
};
export const putCodeAttempt = async (def: DocumentDefinition, attempt: CodeAttempt) => {
    await signingCollection.updateOne({ def }, { $push: { attempts: attempt } });
};
export const putSigningResult = async (def: DocumentDefinition, result: SigningResult) => {
    await signingCollection.updateOne({ def }, { $set: { result } });
};