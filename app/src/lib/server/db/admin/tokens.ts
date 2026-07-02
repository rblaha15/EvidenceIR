import { tokenCollection } from '$lib/server/db';
import crypto from 'node:crypto';

export type Token = {
    email: string,
    tokenHash: string,
    expiresAt: Date,
    mode: 'register' | 'reset',
    redirect: string,
}

const hashToken = (token: string) =>
    crypto.createHash('sha256').update(token).digest('base64url');

const generateToken = () =>
    crypto.randomBytes(32).toString('base64url');

// 60 minutes
const EXPIRATION_MS = 1000 * 60 * 60;

export const createToken = async (data: Omit<Token, 'tokenHash' | 'expiresAt'>) => {
    const token = generateToken();
    const tokenHash = hashToken(token);

    const expiresAt = new Date(new Date().valueOf() + EXPIRATION_MS);
    await tokenCollection.deleteMany({ email: data.email });
    await tokenCollection.insertOne({ ...data, tokenHash, expiresAt })

    return token
};

export const getTokenData = async (token: string): Promise<Token | null> => {
    const tokenHash = hashToken(token);
    console.log(tokenHash);

    const result = await tokenCollection.findOne({ tokenHash });
    console.log(result);
    if (!result) return null;
    const { _id, ...data } = result;
    if (data.expiresAt < new Date()) {
        await tokenCollection.deleteOne({ _id });
        return null;
    }

    return data;
};

export const validateToken = async (token: string, expectedEmail: string, expectedMode: Token['mode']) => {
    const tokenHash = hashToken(token);

    const result = await tokenCollection.findOneAndDelete({
        tokenHash,
        email: expectedEmail,
        mode: expectedMode,
    });
    if (!result) return false;
    return new Date() < result.expiresAt;
};