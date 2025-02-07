import { type GetOrVal, Nadpisova, p, Pisatkova, Prepinatkova, Vybiratkova, Zaskrtavatkova } from '../Vec.svelte.js';
import { todayISO } from '$lib/helpers/date';
import type { Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import { uvestSOLDoProvozu } from '$lib/client/firestore';
import type { FormInfo } from './forms.svelte.js';

export type UDSOL = {
    uvedeni: UvedeniSOL,
    evidence: Raw<Data>,
}

export class Ano<D> extends Prepinatkova<D> {
    constructor(args: {
        nazev: GetOrVal<D>,
        onError?: GetOrVal<D>,
        required?: GetOrVal<D, boolean>,
        zobrazit?: GetOrVal<D, boolean>,
        vybrano?: boolean,
    }) {
        super({
            vybrano: args.vybrano ?? false,
            required: args.required ?? false,
            ...args,
            moznosti: [`no`, `yes`] as const,
            hasPositivity: true,
        });
    }
}

export type UvedeniSOL = {
    sol: {
        nadpis: Nadpisova<UDSOL>,
        orientace: Pisatkova<UDSOL>,
        sklon: Pisatkova<UDSOL>,
        zasobnik: Pisatkova<UDSOL>,
        akumulacka: Pisatkova<UDSOL>,
        vymenik: Pisatkova<UDSOL>,
        solRegulator: Pisatkova<UDSOL>,
        cerpadloaSkupina: Pisatkova<UDSOL>,
        expanznkaSolarni: Ano<UDSOL>,
        objem: Pisatkova<UDSOL>,
        ovzdusneni: Vybiratkova<UDSOL>,
        teplonosnaKapalina: Vybiratkova<UDSOL>,
        potrubi: Pisatkova<UDSOL>,
        prumer: Pisatkova<UDSOL>,
        delkyPotrubi: Pisatkova<UDSOL>,
        izolacePotrubi: Zaskrtavatkova<UDSOL>,
    },
    uvadeni: {
        nadpis: Nadpisova<UDSOL>,
        tlakDoba: Zaskrtavatkova<UDSOL>,
        tlakTlak: Zaskrtavatkova<UDSOL>,
        tlakUbytek: Zaskrtavatkova<UDSOL>,
        ovzdusneni: Zaskrtavatkova<UDSOL>,
        blesk: Zaskrtavatkova<UDSOL>,
        podminky: Zaskrtavatkova<UDSOL>,
        regulator: Zaskrtavatkova<UDSOL>,
        vlastnik: Zaskrtavatkova<UDSOL>,
        date: Pisatkova<UDSOL>,
    },
}

const defaultUvedeniSOL = (): UvedeniSOL => ({
    sol: {
        nadpis: new Nadpisova({ nazev: `solarSystem` }),
        orientace: new Pisatkova({ nazev: p`Orientace kolektorového pole` }),
        sklon: new Pisatkova({ nazev: p`Sklon kolektorů` }),
        zasobnik: new Pisatkova({ nazev: p`Typ zásobníkového ohřívače` }),
        akumulacka: new Pisatkova({ nazev: p`Typ akumulační nádrže`, required: false }),
        vymenik: new Pisatkova({ nazev: p`Typ výměníku (deskový/trubkový)`, required: false }),
        solRegulator: new Pisatkova({ nazev: p`Typ solárního regulátoru` }),
        cerpadloaSkupina: new Pisatkova({ nazev: p`Typ čerpadlové skupiny` }),
        expanznkaSolarni: new Ano({ nazev: p`Expanzní nádoba (solární)`, required: true }),
        objem: new Pisatkova({ nazev: p`Objem` }),
        ovzdusneni: new Vybiratkova({ nazev: p`Pro odvzdušnění nainstalován`, moznosti: [p`odvzdušňovací ventil`, p`separátor vzduchu`, p`nic`] }),
        teplonosnaKapalina: new Vybiratkova({ nazev: p`Typ teplonosné kapaliny`, moznosti: [p`Solarten Super`, p`Solarten HT`, p`jiná`] }),
        potrubi: new Pisatkova({ nazev: p`Materiál/typ potrubí` }),
        prumer: new Pisatkova({ nazev: p`Průměr` }),
        delkyPotrubi: new Pisatkova({ nazev: p`Součet délek výstupního a vratného potrubí (mezi kolektory a zásobníkem / akumulační nádrží)` }),
        izolacePotrubi: new Zaskrtavatkova({ nazev: p`Potrubí bylo opatřeno izolací s teplotní odolností min. 160 °C` }),
    },
    uvadeni: {
        nadpis: new Nadpisova({ nazev: `commissioningSteps` }),
        tlakDoba: new Zaskrtavatkova({ nazev: p`Byla provedena tlaková zkouška těsnosti solárního systému o minimální délce trvání 2 hodiny` }),
        tlakTlak: new Zaskrtavatkova({ nazev: p`Tlaková zkouška byla provedena pod tlakem 5 bar / 0,5 MPa` }),
        tlakUbytek: new Zaskrtavatkova({ nazev: p`Úbytek tlaku nepřesáhl po 2 hodinách tlakové zkoušky 0,1 bar / 0,01 MPa` }),
        ovzdusneni: new Zaskrtavatkova({ nazev: p`Bylo provedeno dostatečné odvzdušnění celého systému a byl odvzdušňovací ventil po odvzdušnění uzavřen` }),
        blesk: new Zaskrtavatkova({ nazev: p`Byla provedena ochrana proti blesku` }),
        podminky: new Zaskrtavatkova(
            { nazev: p`Instalace a uvedení do provozu solárního systému byla provedena dle podmínek uvedených v návodu na montáž, připojení a obsluhu, instalačních podmínek a obecně platných norem` }),
        regulator: new Zaskrtavatkova({ nazev: p`Solární regulátor byl nastaven na předepsané parametry` }),
        vlastnik: new Zaskrtavatkova({ nazev: p`Vlastník nebo provozovatel byl seznámen se základní funkcí sol. systému a jeho obsluhou` }),
        date: new Pisatkova({ nazev: 'dateOfCommission', type: 'date', text: todayISO() }),
    },
});

export const solarCollectorCommission: FormInfo<UDSOL, UvedeniSOL> = ({
    storeName: 'stored_solar_collector_commission',
    defaultData: defaultUvedeniSOL,
    pdfLink: 'solarCollectorCommissionProtocol',
    saveData: (irid, raw) => uvestSOLDoProvozu(irid, raw),
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence }),
    title: () => `commissioning`,
});