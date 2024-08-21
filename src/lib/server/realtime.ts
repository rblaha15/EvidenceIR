import { getDatabase } from "firebase-admin/database"
import { app } from "./firebase"
import type { Person } from "$lib/client/realtime"

const realtime = getDatabase(app)

export const setPersonDetails = (userId: string, person: Person) =>
    realtime.ref("/people").child(userId).set(person)