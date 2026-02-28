type Suggestion = {
    text: string,
};

type Suggestions = {
    suggestions?: Suggestion[]
};

export type Address = {
    house: string,
    postalCode: string,
    city: string,
}

const processAddress = (text: string): Address => ({
    house: text.split(', ')[0],
    postalCode: text.split(', ').at(-1)!.split(' ')[0].let(p => `${p.slice(0, 3)} ${p.slice(3)}`),
    city: text.split(', ').at(-1)!.split(' ').slice(1).join(' '),
})

export default {
    suggest: async (searchText: string, fetch: typeof window.fetch = window.fetch) => {
        if (searchText.length < 2) return null;
        const url = `https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/MapServer/exts/GeocodeSOE/tables/1/suggest?text=${searchText}&maxSuggestions=15&f=json`;
        const response = await fetch(url)
        const json: Suggestions = await response.json()
        if (!json.suggestions) return null;
        const texts = json.suggestions.map(i => i.text);
        return texts.map(processAddress)
    }
}