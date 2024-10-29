const node_fetch = fetch;

const companyOverrides = {
    4466601609: {
        obchodniJmeno: "Regulus Wärmetechnik GmbH",
        sidlo: { textovaAdresa: "Ruhrstraße 22, 67574 Osthofen, Deutschland" },
    }
}

export const nazevAdresaFirmy = async (ico: string, fetch: typeof node_fetch = node_fetch) => {

    if (Object.keys(companyOverrides).includes(ico))
        return (<Record<string, { obchodniJmeno: string; sidlo: { textovaAdresa: string; }; }>>companyOverrides)[ico]

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
    return json as { obchodniJmeno: string; sidlo: { textovaAdresa: string; }; };
};

export const nazevFirmy = async (ico: string, fetch: typeof node_fetch = node_fetch) => {

    if (Object.keys(companyOverrides).includes(ico))
        return (<Record<string, { obchodniJmeno: string; sidlo: { textovaAdresa: string; }; }>>companyOverrides)[ico].obchodniJmeno

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

