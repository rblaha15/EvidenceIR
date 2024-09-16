import { friendlyCompanies, type Company, type FriendlyCompanies } from "$lib/client/realtime"
import { sortBy, zip } from "lodash-es"
import { derived, type Readable } from "svelte/store"

export const companies = derived(friendlyCompanies, c => forBoth(c, c =>
    c.sort((a, b) => a.companyName.localeCompare(b.companyName)) ?? []
) as FriendlyCompanies)

export const filteredCompanies = (filter: Readable<string>) => derived([companies, filter], ([c, filter]) => forBoth(c, c =>
    sortBy(c
        .map(item => {
            var normalisedItem = wordsToFilter(item.companyName)
            return [item, wordsToFilter(filter).map(searchedWord => {
                const i = normalisedItem.findIndex(itemWord => itemWord.startsWith(searchedWord)
                )
                if (i != -1) {
                    normalisedItem = normalisedItem.slice(i + 1)
                }
                return i
            })] as const
        })
        .filter(([_, searchedWordIndexes]) => searchedWordIndexes.every(it => it != -1)
        ),
        ([c]) => c.companyName)
        .sort(([_, aList], [__, bList]) => {
            const list = zip(aList, bList)
                .filter(([a, b]) => a != undefined && b != undefined && a != b)
            if (list.length == 0)
                return 0
            else
                return (list[0][0]! - list[0][1]!)
        })
        .map(([item, _]) => item)) as FriendlyCompanies)

export const chosenCompanies = derived([companies], ([c]) => (crnA: string, crnC: string) => forBoth(c, (c, t) =>
    c.find((c) => c.crn == (t == 'a' ? crnA : crnC))?.companyName
))

export const wordsToFilter = (s: string) => s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .split(' ')

const forBoth = <T = Company[]>(companies: FriendlyCompanies, mapper: (arr: Company[], t: 'a' | 'c') => T) => ({
    assemblyCompanies: mapper(companies.assemblyCompanies, 'a'),
    commissioningCompanies: mapper(companies.commissioningCompanies, 'c'),
})