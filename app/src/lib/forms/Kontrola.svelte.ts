import type { FormInfo } from '$lib/forms/forms.svelte.js';
import { type IR, pridatKontrolu } from '$lib/client/firestore';
import { TitleWidget, p, InputWidget, CheckboxWidget } from '$lib/Vec.svelte.js';
import { dataToRawData, type Raw } from '$lib/forms/Form';
import type { Data } from '$lib/forms/Data';
import { todayISO } from '$lib/helpers/date';

export type UDKO = {
    evidence: Raw<Data>,
    kontrola: Kontrola,
    rok: number,
}

export type Kontrola = {
    info: {
        osoba: InputWidget<UDKO>,
        datum: InputWidget<UDKO>,
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: TitleWidget<UDKO>,
        kontrolaChoduKompresoru: CheckboxWidget<UDKO>,
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: CheckboxWidget<UDKO>,
        kontrolaOdvoduKondenzatu: CheckboxWidget<UDKO>,
        kontrolaUchyceniVentilatoru: CheckboxWidget<UDKO>,
        vycisteniVzduchovychCestJednotky: CheckboxWidget<UDKO>,
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: CheckboxWidget<UDKO>,
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: CheckboxWidget<UDKO>,
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: CheckboxWidget<UDKO>,
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: CheckboxWidget<UDKO>,
    },
    kontrolniUkonyRegulace: {
        nadpis: TitleWidget<UDKO>,
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: CheckboxWidget<UDKO>,
        kontrolaNastaveniParametruRegulatoru: CheckboxWidget<UDKO>,
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: CheckboxWidget<UDKO>,
        stavPocitadlaCelkovychProvoznichHodinKompresoru: InputWidget<UDKO>
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: InputWidget<UDKO>
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: InputWidget<UDKO>
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: InputWidget<UDKO>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: InputWidget<UDKO>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: InputWidget<UDKO>
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: InputWidget<UDKO>
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: InputWidget<UDKO>
    },
    kontrolniElektroinstalace: {
        nadpis: TitleWidget<UDKO>,
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: CheckboxWidget<UDKO>,
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<UDKO>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: CheckboxWidget<UDKO>,
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: CheckboxWidget<UDKO>,
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: TitleWidget<UDKO>,
        kontrolaFunkceObehovychCerpadel: CheckboxWidget<UDKO>,
        vycisteniFiltruObehovychCerpadel: CheckboxWidget<UDKO>,
        odvzdusneniZdrojeTc: CheckboxWidget<UDKO>,
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: CheckboxWidget<UDKO>,
        kontrolaTesnostiOtopneSoustavy: CheckboxWidget<UDKO>,
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: CheckboxWidget<UDKO>,
        nastavenyTlakPriUvadeniDoProvozu: InputWidget<UDKO>
        pripadneProvedteKontroluTlakuVOtopneSoustave: CheckboxWidget<UDKO>,
        nastavenyTlakPriUvadeniDoProvozu2: InputWidget<UDKO>
    },
    kontrolaZasobnikuTv: {
        nadpis: TitleWidget<UDKO>,
        kontrolaMgAnodyVZasobnikuPripVymena: CheckboxWidget<UDKO>,
        kontrolaPojistovacihoVentilu: CheckboxWidget<UDKO>,
        pripadneProvedteKontroluTlakuVEnTepleVody: CheckboxWidget<UDKO>,
        nastavenyTlakPriUvadeniDoProvozu: InputWidget<UDKO>
    },
    poznamky: {
        poznamka: InputWidget<UDKO>,
    },
}

export const defaultKontrola = (): Kontrola => ({
    info: {
        osoba: new InputWidget<UDKO>({ label: 'performingPerson' }),
        datum: new InputWidget<UDKO>({ label: 'checkDate', type: 'date' }),
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: new TitleWidget({ label: 'check.kontrolniUkonyTepelnehoCerpadla' }),
        kontrolaChoduKompresoru: new CheckboxWidget<UDKO>({ label: 'check.kontrolaChoduKompresoru', required: false }),
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: new CheckboxWidget<UDKO>(
            { label: 'check.optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu', required: false }),
        kontrolaOdvoduKondenzatu: new CheckboxWidget<UDKO>({ label: 'check.kontrolaOdvoduKondenzatu', required: false }),
        kontrolaUchyceniVentilatoru: new CheckboxWidget<UDKO>({ label: 'check.kontrolaUchyceniVentilatoru', required: false }),
        vycisteniVzduchovychCestJednotky: new CheckboxWidget<UDKO>({ label: 'check.vycisteniVzduchovychCestJednotky', required: false }),
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: new CheckboxWidget<UDKO>(
            { label: 'check.kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem', required: false }),
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: new CheckboxWidget<UDKO>(
            { label: 'check.proveritZdaNicNebraniOptimalniCirkulaciVzduchu', required: false }),
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: new CheckboxWidget<UDKO>(
            { label: 'check.kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu', required: false }),
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: new CheckboxWidget<UDKO>(
            { label: 'check.kontrolaElektrickeCastiJednotkyTepelnehoCerpadla', required: false }),
    },
    kontrolniUkonyRegulace: {
        nadpis: new TitleWidget({ label: 'check.kontrolniUkonyRegulace' }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: new CheckboxWidget<UDKO>(
            { label: 'check.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin', required: false }),
        kontrolaNastaveniParametruRegulatoru: new CheckboxWidget<UDKO>({ label: 'check.kontrolaNastaveniParametruRegulatoru', required: false }),
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: new CheckboxWidget<UDKO>(
            { label: 'check.preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni', required: false }),
        stavPocitadlaCelkovychProvoznichHodinKompresoru: new InputWidget({ label: 'check.stavPocitadlaCelkovychProvoznichHodinKompresoru', required: false }),
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: 'check.stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace', required: false }),
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: new InputWidget(
            { label: 'check.stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace', required: false }),
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: new InputWidget(
            { label: 'check.stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace', required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: new InputWidget(
            { label: 'check.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje', required: false }),
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: new InputWidget(
            { label: 'check.stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv', required: false }),
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: new InputWidget(
            { label: 'check.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly', required: false }),
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: new InputWidget(
            { label: 'check.prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly', required: false }),
    },
    kontrolniElektroinstalace: {
        nadpis: new TitleWidget({ label: 'check.kontrolniElektroinstalace' }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: new CheckboxWidget<UDKO>(
            { label: 'check.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace', required: false }),
        kontrolaDotazeniSvorkovychSpoju: new CheckboxWidget<UDKO>({ label: 'check.kontrolaDotazeniSvorkovychSpoju', required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: new CheckboxWidget<UDKO>(
            { label: 'check.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni', required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: new CheckboxWidget<UDKO>(
            { label: 'check.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele', required: false }),
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: new TitleWidget({ label: 'check.kontrolniUkonyOtopneSoustavy' }),
        kontrolaFunkceObehovychCerpadel: new CheckboxWidget<UDKO>({ label: 'check.kontrolaFunkceObehovychCerpadel', required: false }),
        vycisteniFiltruObehovychCerpadel: new CheckboxWidget<UDKO>({ label: 'check.vycisteniFiltruObehovychCerpadel', required: false }),
        odvzdusneniZdrojeTc: new CheckboxWidget<UDKO>({ label: 'check.odvzdusneniZdrojeTc', required: false }),
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: new CheckboxWidget<UDKO>(
            { label: 'check.kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych', required: false }),
        kontrolaTesnostiOtopneSoustavy: new CheckboxWidget<UDKO>({ label: 'check.kontrolaTesnostiOtopneSoustavy', required: false }),
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: new CheckboxWidget<UDKO>({ label: 'check.kontrolaTlakuVExpanzniNadobeOtopneSoustavy', required: false }),
        nastavenyTlakPriUvadeniDoProvozu: new InputWidget({ label: 'check.nastavenyTlakPriUvadeniDoProvozu', required: false, lock: ({ rok }) => rok != 1 }),
        pripadneProvedteKontroluTlakuVOtopneSoustave: new CheckboxWidget<UDKO>(
            { label: 'check.pripadneProvedteKontroluTlakuVOtopneSoustave', required: false }),
        nastavenyTlakPriUvadeniDoProvozu2: new InputWidget({ label: 'check.nastavenyTlakPriUvadeniDoProvozu', required: false, lock: ({ rok }) => rok != 1 }),
    },
    kontrolaZasobnikuTv: {
        nadpis: new TitleWidget({ label: 'check.kontrolaZasobnikuTv' }),
        kontrolaMgAnodyVZasobnikuPripVymena: new CheckboxWidget<UDKO>({ label: 'check.kontrolaMgAnodyVZasobnikuPripVymena', required: false }),
        kontrolaPojistovacihoVentilu: new CheckboxWidget<UDKO>({ label: 'check.kontrolaPojistovacihoVentilu', required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: new CheckboxWidget<UDKO>({ label: 'check.pripadneProvedteKontroluTlakuVEnTepleVody', required: false }),
        nastavenyTlakPriUvadeniDoProvozu: new InputWidget({ label: 'check.nastavenyTlakPriUvadeniDoProvozu', required: false, lock: ({ rok }) => rok != 1 }),
    },
    poznamky: {
        poznamka: new InputWidget<UDKO>({ label: 'note', required: false }),
    }
});

const posledniKontrola = (ir: IR): number => {
    const kontroly = ir.kontroly as Record<number, Kontrola | undefined> | undefined;
    if (kontroly?.[1] == undefined) return 0;
    return Math.max(...kontroly.keys().map((it) => Number(it)));
};

export const check = (() => {
    let rok = $state() as number;

    const info: FormInfo<UDKO, Kontrola> = {
        storeName: 'stored_check',
        defaultData: defaultKontrola,
        pdfLink: 'check',
        getEditData: ir => {
            rok = posledniKontrola(ir) + 1;
            if (rok != 1) {
                const kontroly = ir.kontroly as Record<number, Raw<Kontrola> | undefined>;
                const predchoziKontrola = kontroly[rok - 1]!;
                const data = dataToRawData(defaultKontrola());
                data.poznamky.poznamka = predchoziKontrola.poznamky.poznamka;
                data.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu = predchoziKontrola.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu;
                data.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu2 = predchoziKontrola.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu2;
                data.kontrolaZasobnikuTv.nastavenyTlakPriUvadeniDoProvozu = predchoziKontrola.kontrolaZasobnikuTv.nastavenyTlakPriUvadeniDoProvozu;
                return data;
            } else return undefined;
        },
        saveData: (irid, raw) => pridatKontrolu(irid, rok, raw),
        createWidgetData: (evidence, kontrola) => ({ evidence, kontrola, rok }),
        title: () => 'yearlyHPCheck',
        subtitle: (_, t) => p`${t.year}: ${rok.toString() ?? '…'}`,
        onMount: async k => {
            if (!k.info.datum.value)
                k.info.datum.value = todayISO();
        },
    };
    return info;
})();