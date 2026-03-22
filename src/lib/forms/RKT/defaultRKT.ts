import type { ContextRKT, FormRKT } from '$lib/forms/RKT/formRKT.js';
import type { FormPlus } from '$lib/forms/Form';
import { dayISO } from '$lib/helpers/date';
import { newCheckboxWidget, newCounterWidget, newInputWidget, newTextWidget, newTitleWidget } from '$lib/forms/Widget';

const gtw = (c: ContextRKT) => c.IN.tc.typ == 'groundToWater'
const atw = (c: ContextRKT) => c.IN.tc.typ == 'airToWater'

export default (y: number, done: number[]): FormPlus<FormRKT> => ({
    info: {
        osoba: newInputWidget({ label: t => t.rkt.performingPerson }),
        datum: newInputWidget({ label: t => t.rkt.checkDate, type: 'date', text: dayISO() }),
        year: newCounterWidget<ContextRKT, true>({
            label: t => t.rkt.checkYear, min: 1, chosen: y, max: Number.POSITIVE_INFINITY, hideInRawData: true,
            validate: (v, d) => d.mode != 'create' || !done.includes(v),
            lock: c => c.mode != 'create', onError: t => t.rkt.yearAlreadyFilled,
        })
    },
    kontrolaTepelnehoCerpadla: {
        _nadpis: newTitleWidget({ text: t => t.rkt.kontrolaTepelnehoCerpadla, level: 2 }),
        kontrolaVenkovniJednotky: newCheckboxWidget({ label: t => t.rkt.kontrolaVenkovniJednotky, required: false, descriptionItems: t => [t.rkt.kontrolaStavuVzduchovychCest, t.rkt.kontrolaOdtokuKondenzatu], show: atw }),
        kontrolaElektrickeCasti: newCheckboxWidget({ label: t => t.rkt.kontrolaElektrickeCasti, required: false, descriptionItems: t => [t.rkt.kontrolaDotazeniSpoju, t.rkt.optickaKontrolaDesky] }),
        kontrolaChladivoveCasti: newCheckboxWidget({ label: t => t.rkt.kontrolaChladivoveCasti, required: false, descriptionItems: t => [t.rkt.kontrolaChoduKompresoru, t.rkt.vizualniKontrolaChladivovehoOkruhu, t.rkt.kontrolaStavuPotrubi] }),
    },
    kontrolaPrimarnihoOkruhu: {
        _nadpis: newTitleWidget({ text: t => t.rkt.kontrolaPrimarnihoOkruhu, level: 2, show: gtw }),
        kontrola: newCheckboxWidget({ label: '', required: false, descriptionItems: t => [t.rkt.kontrolaMrazuvzdornostiKapalinyPrimarnihoOkruhu, t.rkt.kontrolaTlakuMnozstviKapalinyPrimarnihoOkruhu], show: gtw }),
    },
    kontrolaRegulace: {
        _nadpis: newTitleWidget({ text: t => t.rkt.kontrolaRegulace, level: 2 }),
        kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin: newCheckboxWidget({ label: t => t.rkt.kontrolaChybovychAInformacnichHlaseniRegulatoruAJejichPricin, required: false }),
        celkoveProvozniHodinyKompresoru: newInputWidget({ label: t => t.rkt.celkoveProvozniHodinyKompresoru, required: false, inputmode: 'numeric' }),
        celkoveProvozniHodinyKompresoruMinule: newTextWidget({ text: (t, c) => c.dataFromLastYear?.celkoveProvozniHodinyKompresoru?.(t, c) || '' }),
        provozniHodinyKompresoruDoTepleVody: newInputWidget({ label: t => t.rkt.provozniHodinyKompresoruDoTepleVody, required: false, inputmode: 'numeric' }),
        provozniHodinyKompresoruDoTepleVodyMinule: newTextWidget({ text: (t, c) => c.dataFromLastYear?.provozniHodinyKompresoruDoTepleVody?.(t, c) || '' }),
        celkovyPocetStartuKompresoru: newInputWidget({ label: t => t.rkt.celkovyPocetStartuKompresoru, required: false, inputmode: 'numeric' }),
        celkovyPocetStartuKompresoruMinule: newTextWidget({ text: (t, c) => c.dataFromLastYear?.celkovyPocetStartuKompresoru?.(t, c) || '' }),
        pocetStartuKompresoruDoTepleVody: newInputWidget({ label: t => t.rkt.pocetStartuKompresoruDoTepleVody, required: false, inputmode: 'numeric' }),
        pocetStartuKompresoruDoTepleVodyMinule: newTextWidget({ text: (t, c) => c.dataFromLastYear?.pocetStartuKompresoruDoTepleVody?.(t, c) || '' }),
        celkoveProvozniHodinyDoplnkovehoZdroje: newInputWidget({ label: t => t.rkt.celkoveProvozniHodinyDoplnkovehoZdroje, required: false, inputmode: 'numeric' }),
        celkoveProvozniHodinyDoplnkovehoZdrojeMinule: newTextWidget({ text: (t, c) => c.dataFromLastYear?.celkoveProvozniHodinyDoplnkovehoZdroje?.(t, c) || '' }),
        celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody: newInputWidget({ label: t => t.rkt.celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody, required: false, inputmode: 'numeric' }),
        celkoveProvozniHodinyDoplnkovehoZdrojeTepleVodyMinule: newTextWidget({ text: (t, c) => c.dataFromLastYear?.celkoveProvozniHodinyDoplnkovehoZdrojeTepleVody?.(t, c) || '' }),
        prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly: newInputWidget({ label: t => t.rkt.prumernaCelkovaDobaChoduKompresoruMinOdPosledniKontroly, required: false, inputmode: 'numeric', show: false, suffix: t => t.units.min }),
        prumernaDobaChoduKompresoruDoTepleVodyMinOdPosledniKontroly: newInputWidget({ label: t => t.rkt.prumernaDobaChoduKompresoruDoTepleVodyMinOdPosledniKontroly, required: false, inputmode: 'numeric', show: false, suffix: t => t.units.min }),
    },
    kontrolaElektroinstalaceKomponentRegulus: {
        _nadpis: newTitleWidget({ text: t => t.rkt.kontrolaElektroinstalaceKomponentRegulus, level: 2 }),
        kontrolaDotazeniSvorkovychSpoju: newCheckboxWidget({ label: t => t.rkt.kontrolaDotazeniSvorkovychSpoju, required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaci: newCheckboxWidget({ label: t => t.rkt.vizualniKontrolaVsechPristupnychVodicuVInstalaci, required: false }),
    },
    kontrolaOtopneSoustavy: {
        _nadpis: newTitleWidget({ text: t => t.rkt.kontrolaOtopneSoustavy, level: 2 }),
        vycisteniFiltruInstalaceTepelnehoCerpadla: newCheckboxWidget({ label: t => t.rkt.vycisteniFiltruInstalaceTepelnehoCerpadla, required: false }),
        kontrolaTesnostiOtopneSoustavy: newCheckboxWidget({ label: t => t.rkt.kontrolaTesnostiOtopneSoustavy, required: false }),
        kontrolaPojistovacichVentilu: newCheckboxWidget({ label: t => t.rkt.kontrolaPojistovacichVentilu, required: false }),
        kontrolaPojistovacichVentiluPoznamka: newInputWidget({ label: '', required: false, textArea: true, placeholder: t => t.rkt.kontrolaPojistovacichVentiluPoznamka }),
        _kontrolaTlakuVOtopneSoustaveNadpis: newTextWidget({ text: t => t.rkt.kontrolaTlakuVOtopneSoustave, class: 'fs-5' }),
        kontrolaTlakuVOtopneSoustavePriUPT: newInputWidget({ label: t => t.rkt.tlakPriUvadeniDoProvozu, required: false, inputmode: 'numeric', suffix: t => t.units.bar, lock: true, hideInRawData: true }),
        kontrolaTlakuVOtopneSoustave: newInputWidget({ label: t => t.rkt.tlakPriKontrole, required: false, inputmode: 'numeric', suffix: t => t.units.bar }),
    },
    kontrolaTlakuExpanznichNadob: {
        _nadpis: newTitleWidget({ text: t => t.rkt.kontrolaTlakuExpanznichNadob, level: 2 }),
        _podnadpis: newTextWidget({ text: t => t.rkt.nelzeliProvestUvedteDuvod }),
        _expanzniNadobaOtopneSoustavyNadpis: newTextWidget({ text: t => t.rkt.expanzniNadobaOtopneSoustavy, class: 'fs-5' }),
        expanzniNadobaOtopneSoustavyPriUPT: newInputWidget({ label: t => t.rkt.tlakPriUvadeniDoProvozu, required: false, inputmode: 'numeric', suffix: t => t.units.bar, lock: true, hideInRawData: true }),
        expanzniNadobaOtopneSoustavy: newInputWidget({ label: t => t.rkt.tlakVzduchuNastavenyPriKontrole, required: false, inputmode: 'numeric', suffix: t => t.units.bar }),
        _expanzniNadobaPitneVodyNadpis: newTextWidget({ text: t => t.rkt.expanzniNadobaPitneVody, class: 'fs-5' }),
        expanzniNadobaPitneVodyPriUPT: newInputWidget({ label: t => t.rkt.tlakPriUvadeniDoProvozu, required: false, inputmode: 'numeric', suffix: t => t.units.bar, lock: true, hideInRawData: true }),
        expanzniNadobaPitneVody: newInputWidget({ label: t => t.rkt.tlakVzduchuNastavenyPriKontrole, required: false, inputmode: 'numeric', suffix: t => t.units.bar }),
    },
    funkcniTest: {
        _nadpis: newTitleWidget({ text: t => t.rkt.funkcniTest, level: 2 }),
        provozniZkouska: newCheckboxWidget({ label: t => t.rkt.provozniZkouska, required: false, descriptionItems: t => [t.rkt.kontrolaVseho] }),
    },
    poznamky: {
        poznamka: newInputWidget({
            label: t => t.rkt.note, required: false,
        }),
    },
});