import { friendlyCompanies, startCompaniesListening } from '$lib/client/realtime';
import { get } from 'svelte/store';
import { unknownCRN } from '$lib/forms/IN/formIN';

export const regulusCRN = 45317020;

type EkonomickeSubjektySeznam = {
    pocetCelkem: number;
    ekonomickeSubjekty: EkonomickySubjekt[];
};

type Adresa = {
    textovaAdresa?: string;
    nazevObce?: string,
    nazevUlice?: string,
    cisloDomovni?: number,
    cisloOrientacni?: number,
    cisloOrientacniPismeno?: string,
    nazevCastiObce?: string,
    psc?: number,
    pscTxt?: string,
};
type EkonomickySubjekt = {
    obchodniJmeno: string;
    sidlo: Adresa;
    ico: string;
};

export default {
    getNameAndAddress: async (crn: string, fetch: typeof window.fetch = window.fetch) => {
        if (crn == unknownCRN) return undefined;

        if (crn.length == 10) {
            await startCompaniesListening();
            const fc = get(friendlyCompanies);
            const name = [...fc.assemblyCompanies, ...fc.commissioningCompanies]
                .find(c => c.crn == crn)
                ?.companyName;
            return name ? {
                obchodniJmeno: name,
                sidlo: {},
                ico: crn,
            } satisfies EkonomickySubjekt : undefined;
        }

        if (crn.length != 8) return undefined;

        let response;
        try {
            response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${crn}`, {
                method: 'GET',
            });
        } catch {
            return undefined;
        }
        if (!response.ok) return undefined;

        const json = await response.json();
        return json as EkonomickySubjekt;
    },
    getName: async (crn: string, fetch: typeof window.fetch = window.fetch) => {
        if (crn == unknownCRN) return undefined;

        if (crn.length == 10) {
            await startCompaniesListening();
            const fc = get(friendlyCompanies);
            return [...fc.assemblyCompanies, ...fc.commissioningCompanies]
                .find(c => c.crn == crn)
                ?.companyName;
        }

        if (crn.length != 8) return undefined;

        let response;
        try {
            response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${crn}`, {
                method: 'GET',
            });
        } catch {
            return undefined;
        }
        if (!response.ok) return undefined;

        const json = await response.json();
        return json.obchodniJmeno as string;
    },
    search: async (searchText: string, fetch: typeof window.fetch = window.fetch) => {
        if (!searchText.length) return undefined;

        let response;
        try {
            response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/vyhledat`, {
                method: 'POST',
                body: JSON.stringify(/^\d{8}$/.test(searchText)
                    ? { ico: [searchText] }
                    : { obchodniJmeno: searchText }),
                headers: {
                    'content-type': 'application/json',
                },
            });
        } catch {
            return undefined;
        }
        if (!response.ok) return undefined;

        const json = await response.json();
        return json as EkonomickeSubjektySeznam;
    },
};

