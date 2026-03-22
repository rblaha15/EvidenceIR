import type { ContextRKS, FormRKS } from '$lib/forms/RKS/formRKS';
import { dayISO } from '$lib/helpers/date';
import { newCheckboxWidget, newCounterWidget, newInputWidget, newTitleWidget } from '../Widget';

export default (y: number, done: number[]): FormRKS => ({
    info: {
        osoba: newInputWidget({ label: t => t.rks.performingPerson }),
        datum: newInputWidget({ label: t => t.rks.checkDate, type: 'date', text: dayISO() }),
        year: newCounterWidget<ContextRKS, true>({
            label: t => t.rks.checkYear, min: 1, chosen: y, max: Number.POSITIVE_INFINITY, hideInRawData: true,
            validate: (v, d) => d.mode != 'create' || !done.includes(v),
            lock: c => c.mode != 'create', onError: t => t.rks.yearAlreadyFilled,
        })
    },
    kontrolniUkonySolarnihoSystemu: {
        nadpis: newTitleWidget({ text: t => t.rks.kontrolniUkonySolarnihoSystemu, level: 2 }),
        kontrolaUpevneniKolektoru: newCheckboxWidget({ label: t => t.rks.kontrolaUpevneniKolektoru, required: false }),
        vizualniKontrolaTesnostiSystemu: newCheckboxWidget({ label: t => t.rks.vizualniKontrolaTesnostiSystemu, required: false }),
        kontrolaStavuIzolacePotrubi: newCheckboxWidget({ label: t => t.rks.kontrolaStavuIzolacePotrubi, required: false }),
        kontrolaDorustaniOkolStromuZDuvoduMoznehoZastineni: newCheckboxWidget({ label: t => t.rks.kontrolaDorustaniOkolStromuZDuvoduMoznehoZastineni, required: false }),
        odvzdusneniSolarnihoSystemuKontrolaSeparatoru: newCheckboxWidget({ label: t => t.rks.odvzdusneniSolarnihoSystemuKontrolaSeparatoru, required: false }),
        kontrolaSpravnehoPrutoku: newCheckboxWidget({ label: t => t.rks.kontrolaSpravnehoPrutoku, required: false }),
        kontrolaMrazuvzdornostiKapalinyRefraktometrem: newCheckboxWidget({ label: t => t.rks.kontrolaMrazuvzdornostiKapalinyRefraktometrem, required: false }),
        kontrolaTlakuKapalinyVSolarnimSystemuPripadneDoplneni: newCheckboxWidget({ label: t => t.rks.kontrolaTlakuKapalinyVSolarnimSystemuPripadneDoplneni, required: false }),
        kontrolaTlakuVSolarniEnJehoPripadneDoplneni: newCheckboxWidget({ label: t => t.rks.kontrolaTlakuVSolarniEnJehoPripadneDoplneni, required: false }),
    },
    kontrolaSolarniRegulace: {
        nadpis: newTitleWidget({ text: t => t.rks.kontrolaSolarniRegulace, level: 2 }),
        kontrolaTeplotnichCidel: newCheckboxWidget({ label: t => t.rks.kontrolaTeplotnichCidel, required: false }),
        kontrolaNastaveniParametruRegulatoru: newCheckboxWidget({ label: t => t.rks.kontrolaNastaveniParametruRegulatoru, required: false }),
        kontrolaChybovychHlaseniVRegulaciAJejichPricin: newCheckboxWidget({ label: t => t.rks.kontrolaChybovychHlaseniVRegulaciAJejichPricin, required: false }),
        preventProskoleniObsluhyZHlediskaUdrzbyANastaveniRegulace: newCheckboxWidget({ label: t => t.rks.preventProskoleniObsluhyZHlediskaUdrzbyANastaveniRegulace, required: false }),
    },
    kontrolaElektroinstalce: {
        nadpis: newTitleWidget({ text: t => t.rks.kontrolaElektroinstalce, level: 2 }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: newCheckboxWidget(
            { label: t => t.rks.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace, required: false }),
        kontrolaDotazeniSvorkovychSpoju: newCheckboxWidget({ label: t => t.rks.kontrolaDotazeniSvorkovychSpoju, required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: newCheckboxWidget(
            { label: t => t.rks.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni, required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: newCheckboxWidget(
            { label: t => t.rks.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele, required: false }),
    },
    kontrolaZasobnikuTv: {
        nadpis: newTitleWidget({ text: t => t.rks.kontrolaZasobnikuTv, level: 2 }),
        kontrolaMgAnodyVZasobnikuPripVymena: newCheckboxWidget({ label: t => t.rks.kontrolaMgAnodyVZasobnikuPripVymena, required: false }),
        kontrolaPojistovacihoVentilu: newCheckboxWidget({ label: t => t.rks.kontrolaPojistovacihoVentilu, required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: newCheckboxWidget({ label: t => t.rks.pripadneProvedteKontroluTlakuVEnTepleVody, required: false }),
    },
    poznamky: {
        poznamka: newInputWidget({
            label: t => t.rks.note, required: false,
        }),
    },
});