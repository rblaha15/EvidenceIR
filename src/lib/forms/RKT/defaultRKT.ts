import { CheckboxWidget, CounterWidget, InputWidget, TextWidget, TitleWidget } from '$lib/forms/Widget.svelte.js';
import type { DataRKT, FormRKT } from '$lib/forms/RKT/formRKT.js';
import type { FormPlus } from '$lib/forms/Form';

export default (y: number, done: number[]): FormPlus<FormRKT> => ({
    info: {
        osoba: new InputWidget({ label: t => t.rkt.performingPerson }),
        datum: new InputWidget({ label: t => t.rkt.checkDate, type: 'date' }),
        year: new CounterWidget<DataRKT, true>({
            label: t => t.rkt.checkYear, min: 1, chosen: y, max: Number.POSITIVE_INFINITY, hideInRawData: true,
            validate: v => !done.includes(v), onError: t => t.rkt.yearAlreadyFilled,
        })
    },
    kontrolaTepelnehoCerpadla: {
        _nadpis: new TitleWidget({ text: t => t.rkt.kontrolaTepelnehoCerpadla, level: 2 }),
        kontrolaVenkovniJednotky: new CheckboxWidget({ label: t => t.rkt.kontrolaVenkovniJednotky, required: false, descriptionItems: t => [t.rkt.kontrolaStavuVzduchovychCest, t.rkt.kontrolaOdtokuKondenzatu] }),
        kontrolaElektrickeCasti: new CheckboxWidget({ label: t => t.rkt.kontrolaElektrickeCasti, required: false, descriptionItems: t => [t.rkt.kontrolaDotazeniSpoju, t.rkt.optickaKontrolaDesky] }),
        kontrolaChladivoveCasti: new CheckboxWidget({ label: t => t.rkt.kontrolaChladivoveCasti, required: false, descriptionItems: t => [t.rkt.kontrolaChoduKompresoru, t.rkt.vizualniKontrolaChladivovehoOkruhu, t.rkt.kontrolaStavuPotrubi] }),
    },
    kontrolaPrimarnihoOkruhu: {
        _nadpis: new TitleWidget({ text: t => t.rkt.kontrolaPrimarnihoOkruhu, level: 2 }),
        kontrola: new CheckboxWidget({ label: '', required: false, descriptionItems: t => [t.rkt.kontrolaMrazuvzdornostiKapalinyPrimarnihoOkruhu, t.rkt.kontrolaTlakuMnozstviKapalinyPrimarnihoOkruhu] }),
    },
    kontrolaRegulace: {
        _nadpis: new TitleWidget({ text: t => t.rkt.kontrolaRegulace, level: 2 }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: new CheckboxWidget({ label: t => t.rkt.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin, required: false }),
        celkoveProvozniHodinyKompresoru: new InputWidget({ label: t => t.rkt.celkoveProvozniHodinyKompresoru, required: false, inputmode: 'numeric' }),
        provozniHodinyKompresoruDoTepleVody: new InputWidget({ label: t => t.rkt.provozniHodinyKompresoruDoTepleVody, required: false, inputmode: 'numeric' }),
        celkovyPocetStartuKompresoru: new InputWidget({ label: t => t.rkt.celkovyPocetStartuKompresoru, required: false, inputmode: 'numeric' }),
        pocetStartuKompresoruDoTepleVody: new InputWidget({ label: t => t.rkt.pocetStartuKompresoruDoTepleVody, required: false, inputmode: 'numeric' }),
        celkoveProvozniHodinyDoplnkovehoZdroje: new InputWidget({ label: t => t.rkt.celkoveProvozniHodinyDoplnkovehoZdroje, required: false, inputmode: 'numeric' }),
        celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody: new InputWidget({ label: t => t.rkt.celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody, required: false, inputmode: 'numeric' }),
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: new InputWidget({ label: t => t.rkt.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly, required: false, inputmode: 'numeric', show: false, suffix: t => t.units.min }),
        prumernaDobaChoduKompresoruDoTepleVodyMinOdPosledniKontroly: new InputWidget({ label: t => t.rkt.prumernaDobaChoduKompresoruDoTepleVodyMinOdPosledniKontroly, required: false, inputmode: 'numeric', show: false, suffix: t => t.units.min }),
    },
    kontrolaElektroinstalaceKomponentRegulus: {
        _nadpis: new TitleWidget({ text: t => t.rkt.kontrolaElektroinstalaceKomponentRegulus, level: 2 }),
        kontrolaDotazeniSvorkovychSpoju: new CheckboxWidget({ label: t => t.rkt.kontrolaDotazeniSvorkovychSpoju, required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaci: new CheckboxWidget({ label: t => t.rkt.vizualniKontrolaVsechPristupnychVodicuVInstalaci, required: false }),
    },
    kontrolaOtopneSoustavy: {
        _nadpis: new TitleWidget({ text: t => t.rkt.kontrolaOtopneSoustavy, level: 2 }),
        vycisteniFiltruInstalaceTepelnehoCerpadla: new CheckboxWidget({ label: t => t.rkt.vycisteniFiltruInstalaceTepelnehoCerpadla, required: false }),
        kontrolaTesnostiOtopneSoustavy: new CheckboxWidget({ label: t => t.rkt.kontrolaTesnostiOtopneSoustavy, required: false }),
        kontrolaPojistovacichVentilu: new CheckboxWidget({ label: t => t.rkt.kontrolaPojistovacichVentilu, required: false }),
        kontrolaPojistovacichVentiluPoznamka: new InputWidget({ label: '', required: false, textArea: true, placeholder: t => t.rkt.kontrolaPojistovacichVentiluPoznamka }),
        _kontrolaTlakuVOtopneSoustaveNadpis: new TextWidget({ text: t => t.rkt.kontrolaTlakuVOtopneSoustave, class: 'fs-5' }),
        kontrolaTlakuVOtopneSoustavePriUPT: new InputWidget({ label: t => t.rkt.tlakPriUvadeniDoProvozu, required: false, inputmode: 'numeric', suffix: t => t.units.bar, lock: true, hideInRawData: true }),
        kontrolaTlakuVOtopneSoustave: new InputWidget({ label: t => t.rkt.tlakPriKontrole, required: false, inputmode: 'numeric', suffix: t => t.units.bar }),
    },
    kontrolaTlakuExpanznichNadob: {
        _nadpis: new TitleWidget({ text: t => t.rkt.kontrolaTlakuExpanznichNadob, level: 2 }),
        _podnadpis: new TextWidget({ text: t => t.rkt.nelzeliProvestUvedteDuvod }),
        _expanzniNadobaOtopneSoustavyNadpis: new TextWidget({ text: t => t.rkt.expanzniNadobaOtopneSoustavy, class: 'fs-5' }),
        expanzniNadobaOtopneSoustavyPriUPT: new InputWidget({ label: t => t.rkt.tlakPriUvadeniDoProvozu, required: false, inputmode: 'numeric', suffix: t => t.units.bar, lock: true, hideInRawData: true }),
        expanzniNadobaOtopneSoustavy: new InputWidget({ label: t => t.rkt.tlakVzduchuNastavenyPriKontrole, required: false, inputmode: 'numeric', suffix: t => t.units.bar }),
        _expanzniNadobaPitneVodyNadpis: new TextWidget({ text: t => t.rkt.expanzniNadobaPitneVody, class: 'fs-5' }),
        expanzniNadobaPitneVodyPriUPT: new InputWidget({ label: t => t.rkt.tlakPriUvadeniDoProvozu, required: false, inputmode: 'numeric', suffix: t => t.units.bar, lock: true, hideInRawData: true }),
        expanzniNadobaPitneVody: new InputWidget({ label: t => t.rkt.tlakVzduchuNastavenyPriKontrole, required: false, inputmode: 'numeric', suffix: t => t.units.bar }),
    },
    funkcniTest: {
        _nadpis: new TitleWidget({ text: t => t.rkt.funkcniTest, level: 2 }),
        provozniZkouska: new CheckboxWidget({ label: t => t.rkt.provozniZkouska, required: false, descriptionItems: t => [t.rkt.kontrolaVseho] }),
    },
    poznamky: {
        poznamka: new InputWidget({
            label: t => t.rkt.note, required: false,
        }),
    },
});