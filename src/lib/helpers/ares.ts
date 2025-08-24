export const regulusCRN = 45317020

type RT = {
    obchodniJmeno: string;
    sidlo: {
        textovaAdresa: string;
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

export const nazevAdresaFirmy = async (ico: string, fetch: typeof window.fetch = window.fetch) => {

    if (ico.length != 8) return undefined

    let response;
    try {
        response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`, {
            method: 'GET'
        });
    } catch {
        return undefined;
    }
    if (!response.ok) return undefined;

    const json = await response.json();
    return json as RT;
};

export const nazevFirmy = async (ico: string, fetch: typeof window.fetch = window.fetch) => {

    if (ico.length != 8) return undefined

    let response;
    try {
        response = await fetch(`https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty/${ico}`, {
            method: 'GET'
        });
    } catch {
        return undefined;
    }
    if (!response.ok) return undefined;

    const json = await response.json();
    return json.obchodniJmeno as string;
};

