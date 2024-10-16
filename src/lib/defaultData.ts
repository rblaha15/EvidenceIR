import { Vybiratkova, Pisatkova, Radiova, Nadpisova, Zaskrtavatkova, MultiZaskrtavatkova, DvojVybiratkova, Textova, t, p, Prepinatkova } from './Vec';
import { type Data } from './Data';

export default (): Data => ({
    ir: {
        typ: new DvojVybiratkova({
            nazev: `controllerType`,
            moznosti1: [
                p`IR RegulusBOX`,
                p`IR RegulusHBOX`,
                p`IR RegulusHBOXK`,
                p`IR 14`,
                p`IR 12`,
            ],
            moznosti2: d => d.ir.typ.value.first == p`IR 12` ? [p`CTC`] : [p`CTC`, p`RTC`],
        }),
        cislo: new Pisatkova({
            nazev: `serialNumber`,
            onError: `wrongNumberFormat`,
            regex: /([A-Z][1-9OND]) ([0-9]{4})/,
            maskOptions: ({
                mask: `A1 0000`,
                definitions: {
                    'A': /[A-Z]/,
                    '1': /[1-9OND]/,
                }
            }),
        }),
        cisloBOX: new Pisatkova({
            nazev: `serialNumberIndoor`,
            onError: `wrongNumberFormat`,
            regex: /([0-9]{7})-([0-9]{7})/,
            maskOptions: ({
                mask: `0000000-0000000`,
            }),
            zobrazit: (data) => data.ir.typ.value.first?.includes(`BOX`) ?? false,
            nutne: (data) => data.ir.typ.value.first?.includes(`BOX`) ?? false,
        }),
        chceVyplnitK: new MultiZaskrtavatkova({
            nazev: `whatToAddInfoTo`,
            moznosti: [
                `heatPump`, //solar, fve
            ],
            nutne: false,
        })
    },
    tc: {
        nadpis: new Nadpisova({ nazev: `heatPump`, zobrazit: data => data.ir.chceVyplnitK.value.includes(`heatPump`) }),
        poznamka: new Textova({ nazev: `pleaseFillInIrType`, zobrazit: data => data.ir.typ.value.second == null && data.ir.chceVyplnitK.value.includes(`heatPump`) }),
        typ: new Radiova({
            nazev: `heatPumpType`,
            moznosti: [`airToWater`, `groundToWater`],
            nutne: data => data.ir.chceVyplnitK.value.includes(`heatPump`),
            zobrazit: data => data.ir.typ.value.second == p`CTC` && data.ir.chceVyplnitK.value.includes(`heatPump`),
        }),
        model: new Vybiratkova({
            nazev: `heatPumpModel`,
            moznosti: data =>
                data.ir.typ.value.second == p`RTC` ? [
                    p`RTC 6i`, p`RTC 13e`, p`RTC 20e`
                ] : data.tc.typ.value == 'airToWater' ? [
                    p`EcoAir 614M`,
                    p`EcoAir 622M`,
                    p`EcoAir 406`,
                    p`EcoAir 408`,
                    p`EcoAir 410`,
                    p`EcoAir 415`,
                    p`EcoAir 420`,
                ] : [
                    p`EcoPart 612M`,
                    p`EcoPart 616M`,
                    p`EcoPart 406`,
                    p`EcoPart 408`,
                    p`EcoPart 410`,
                    p`EcoPart 412`,
                    p`EcoPart 414`,
                    p`EcoPart 417`,
                    p`EcoPart 435`
                ],
            nutne: data => data.ir.chceVyplnitK.value.includes(`heatPump`),
            zobrazit: data => data.ir.typ.value.second != null &&
                (data.ir.typ.value.second == p`RTC` || data.tc.typ.value != null) &&
                data.ir.chceVyplnitK.value.includes(`heatPump`),
        }),
        cislo: new Pisatkova({
            nazev: `heatPumpManufactureNumber`,
            onError: `wrongNumberFormat`,
            regex: data => data.ir.typ.value.second == p`CTC` ? /^\d{4}-\d{4}-\d{4}$/ : /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/,
            nutne: data => data.ir.chceVyplnitK.value.includes(`heatPump`),
            maskOptions: data => ({
                mask: data.ir.typ.value.second == p`CTC` ? `0000-0000-0000` : `AA0000-AA-0000`,
                definitions: {
                    'A': /[A-Z]/,
                }
            }),
            zobrazit: data => data.ir.typ.value.second != null && data.ir.chceVyplnitK.value.includes(`heatPump`),
        })
    },
    koncovyUzivatel: {
        nadpis: new Nadpisova({ nazev: `endUser` }),
        jmeno: new Pisatkova({ nazev: `name`, autocomplete: `section-user billing given-name additional-name` }),
        prijmeni: new Pisatkova({ nazev: `surname`, autocomplete: `section-user billing family-name` }),
        narozeni: new Pisatkova({
            nazev: `birthday`,
            onError: `wrongDateFormat`,
            regex: /^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/,
            autocomplete: `section-user billing bday`,
            nutne: false,
        }),
        telefon: new Pisatkova({
            nazev: `phone`,
            onError: `wrongPhoneFormat`,
            regex: /^(\+\d{1,3}\s?)?\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{3,6}$/,
            type: `tel`,
            autocomplete: `section-user billing mobile tel`,
        }),
        email: new Pisatkova({
            nazev: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            type: `email`,
            autocomplete: `section-user billing mobile email`,
        }),
    },
    bydliste: {
        nadpis: new Nadpisova({ nazev: `residence` }),
        ulice: new Pisatkova({
            nazev: `street`,
            autocomplete: `section-user billing home street-address`,
        }),
        obec: new Pisatkova({ nazev: `town`, autocomplete: `section-user billing home city` }),
        psc: new Pisatkova({
            nazev: `zip`,
            onError: `wrongZIPFormat`,
            regex: /^\d{3} \d{2}$/,
            maskOptions: ({
                mask: `000 00`,
            }),
            autocomplete: `section-user billing home postal-code`,
        }),
    },
    mistoRealizace: {
        nadpis: new Nadpisova({ nazev: `roalizationLocation` }),
        jakoBydliste: new Zaskrtavatkova({ nazev: `realisedAtResidence`, nutne: false }),
        ulice: new Pisatkova({
            nazev: `street`,
            nutne: false,
            autocomplete: `section-realization shipping street-address`,
            zobrazit: data => !data.mistoRealizace.jakoBydliste.value,
        }),
        obec: new Pisatkova({
            nazev: `town`,
            autocomplete: `section-realization shipping city`,
            zobrazit: data => !data.mistoRealizace.jakoBydliste.value,
            nutne: data => !data.mistoRealizace.jakoBydliste.value,
        }),
        psc: new Pisatkova({
            nazev: `zip`,
            onError: `wrongZIPFormat`,
            regex: /^\d{3} \d{2}$/,
            maskOptions: ({
                mask: `000 00`,
            }),
            autocomplete: `section-realization shipping postal-code`,
            zobrazit: data => !data.mistoRealizace.jakoBydliste.value,
            nutne: data => !data.mistoRealizace.jakoBydliste.value,
        }),
    },
    montazka: {
        nadpis: new Nadpisova({ nazev: `assemblyCompany` }),
        ico: new Pisatkova({
            nazev: `crn`, onError: `wrongCRNFormat`, regex: /^\d{8}(\d{2})?$/,
            maskOptions: ({
                mask: `00000000[00]`,
            }),
        }),
        zastupce: new Pisatkova({ nazev: `representativeName`, autocomplete: `section-assemblyRepr billing name` }),
        email: new Pisatkova({
            nazev: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            autocomplete: `section-assembly billing work email`,
        })
    },
    uvedeni: {
        nadpis: new Nadpisova({ nazev: `commissioning` }),
        jakoMontazka: new Zaskrtavatkova({ nazev: `commissionedByAssemblyCompany`, nutne: false }),
        ico: new Pisatkova({
            nazev: `crn`, onError: `wrongCRNFormat`, regex: /^\d{8}(\d{2})?$/,
            maskOptions: ({
                mask: `00000000[00]`,
            }),
            zobrazit: data => !data.uvedeni.jakoMontazka.value,
            nutne: data => !data.uvedeni.jakoMontazka.value,
        }),
        zastupce: new Pisatkova({
            nazev: `representativeName`,
            autocomplete: `section-commissioningRepr billing name`,
        }),
        email: new Pisatkova({
            nazev: `email`,
            onError: `wrongEmailFormat`,
            regex: /^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/,
            zobrazit: data => !data.uvedeni.jakoMontazka.value,
            nutne: data => !data.uvedeni.jakoMontazka.value,
            autocomplete: `section-commissioning billing work email`,
        })
    },
    vzdalenyPristup: {
        nadpis: new Nadpisova({ nazev: `remoteAccess` }),
        chce: new Zaskrtavatkova({ nazev: `doYouWantRemoteAccess`, nutne: false }),
        pristupMa: new MultiZaskrtavatkova({
            nazev: `whoHasAccess`,
            moznosti: [`endCustomer`, `assemblyCompany`, `commissioningCompany`],
            zobrazit: data => data.vzdalenyPristup.chce.value,
            nutne: data => data.vzdalenyPristup.chce.value,
        }),
        fakturuje: new Radiova({
            nazev: `whoWillBeInvoiced`,
            moznosti: [t('assemblyCompany'), t('endCustomer'), t('doNotInvoice')],
            zobrazit: data => data.vzdalenyPristup.chce.value,
            nutne: data => data.vzdalenyPristup.chce.value,
        })
    },
    ostatni: {
        zodpovednaOsoba: new Pisatkova({ nazev: `responsiblePerson`, autocomplete: `section-resp billing name` }),
        poznamka: new Pisatkova({ nazev: `note`, nutne: false, })
    },
})