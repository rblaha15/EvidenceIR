import { friendlyCompanies, startCompaniesListening } from '$lib/client/realtime';
import { get } from 'svelte/store';

export const regulusCRN = 45317020;

type RT = {
    obchodniJmeno: string;
    sidlo: {
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
}

export default {
    getNameAndAddress: async (crn: string, fetch: typeof window.fetch = window.fetch) => {
        if (crn.length == 10) {
            await startCompaniesListening()
            const fc = get(friendlyCompanies);
            const name = [...fc.assemblyCompanies, ...fc.commissioningCompanies]
                .find(c => c.crn == crn)
                ?.companyName;
            return name ? {
                obchodniJmeno: name,
                sidlo: {},
            } satisfies RT : undefined;
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
        return json as RT;
    },
    getName: async (crn: string, fetch: typeof window.fetch = window.fetch) => {
        if (crn.length == 10) {
            await startCompaniesListening()
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
};

