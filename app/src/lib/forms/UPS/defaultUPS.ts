import { CheckboxWidget, ChooserWidget, type GetOrVal, InputWidget, SwitchWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import { p, plainArray } from '$lib/translations';
import { todayISO } from '$lib/helpers/date';
import { type FormUPS } from '$lib/forms/UPS/formUPS';

const newYesNoWidget = <D>(args: {
    label: GetOrVal<D>,
    onError?: GetOrVal<D>,
    required?: GetOrVal<D, boolean>,
    show?: GetOrVal<D, boolean>,
    chosen?: boolean,
}) => new SwitchWidget({
    chosen: args.chosen ?? false,
    required: args.required ?? false,
    ...args,
    options: [`no`, `yes`] as const,
    hasPositivity: true,
});

export default (): FormUPS => ({
    sol: {
        nadpis: new TitleWidget({ text: `solarSystem` }),
        orientace: new InputWidget({ label: p('Orientace kolektorového pole') }),
        sklon: new InputWidget({ label: p('Sklon kolektorů') }),
        zasobnik: new InputWidget({ label: p('Typ zásobníkového ohřívače') }),
        akumulacka: new InputWidget({ label: p('Typ akumulační nádrže'), required: false }),
        vymenik: new InputWidget({ label: p('Typ výměníku (deskový/trubkový)'), required: false }),
        solRegulator: new InputWidget({ label: p('Typ solárního regulátoru') }),
        cerpadloaSkupina: new InputWidget({ label: p('Typ čerpadlové skupiny') }),
        expanznkaSolarni: newYesNoWidget({ label: p('Expanzní nádoba (solární)'), required: true }),
        objem: new InputWidget({ label: p('Objem') }),
        ovzdusneni: new ChooserWidget({
            label: p('Pro odvzdušnění nainstalován'),
            options: plainArray(['odvzdušňovací ventil', 'separátor vzduchu', 'nic']),
        }),
        teplonosnaKapalina: new ChooserWidget({
            label: p('Typ teplonosné kapaliny'),
            options: plainArray(['Solarten Super', 'Solarten HT', 'jiná']),
        }),
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