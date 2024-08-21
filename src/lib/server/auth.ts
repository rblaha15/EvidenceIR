import { getAuth, UserRecord, type CreateRequest, type DecodedIdToken } from "firebase-admin/auth";
import { app } from "./firebase";

// AUTH
const auth = getAuth(app);

export const checkToken = (token: string | undefined | null) =>
    new Promise<DecodedIdToken | null>((resolve) => {
        if (!token) resolve(null)
        else auth.verifyIdToken(token, true)
            .then(resolve)
            .catch((e) => {
                console.log(e)
                resolve(null)
            })
    })

export const checkAdmin = (token: DecodedIdToken) => token?.admin

const getUserByEmail = (email: string) => auth.getUserByEmail(email)

const createUser = (props: CreateRequest) => auth.createUser(props)

export const getUserOrCreate = (email: string) =>
    new Promise<UserRecord>((resolve, reject) => {
        console.log(email)
        getUserByEmail(email)
            .then(resolve)
            .catch(_ => {
                console.log(`Vytváříme ${email}`);
                createUser({
                    email,
                    password: '123456'
                })
                    .then(resolve)
                    .catch(reject);
            })
    })