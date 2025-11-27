import { getDatabase } from "firebase-admin/database"
import { app } from "./firebase"
import type { Company, Person, SparePart, Technician } from '$lib/client/realtime';
import '$lib/extensions'

const realtime = getDatabase(app)

const lidiRef = realtime.ref("/people")
const firmyRef = realtime.ref("/companies")
const techniciRef = realtime.ref('/technicians');
const dilyRef = realtime.ref('/spareParts');
const nadrzeRef = realtime.ref('/accumulationTanks');
const zasobnikyRef = realtime.ref('/waterTanks');
const kolektoryRef = realtime.ref('/solarCollectors');

export const setCompanies = (companies: Company[]) => firmyRef.set(Object.fromEntries(companies.map(defined).map(c => [c.crn, c] as const)))
export const setTechnicians = (technicians: Technician[]) => techniciRef.set(technicians);
export const setSpareParts = (spareParts: SparePart[]) => dilyRef.set(spareParts);
export const setAccumulationTanks = (tanks: string[]) => nadrzeRef.set(tanks);
export const setWaterTanks = (tanks: string[]) => zasobnikyRef.set(tanks);
export const setSolarCollectors = (tanks: string[]) => kolektoryRef.set(tanks);

export const setPersonDetails = (userId: string, person: Person) => lidiRef.child(userId).set(defined(person))
export const removePerson = (userId: string) => lidiRef.child(userId).remove()

export const people = async () => ((await lidiRef.get()).val() as Record<string, Person>).getValues() ?? []
export const technicians = async () => (await techniciRef.get()).val() as Technician[] ?? []

const defined = <T extends Record<PropertyKey, unknown>>(obj: T): T =>
    obj.filterValues((_, v) => v != null) as T