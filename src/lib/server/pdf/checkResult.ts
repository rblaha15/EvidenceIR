import { kontrolaTypes, orderArray, type KontrolaAsRecord } from "$lib/Kontrola"
import type { LanguageCode } from "$lib/languages"
import { evidence } from "../firestore"
import { generatePdf } from "../pdf"

const node_fetch = fetch

export default ({ lang, ir, fetch }: { lang: LanguageCode, ir: string, fetch: typeof node_fetch }) => generatePdf({
    lang, ir, fetch,
    getFirebaseData: async () => evidence(ir),
    formLocation: '/check_cs.pdf',
    title: "Popis úkonů při provádění preventivní roční prohlídky vzduchového tepelného čerpadla",
    fileName: "Roční prohlídka.pdf",
    getFormData: async ({ kontroly }) => {
        const start = {
/*          TEXT1 */ Text1: '',
/*       poznamky */ Text141: '',
        }
        const veci = Object.fromEntries(Object.entries(kontroly).flatMap(([rok, k]: [string, KontrolaAsRecord]) => {
            const veci = orderArray.filter(v =>
                kontrolaTypes[v.key1][v.key2] != 'nadpis' &&
                (rok == '1' || kontrolaTypes[v.key1][v.key2] != 'tlak')
            )
            const start =
                1 + // Indexujeme od 1
                1 + // Text1
                (Number(rok) - 1) * (
                    veci.length // veci v každém roce
                ) +
                (rok == '1' ? 0 : orderArray.filter(v => kontrolaTypes[v.key1][v.key2] == 'tlak').length) // tlaky v roce 1

            return veci.map((v, i) => [
                `Text${i + start}`, kontrolaTypes[v.key1][v.key2] == 'boolean' ? k[v.key1][v.key2] == undefined ? '' : k[v.key1][v.key2] ? 'ano' : 'ne' : k[v.key1][v.key2] ?? ''
            ])
        }))
        const metadata = Object.fromEntries(Object.entries(kontroly).flatMap(([rok, k]) => {
            const veci = k.meta
            const start =
                1 + // Indexujeme od 1
                141 + // Text141
                (Number(rok) - 1) * 2 // 2 metadata

            return [
                [`Text${start}`, veci.datum!],
                [`Text${start + 1}`, veci.osoba!],
            ]
        }))
        return {
            ...start,
            ...metadata,
            ...veci
        };
    },
})