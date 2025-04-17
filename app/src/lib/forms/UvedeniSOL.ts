import { type GetOrVal, TitleWidget, p, InputWidget, SwitchWidget, ChooserWidget, CheckboxWidget } from '../Widget.svelte.js';
import { todayISO } from '$lib/helpers/date';
import type { Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import { uvestSOLDoProvozu } from '$lib/client/firestore';
import type { FormInfo } from './forms.svelte.js';

export type UDSOL = {
    uvedeni: UvedeniSOL,
    evidence: Raw<Data>,
}

export class Ano<D> extends SwitchWidget<D> {
    constructor(args: {
        label: GetOrVal<D>,
        onError?: GetOrVal<D>,
        required?: GetOrVal<D, boolean>,
        show?: GetOrVal<D, boolean>,
        chosen?: boolean,
    }) {
        super({
            chosen: args.chosen ?? false,
            required: args.required ?? false,
            ...args,
            options: [`no`, `yes`] as const,
            hasPositivity: true,
        });
    }
}

export type UvedeniSOL = {
    sol: {
        nadpis: TitleWidget<UDSOL>,
        orientace: InputWidget<UDSOL>,
        sklon: InputWidget<UDSOL>,
        zasobnik: InputWidget<UDSOL>,
        akumulacka: InputWidget<UDSOL>,
        vymenik: InputWidget<UDSOL>,
        solRegulator: InputWidget<UDSOL>,
        cerpadloaSkupina: InputWidget<UDSOL>,
        expanznkaSolarni: Ano<UDSOL>,
        objem: InputWidget<UDSOL>,
        ovzdusneni: ChooserWidget<UDSOL>,
        teplonosnaKapalina: ChooserWidget<UDSOL>,
        potrubi: InputWidget<UDSOL>,
        prumer: InputWidget<UDSOL>,
        delkyPotrubi: InputWidget<UDSOL>,
        izolacePotrubi: CheckboxWidget<UDSOL>,
    },
    uvadeni: {
        nadpis: TitleWidget<UDSOL>,
        tlakDoba: CheckboxWidget<UDSOL>,
        tlakTlak: CheckboxWidget<UDSOL>,
        tlakUbytek: CheckboxWidget<UDSOL>,
        ovzdusneni: CheckboxWidget<UDSOL>,
        blesk: CheckboxWidget<UDSOL>,
        podminky: CheckboxWidget<UDSOL>,
        regulator: CheckboxWidget<UDSOL>,
        vlastnik: CheckboxWidget<UDSOL>,
        date: InputWidget<UDSOL>,
    },
}

const defaultUvedeniSOL = (): UvedeniSOL => ({
    sol: {
        nadpis: new TitleWidget({ label: `solarSystem` }),
        orientace: new InputWidget({ label: p`Orientace kolektorového pole` }),
        sklon: new InputWidget({ label: p`Sklon kolektorů` }),
        zasobnik: new InputWidget({ label: p`Typ zásobníkového ohřívače` }),
        akumulacka: new InputWidget({ label: p`Typ akumulační nádrže`, required: false }),
        vymenik: new InputWidget({ label: p`Typ výměníku (deskový/trubkový)`, required: false }),
        solRegulator: new InputWidget({ label: p`Typ solárního regulátoru` }),
        cerpadloaSkupina: new InputWidget({ label: p`Typ čerpadlové skupiny` }),
        expanznkaSolarni: new Ano({ label: p`Expanzní nádoba (solární)`, required: true }),
        objem: new InputWidget({ label: p`Objem` }),
        ovzdusneni: new ChooserWidget({ label: p`Pro odvzdušnění nainstalován`, options: [p`odvzdušňovací ventil`, p`separátor vzduchu`, p`nic`] }),
        teplonosnaKapalina: new ChooserWidget({ label: p`Typ teplonosné kapaliny`, options: [p`Solarten Super`, p`Solarten HT`, p`jiná`] }),
        potrubi: new InputWidget({ label: p`Materiál/typ potrubí` }),
        prumer: new InputWidget({ label: p`Průměr` }),
        delkyPotrubi: new InputWidget({ label: p`Součet délek výstupního a vratného potrubí (mezi kolektory a zásobníkem / akumulační nádrží)` }),
        izolacePotrubi: new CheckboxWidget({ label: p`Potrubí bylo opatřeno izolací s teplotní odolností min. 160 °C` }),
    },
    uvadeni: {
        nadpis: new TitleWidget({ label: `commissioningSteps` }),
        tlakDoba: new CheckboxWidget({ label: p`Byla provedena tlaková zkouška těsnosti solárního systému o minimální délce trvání 2 hodiny` }),
        tlakTlak: new CheckboxWidget({ label: p`Tlaková zkouška byla provedena pod tlakem 5 bar / 0,5 MPa` }),
        tlakUbytek: new CheckboxWidget({ label: p`Úbytek tlaku nepřesáhl po 2 hodinách tlakové zkoušky 0,1 bar / 0,01 MPa` }),
        ovzdusneni: new CheckboxWidget({ label: p`Bylo provedeno dostatečné odvzdušnění celého systému a byl odvzdušňovací ventil po odvzdušnění uzavřen` }),
        blesk: new CheckboxWidget({ label: p`Byla provedena ochrana proti blesku` }),
        podminky: new CheckboxWidget(
            { label: p`Instalace a uvedení do provozu solárního systému byla provedena dle podmínek uvedených v návodu na montáž, připojení a obsluhu, instalačních podmínek a obecně platných norem` }),
        regulator: new CheckboxWidget({ label: p`Solární regulátor byl nastaven na předepsané parametry` }),
        vlastnik: new CheckboxWidget({ label: p`Vlastník nebo provozovatel byl seznámen se základní funkcí sol. systému a jeho obsluhou` }),
        date: new InputWidget({ label: 'dateOfCommission', type: 'date', text: todayISO() }),
    },
});

export const solarCollectorCommission: FormInfo<UDSOL, UvedeniSOL> = ({
    storeName: 'stored_solar_collector_commission',
    defaultData: defaultUvedeniSOL,
    pdfLink: () => 'solarCollectorCommissionProtocol',
    saveData: (irid, raw) => uvestSOLDoProvozu(irid, raw),
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence }),
    title: t => t.commissioning,
});