import type { FormInfo } from '$lib/forms/forms.svelte.js';
import { pridatKontrolu } from '$lib/client/firestore';
import { CheckboxWidget, InputWidget, TitleWidget } from '$lib/Widget.svelte.js';
import { dataToRawData, type Form } from '$lib/forms/Form';
import { todayISO } from '$lib/helpers/date';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import { irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { derived, get } from 'svelte/store';
import { checkRegulusOrAdmin, currentUser, isUserRegulusOrAdmin } from '$lib/client/auth';
import { browser } from '$app/environment';

export type Rok = number

export interface Kontrola extends Form<Rok> {
    info: {
        osoba: InputWidget<Rok>,
        datum: InputWidget<Rok>,
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: TitleWidget<Rok>,
        kontrolaChoduKompresoru: CheckboxWidget<Rok>,
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: CheckboxWidget<Rok>,
        kontrolaOdvoduKondenzatu: CheckboxWidget<Rok>,
        kontrolaUchyceniVentilatoru: CheckboxWidget<Rok>,
        vycisteniVzduchovychCestJednotky: CheckboxWidget<Rok>,
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: CheckboxWidget<Rok>,
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: CheckboxWidget<Rok>,
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: CheckboxWidget<Rok>,
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: CheckboxWidget<Rok>,
    },
    kontrolniUkonyRegulace: {
        nadpis: TitleWidget<Rok>,
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: CheckboxWidget<Rok>,
        kontrolaNastaveniParametruRegulatoru: CheckboxWidget<Rok>,
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: CheckboxWidget<Rok>,
        stavPocitadlaCelkovychProvoznichHodinKompresoru: InputWidget<Rok>
        stavPocitadlaProvoznichHodinDoTvUmoznujeLiToRegulace: InputWidget<Rok>
        stavCelkovehoPoctuStartuTepCerpadlaUmoznujeLiToRegulace: InputWidget<Rok>
        stavPoctuStartuTepelCerpadlaDoTvUmoznujeLiToRegulace: InputWidget<Rok>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdroje: InputWidget<Rok>
        stavPocitadlaCelkovychProvoznichHodinDoplnkovehoZdrojeTv: InputWidget<Rok>
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: InputWidget<Rok>
        prumernaDobaChoduKompresoruDoTvMinOdPosledniKontroly: InputWidget<Rok>
    },
    kontrolniElektroinstalace: {
        nadpis: TitleWidget<Rok>,
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: CheckboxWidget<Rok>,
        kontrolaDotazeniSvorkovychSpoju: CheckboxWidget<Rok>,
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: CheckboxWidget<Rok>,
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: CheckboxWidget<Rok>,
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: TitleWidget<Rok>,
        kontrolaFunkceObehovychCerpadel: CheckboxWidget<Rok>,
        vycisteniFiltruObehovychCerpadel: CheckboxWidget<Rok>,
        odvzdusneniZdrojeTc: CheckboxWidget<Rok>,
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: CheckboxWidget<Rok>,
        kontrolaTesnostiOtopneSoustavy: CheckboxWidget<Rok>,
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: CheckboxWidget<Rok>,
        nastavenyTlakPriUvadeniDoProvozu: InputWidget<Rok>
        pripadneProvedteKontroluTlakuVOtopneSoustave: CheckboxWidget<Rok>,
        nastavenyTlakPriUvadeniDoProvozu2: InputWidget<Rok>
    },
    kontrolaZasobnikuTv: {
        nadpis: TitleWidget<Rok>,
        kontrolaMgAnodyVZasobnikuPripVymena: CheckboxWidget<Rok>,
        kontrolaPojistovacihoVentilu: CheckboxWidget<Rok>,
        pripadneProvedteKontroluTlakuVEnTepleVody: CheckboxWidget<Rok>,
        nastavenyTlakPriUvadeniDoProvozu: InputWidget<Rok>
    },
    poznamky: {
        poznamka: InputWidget<Rok>,
    },
}

export const defaultKontrola = (): Kontrola => ({
    info: {
        osoba: new InputWidget({ label: 'performingPerson' }),
        datum: new InputWidget({ label: 'checkDate', type: 'date' }),
    },
    kontrolniUkonyTepelnehoCerpadla: {
        nadpis: new TitleWidget({ text: 'check.kontrolniUkonyTepelnehoCerpadla' }),
        kontrolaChoduKompresoru: new CheckboxWidget({ label: 'check.kontrolaChoduKompresoru', required: false }),
        optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu: new CheckboxWidget(
            { label: 'check.optickaKontrolaTesnostiTrubkovychSpojuJednotkyAChladivovehoOkruhu', required: false }),
        kontrolaOdvoduKondenzatu: new CheckboxWidget({ label: 'check.kontrolaOdvoduKondenzatu', required: false }),
        kontrolaUchyceniVentilatoru: new CheckboxWidget({ label: 'check.kontrolaUchyceniVentilatoru', required: false }),
        vycisteniVzduchovychCestJednotky: new CheckboxWidget({ label: 'check.vycisteniVzduchovychCestJednotky', required: false }),
        kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem: new CheckboxWidget(
            { label: 'check.kontrolaLamelVyparnikuPripadneOdstraneniNecistotVzduchem', required: false }),
        proveritZdaNicNebraniOptimalniCirkulaciVzduchu: new CheckboxWidget(
            { label: 'check.proveritZdaNicNebraniOptimalniCirkulaciVzduchu', required: false }),
        kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu: new CheckboxWidget(
            { label: 'check.kontrolaTeplotnihoRozdiluTepelnehoCerpadlaDleNavodu', required: false }),
        kontrolaElektrickeCastiJednotkyTepelnehoCerpadla: new CheckboxWidget(
            { label: 'check.kontrolaElektrickeCastiJednotkyTepelnehoCerpadla', required: false }),
    },
    kontrolniUkonyRegulace: {
        nadpis: new TitleWidget({ text: 'check.kontrolniUkonyRegulace' }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: new CheckboxWidget(
            { label: 'check.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin', required: false }),
        kontrolaNastaveniParametruRegulatoru: new CheckboxWidget({ label: 'check.kontrolaNastaveniParametruRegulatoru', required: false }),
        preventivniProskoleniObsluhyZHlediskaUzivatelskehoNastaveni: new CheckboxWidget(
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
        nadpis: new TitleWidget({ text: 'check.kontrolniElektroinstalace' }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: new CheckboxWidget(
            { label: 'check.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace', required: false }),
        kontrolaDotazeniSvorkovychSpoju: new CheckboxWidget({ label: 'check.kontrolaDotazeniSvorkovychSpoju', required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: new CheckboxWidget(
            { label: 'check.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni', required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: new CheckboxWidget(
            { label: 'check.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele', required: false }),
    },
    kontrolniUkonyOtopneSoustavy: {
        nadpis: new TitleWidget({ text: 'check.kontrolniUkonyOtopneSoustavy' }),
        kontrolaFunkceObehovychCerpadel: new CheckboxWidget({ label: 'check.kontrolaFunkceObehovychCerpadel', required: false }),
        vycisteniFiltruObehovychCerpadel: new CheckboxWidget({ label: 'check.vycisteniFiltruObehovychCerpadel', required: false }),
        odvzdusneniZdrojeTc: new CheckboxWidget({ label: 'check.odvzdusneniZdrojeTc', required: false }),
        kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych: new CheckboxWidget(
            { label: 'check.kontrolaFunkceVsechMotorickychVentiluSmesovaciZonovych', required: false }),
        kontrolaTesnostiOtopneSoustavy: new CheckboxWidget({ label: 'check.kontrolaTesnostiOtopneSoustavy', required: false }),
        kontrolaTlakuVExpanzniNadobeOtopneSoustavy: new CheckboxWidget({ label: 'check.kontrolaTlakuVExpanzniNadobeOtopneSoustavy', required: false }),
        nastavenyTlakPriUvadeniDoProvozu: new InputWidget({ label: 'check.nastavenyTlakPriUvadeniDoProvozu', required: false, lock: rok => rok != 1 }),
        pripadneProvedteKontroluTlakuVOtopneSoustave: new CheckboxWidget(
            { label: 'check.pripadneProvedteKontroluTlakuVOtopneSoustave', required: false }),
        nastavenyTlakPriUvadeniDoProvozu2: new InputWidget({ label: 'check.nastavenyTlakPriUvadeniDoProvozu', required: false, lock: rok => rok != 1 }),
    },
    kontrolaZasobnikuTv: {
        nadpis: new TitleWidget({ text: 'check.kontrolaZasobnikuTv' }),
        kontrolaMgAnodyVZasobnikuPripVymena: new CheckboxWidget({ label: 'check.kontrolaMgAnodyVZasobnikuPripVymena', required: false }),
        kontrolaPojistovacihoVentilu: new CheckboxWidget({ label: 'check.kontrolaPojistovacihoVentilu', required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: new CheckboxWidget({ label: 'check.pripadneProvedteKontroluTlakuVEnTepleVody', required: false }),
        nastavenyTlakPriUvadeniDoProvozu: new InputWidget({ label: 'check.nastavenyTlakPriUvadeniDoProvozu', required: false, lock: rok => rok != 1 }),
    },
    poznamky: {
        poznamka: new InputWidget({ label: 'note', required: false }),
    },
});

export const check = (() => {
    let rok = $state() as number;
    const tc = $derived(!browser ? 1
        : page.url.searchParams.get('tc')?.let(Number) ?? 1) as 1 | 2 | 3 | 4;

    const info: FormInfo<Rok, Kontrola> = {
        storeName: 'stored_check',
        defaultData: defaultKontrola,
        pdfLink: () => `check-${tc}`,
        getEditData: ir => {
            const kontroly = ir.kontrolyTC[tc] ?? {};
            rok = kontroly?.[1] == undefined ? 1
                : Math.max(...kontroly.keys().map(Number)) + 1;
            if (rok != 1) {
                const predchoziKontrola = kontroly[rok - 1 as 1 | 2 | 3]!;
                const data = dataToRawData(defaultKontrola());
                data.poznamky.poznamka = predchoziKontrola.poznamky.poznamka;
                data.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu = predchoziKontrola.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu;
                data.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu2 = predchoziKontrola.kontrolniUkonyOtopneSoustavy.nastavenyTlakPriUvadeniDoProvozu2;
                data.kontrolaZasobnikuTv.nastavenyTlakPriUvadeniDoProvozu = predchoziKontrola.kontrolaZasobnikuTv.nastavenyTlakPriUvadeniDoProvozu;
                return data;
            } else return undefined;
        },
        saveData: async (irid, raw, _1, _2, editResult, t, _3, ir) => {
            await pridatKontrolu(irid, rok, raw);
            if (await checkRegulusOrAdmin()) return;

            const user = get(currentUser)!;
            const response = await sendEmail({
                ...defaultAddresses(),
                subject: `Vyplněna nová roční kontrola TČ k ${irName(ir.evidence.ir)}`,
                component: MailProtocol,
                props: { name: user.email!, origin: page.url.origin, irid_spid: irid },
            });

            if (response!.ok) return;
            editResult({
                text: t.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
                red: true,
                load: false,
            });
            return false;
        },
        showSaveAndSendButtonByDefault: derived(isUserRegulusOrAdmin, i => !i),
        title: t => t.yearlyHPCheckNr([`${tc}`]),
        createWidgetData: () => rok,
        subtitle: t => `${t.year}: ${rok.toString() ?? '…'}`,
        onMount: async (d, k) => {
            if (!k.info.datum.value)
                k.info.datum.setValue(d, todayISO());
        },
    };
    return info;
})();