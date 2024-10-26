import { getDatabase } from "firebase-admin/database"
import { app } from "./firebase"
import type { Company, Person } from "$lib/client/realtime"

const realtime = getDatabase(app)

const lidiRef = realtime.ref("/people")
const firmyRef = realtime.ref("/companies")

export const setCompanies = (companies: Company[]) => firmyRef.set(Object.fromEntries(companies.map(defined).map(c => [c.crn, c] as const)))

export const setPersonDetails = (userId: string, person: Person) => lidiRef.child(userId).set(defined(person))
export const removePerson = (userId: string) => lidiRef.child(userId).remove()

export const people = async () => Object.values((await lidiRef.get()).val() as { [uid: string]: Person } ?? {})

const defined = <T extends Record<any, any>>(obj: T): T =>
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != undefined && v != null)) as T