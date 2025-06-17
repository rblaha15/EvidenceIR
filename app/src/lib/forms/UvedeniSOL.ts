import { type GetOrVal, TitleWidget, InputWidget, SwitchWidget, ChooserWidget, CheckboxWidget } from '../Widget.svelte';
import { todayISO } from '$lib/helpers/date';
import type { Form, Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import type { FormInfo } from './forms.svelte';
import { type P, p, plainArray } from '$lib/translations';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { derived, get } from 'svelte/store';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import db from '$lib/client/data';

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

export interface UvedeniSOL extends Form<UDSOL> {
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
        ovzdusneni: ChooserWidget<UDSOL, P<'odvzdušňovací ventil' | 'separátor vzduchu' | 'nic'>>,
        teplonosnaKapalina: ChooserWidget<UDSOL, P<'Solarten Super' | 'Solarten HT' | 'jiná'>>,
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
        nadpis: new TitleWidget({ text: `solarSystem` }),
        orientace: new InputWidget({ label: p('Orientace kolektorového pole') }),
        sklon: new InputWidget({ label: p('Sklon kolektorů') }),
        zasobnik: new InputWidget({ label: p('Typ zásobníkového ohřívače') }),
        akumulacka: new InputWidget({ label: p('Typ akumulační nádrže'), required: false }),
        vymenik: new InputWidget({ label: p('Typ výměníku (deskový/trubkový)'), required: false }),
        solRegulator: new InputWidget({ label: p('Typ solárního regulátoru') }),
        cerpadloaSkupina: new InputWidget({ label: p('Typ čerpadlové skupiny') }),
        expanznkaSolarni: new Ano({ label: p('Expanzní nádoba (solární)'), required: true }),
        objem: new InputWidget({ label: p('Objem') }),
        ovzdusneni: new ChooserWidget({ label: p('Pro odvzdušnění nainstalován'), options: plainArray(['odvzdušňovací ventil', 'separátor vzduchu', 'nic']) }),
        teplonosnaKapalina: new ChooserWidget({ label: p('Typ teplonosné kapaliny'), options: plainArray(['Solarten Super', 'Solarten HT', 'jiná']) }),
        potrubi: new InputWidget({ label: p('Materiál/typ potrubí') }),
        prumer: new InputWidget({ label: p('Průměr') }),
        delkyPotrubi: new InputWidget({ label: p('Součet délek výstupního a vratného potrubí') }),
        izolacePotrubi: new CheckboxWidget({ label: p('Potrubí bylo opatřeno izolací s teplotní odolností min. 160 °C') }),
    },
    uvadeni: {
        nadpis: new TitleWidget({ text: `commissioningSteps` }),
        tlakDoba: new CheckboxWidget({ label: p('Byla provedena tlaková zkouška těsnosti solárního systému o minimální délce trvání 2 hodiny') }),
        tlakTlak: new CheckboxWidget({ label: p('Tlaková zkouška byla provedena pod tlakem 5 bar / 0,5 MPa') }),
        tlakUbytek: new CheckboxWidget({ label: p('Úbytek tlaku nepřesáhl po 2 hodinách tlakové zkoušky 0,1 bar / 0,01 MPa') }),
        ovzdusneni: new CheckboxWidget({ label: p('Bylo provedeno dostatečné odvzdušnění celého systému a byl odvzdušňovací ventil po odvzdušnění uzavřen') }),
        blesk: new CheckboxWidget({ label: p('Byla provedena ochrana proti blesku') }),
        podminky: new CheckboxWidget(
            { label: p('Instalace a uvedení do provozu solárního systému byla provedena dle podmínek uvedených v návodu na montáž, připojení a obsluhu, instalačních podmínek a obecně platných norem') }),
        regulator: new CheckboxWidget({ label: p('Solární regulátor byl nastaven na předepsané parametry') }),
        vlastnik: new CheckboxWidget({ label: p('Vlastník nebo provozovatel byl seznámen se základní funkcí sol. systému a jeho obsluhou') }),
        date: new InputWidget({ label: 'dateOfCommission', type: 'date', text: todayISO() }),
    },
});

export const solarCollectorCommission: FormInfo<UDSOL, UvedeniSOL, [], 'UPS'> = ({
    storeName: 'stored_solar_collector_commission',
    defaultData: defaultUvedeniSOL,
    openPdf: () => ({
        link: 'UPS'
    }),
    saveData: async (irid, raw, _1, _2, editResult, t, _3, ir) => {
        await db.addSolarSystemCommissioningProtocol(irid, raw);
        if (await checkRegulusOrAdmin()) return

        const user = get(currentUser)!;
        const response = await sendEmail({
            ...defaultAddresses(),
            subject: `Vyplněno nové uvedení SOL do provozu k ${irName(ir.evidence.ir)}`,
            component: MailProtocol,
            props: { name: user.email!, origin: page.url.origin, id: irid },
        });

        if (response!.ok) return;
        editResult({
            text: t.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
            red: true,
            load: false
        });
        return false
    },
    showSaveAndSendButtonByDefault: derived(isUserRegulusOrAdmin, i => !i),
    createWidgetData: (evidence, uvedeni) => ({ uvedeni, evidence }),
    title: t => t.commissioning,
});