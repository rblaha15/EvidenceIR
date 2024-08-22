const node_fetch = fetch;

export const nazevAdresaFirmy = async (ico: string, fetch: typeof node_fetch = node_fetch) => {

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
    return json as { obchodniJmeno: string; sidlo: { textovaAdresa: string; }; };
};

export const nazevFirmy = async (ico: string, fetch: typeof node_fetch = node_fetch) => {

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

