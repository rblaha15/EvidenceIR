import { CheckboxWidget, CounterWidget, InputWidget, TitleWidget } from '$lib/forms/Widget.svelte';
import type { DataRKS, FormRKS } from '$lib/forms/RKS/formRKS';

export default (y: number, done: number[]): FormRKS => ({
    info: {
        osoba: new InputWidget({ label: t => t.rks.performingPerson }),
        datum: new InputWidget({ label: t => t.rks.checkDate, type: 'date' }),
        year: new CounterWidget<DataRKS, true>({
            label: t => t.rks.checkYear, min: 1, chosen: y, max: Number.POSITIVE_INFINITY, hideInRawData: true,
            validate: v => !done.includes(v), onError: t => t.rks.yearAlreadyFilled,
        })
    },
    kontrolniUkonySolarnihoSystemu: {
        nadpis: new TitleWidget({ text: t => t.rks.kontrolniUkonySolarnihoSystemu, level: 2 }),
        kontrolaUpevneniKolektoru: new CheckboxWidget({ label: t => t.rks.kontrolaUpevneniKolektoru, required: false }),
        vizualniKontrolaTesnostiSystemu: new CheckboxWidget({ label: t => t.rks.vizualniKontrolaTesnostiSystemu, required: false }),
        kontrolaStavuIzolacePotrubi: new CheckboxWidget({ label: t => t.rks.kontrolaStavuIzolacePotrubi, required: false }),
        kontrolaDorustaniOkolStromuZDuvoduMoznehoZastineni: new CheckboxWidget({ label: t => t.rks.kontrolaDorustaniOkolStromuZDuvoduMoznehoZastineni, required: false }),
        odvzdusneniSolarnihoSystemuKontrolaSeparatoru: new CheckboxWidget({ label: t => t.rks.odvzdusneniSolarnihoSystemuKontrolaSeparatoru, required: false }),
        kontrolaSpravnehoPrutoku: new CheckboxWidget({ label: t => t.rks.kontrolaSpravnehoPrutoku, required: false }),
        kontrolaMrazuvzdornostiKapalinyRefraktometrem: new CheckboxWidget({ label: t => t.rks.kontrolaMrazuvzdornostiKapalinyRefraktometrem, required: false }),
        kontrolaTlakuKapalinyVSolarnimSystemuPripadneDoplneni: new CheckboxWidget({ label: t => t.rks.kontrolaTlakuKapalinyVSolarnimSystemuPripadneDoplneni, required: false }),
        kontrolaTlakuVSolarniEnJehoPripadneDoplneni: new CheckboxWidget({ label: t => t.rks.kontrolaTlakuVSolarniEnJehoPripadneDoplneni, required: false }),
    },
    kontrolaSolarniRegulace: {
        nadpis: new TitleWidget({ text: t => t.rks.kontrolaSolarniRegulace, level: 2 }),
        kontrolaTeplotnichCidel: new CheckboxWidget({ label: t => t.rks.kontrolaTeplotnichCidel, required: false }),
        kontrolaNastaveniParametruRegulatoru: new CheckboxWidget({ label: t => t.rks.kontrolaNastaveniParametruRegulatoru, required: false }),
        kontrolaChybovychHlaseniVRegulaciAJejichPricin: new CheckboxWidget({ label: t => t.rks.kontrolaChybovychHlaseniVRegulaciAJejichPricin, required: false }),
        preventProskoleniObsluhyZHlediskaUdrzbyANastaveniRegulace: new CheckboxWidget({ label: t => t.rks.preventProskoleniObsluhyZHlediskaUdrzbyANastaveniRegulace, required: false }),
    },
    kontrolaElektroinstalce: {
        nadpis: new TitleWidget({ text: t => t.rks.kontrolaElektroinstalce, level: 2 }),
        kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace: new CheckboxWidget(
            { label: t => t.rks.kontrolaFunkceVsechElektrickychSpotrebicuZapojenychDoRegulace, required: false }),
        kontrolaDotazeniSvorkovychSpoju: new CheckboxWidget({ label: t => t.rks.kontrolaDotazeniSvorkovychSpoju, required: false }),
        vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni: new CheckboxWidget(
            { label: t => t.rks.vizualniKontrolaVsechPristupnychVodicuVInstalaciNataveniMechPoskozeni, required: false }),
        kontrolaSepnutiDohrevuSepnutiStykacePripadneRele: new CheckboxWidget(
            { label: t => t.rks.kontrolaSepnutiDohrevuSepnutiStykacePripadneRele, required: false }),
    },
    kontrolaZasobnikuTv: {
        nadpis: new TitleWidget({ text: t => t.rks.kontrolaZasobnikuTv, level: 2 }),
        kontrolaMgAnodyVZasobnikuPripVymena: new CheckboxWidget({ label: t => t.rks.kontrolaMgAnodyVZasobnikuPripVymena, required: false }),
        kontrolaPojistovacihoVentilu: new CheckboxWidget({ label: t => t.rks.kontrolaPojistovacihoVentilu, required: false }),
        pripadneProvedteKontroluTlakuVEnTepleVody: new CheckboxWidget({ label: t => t.rks.pripadneProvedteKontroluTlakuVEnTepleVody, required: false }),
    },
    poznamky: {
        poznamka: new InputWidget({
            label: t => t.rks.note, required: false,
        }),
    },
});