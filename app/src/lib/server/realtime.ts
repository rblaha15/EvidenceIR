import { getDatabase } from "firebase-admin/database"
import { app } from "./firebase"
import type { Company, Person, Technician } from '$lib/client/realtime';
import { ref } from 'firebase/database';

const realtime = getDatabase(app)

const lidiRef = realtime.ref("/people")
const firmyRef = realtime.ref("/companies")
const techniciRef = realtime.ref('/technicians');

export const setCompanies = (companies: Company[]) => firmyRef.set(Object.fromEntries(companies.map(defined).map(c => [c.crn, c] as const)))
export const setTechnicians = (technicians: Technician[]) => techniciRef.set(technicians);

export const setPersonDetails = (userId: string, person: Person) => lidiRef.child(userId).set(defined(person))
export const removePerson = (userId: string) => lidiRef.child(userId).remove()

export const people = async () => Object.values((await lidiRef.get()).val() as { [uid: string]: Person } ?? {})
export const technicians = async () => (await techniciRef.get()).val() as Technician[] ?? []

const defined = <T extends Record<any, any>>(obj: T): T =>
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != undefined && v != null)) as T