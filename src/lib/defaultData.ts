import type { Translations as T } from "./translations";
import { Vybiratkova, Pisatkova, Radiova, Nadpisova, Zaskrtavatkova, MultiZaskrtavatkova, DvojVybiratkova } from "./Vec";
import { type Data } from "./Data";

const defaultData = () => ({
	ir: {
		typ: new DvojVybiratkova({
			nazev: (t) => t.controllerType,
			moznosti1: [
				'IR RegulusBOX',
				'IR RegulusHBOX',
				'IR RegulusHBOX 112',
				'IR RegulusHBOX 212',
				'IR RegulusHBOX K',
				'IR 14',
				'IR 12',
			],
			moznosti2: [
				'CTC',
				'RTC',
			],
		}),
		cislo: new Pisatkova({
			nazev: (t) => t.serialNumber,
			onError: (t) => t.wrongNumberFormat,
			regex: /([A-Z][1-9OND]) ([0-9]{4})/,
			maskOptions: ({
				mask: 'A1 2345',
				definitions: {
					'A': /[A-Z]/,
					'1': /[1-9OND]/,
					'2': /[0-9]/,
					'3': /[0-9]/,
					'4': /[0-9]/,
					'5': /[0-9]/,
				}
			}),
		})
	},
	tc: {
		druh: new Radiova({
			nazev: (t) => t.heatPumpType,
			moznosti: (t) => [t.airToWater, t.groundToWater],
			nutne: false,
			zobrazit: (_, data) => data.ir.typ.vybrano2 == 0,
		}),
		typ: new Vybiratkova({
			nazev: (t) => t.heatPumpModel,
			moznosti: (_, data) =>
				data.ir.typ.vybrano2 == 1 ? [
					'RTC 6i', 'RTC 13e', 'RTC 20e'
				] : data.tc.druh.vybrano == 0 ? [
					'EcoAir 614M',
					'EcoAir 622M',
					'EcoAir 406',
					'EcoAir 408',
					'EcoAir 410',
					'EcoAir 415',
					'EcoAir 420',
				] : [
					'EcoPart 612M',
					'EcoPart 616M',
					'EcoPart 406',
					'EcoPart 408',
					'EcoPart 410',
					'EcoPart 412',
					'EcoPart 414',
					'EcoPart 417',
					'EcoPart 435'
				],
			nutne: false,
			zobrazit: (_, data) => data.ir.typ.vybrano2 != null &&
				(data.ir.typ.vybrano2 == 1 || data.tc.druh.vybrano != null),
		}),
		cislo: new Pisatkova({
			nazev: (t) => t.heatPumpManufactureNumber,
			onError: (t) => t.wrongNumberFormat,
			regex: (_, data) => [/^\d{4}-\d{4}-\d{4}$/, /^[A-Z]{2}\d{4}-[A-Z]{2}-\d{4}$/][data.ir.typ.vybrano2!],
			nutne: false,
			maskOptions: (_, data) => ({
				mask: ['1234-1234-1234', 'AB1234-CD-1234'][data.ir.typ.vybrano2!],
				definitions: {
					'1': /[0-9]/,
					'2': /[0-9]/,
					'3': /[0-9]/,
					'4': /[0-9]/,
					'A': /[A-Z]/,
					'B': /[A-Z]/,
					'C': /[A-Z]/,
					'D': /[A-Z]/,
				}
			}),
			zobrazit: (_, data) => data.ir.typ.vybrano2 != null,
		})
	},
	koncovyUzivatel: {
		nadpis: new Nadpisova({ nazev: (t) => t.endUser }),
		jmeno: new Pisatkova({ nazev: (t) => t.name, autocomplete: "section-user billing given-name additional-name" }),
		prijmeni: new Pisatkova({ nazev: (t) => t.surname, autocomplete: "section-user billing family-name" }),
		narozeni: new Pisatkova({
			nazev: (t) => t.birthday,
			onError: (t) => t.wrongDateFormat,
			regex: /^(0?[1-9]|[12][0-9]|3[01]). ?(0?[1-9]|1[0-2]). ?[0-9]{4}$/, 
			autocomplete: "section-user billing bday",
		}),
		telefon: new Pisatkova({
			nazev: (t) => t.phone,
			onError: (t) => t.wrongPhoneFormat,
			regex: /^(\+\d{1,3}\s)?\(?\d{3}\)?[\s\.-]?\d{3}[\s\.-]?\d{3,4}$/,
			type: "tel",
			autocomplete: "section-user billing mobile tel",
		}),
		email: new Pisatkova({
			nazev: (t) => t.email,
			onError: (t) => t.wrongEmailFormat,
			regex: /^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/,
			type: "email",
			autocomplete: "section-user billing mobile email",
		}),
	},
	bydliste: {
		nadpis: new Nadpisova({ nazev: (t) => t.residence }),
		obec: new Pisatkova({ nazev: (t) => t.town, autocomplete: "section-user billing home city" }),
		ulice: new Pisatkova({
			nazev: (t) => t.street,
			nutne: false,
			autocomplete: "section-user billing home street-address",
		}),
		psc: new Pisatkova({
			nazev: (t) => t.zip,
			onError: (t) => t.wrongZIPFormat,
			regex: /^\d{3} \d{2}$/,
			maskOptions: ({
				mask: '123 45',
				definitions: {
					'1': /[0-9]/,
					'2': /[0-9]/,
					'3': /[0-9]/,
					'4': /[0-9]/,
					'5': /[0-9]/,
					'6': /[0-9]/,
					'7': /[0-9]/,
					'8': /[0-9]/,
				}
			}),
			autocomplete: "section-user billing home postal-code",
		}),
	},
	mistoRealizace: {
		nadpis: new Nadpisova({ nazev: (t) => t.roalizationLocation }),
		obec: new Pisatkova({ nazev: (t) => t.town, autocomplete: "section-realization shipping city" }),
		ulice: new Pisatkova({
			nazev: (t) => t.street,
			nutne: false,
			autocomplete: "section-realization shipping street-address",
		}),
		psc: new Pisatkova({
			nazev: (t) => t.zip,
			onError: (t) => t.wrongZIPFormat,
			regex: /^\d{3} \d{2}$/,
			maskOptions: ({
				mask: '123 45',
				definitions: {
					'1': /[0-9]/,
					'2': /[0-9]/,
					'3': /[0-9]/,
					'4': /[0-9]/,
					'5': /[0-9]/,
					'6': /[0-9]/,
					'7': /[0-9]/,
					'8': /[0-9]/,
				}
			}),
			autocomplete: "section-realization shipping postal-code",
		}),
	},
	montazka: {
		nadpis: new Nadpisova({ nazev: (t) => t.assemblyCompany }),
		ico: new Pisatkova({
			nazev: (t) => t.crn, onError: (t) => t.wrongCRNFormat, regex: /^\d{8}$/,
			maskOptions: ({
				mask: '12345678',
				definitions: {
					'1': /[0-9]/,
					'2': /[0-9]/,
					'3': /[0-9]/,
					'4': /[0-9]/,
					'5': /[0-9]/,
					'6': /[0-9]/,
					'7': /[0-9]/,
					'8': /[0-9]/,
				}
			}),
		}),
		zastupce: new Pisatkova({ nazev: (t) => t.representativeName, autocomplete: "section-assemblyRepr billing name" }),
		email: new Pisatkova({
			nazev: (t) => t.email,
			onError: (t) => t.wrongEmailFormat,
			regex: /^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/,
			autocomplete: "section-assembly billing work email",
		})
	},
	uvedeni: {
		nadpis: new Nadpisova({ nazev: (t) => t.commissioning }),
		jakoMontazka: new Zaskrtavatkova({ nazev: (t) => t.commissionedByAssemblyCompany, nutne: false }),
		ico: new Pisatkova({
			nazev: (t) => t.crn, onError: (t) => t.wrongCRNFormat, regex: /^\d{8}$/,
			maskOptions: ({
				mask: '12345678',
				definitions: {
					'1': /[0-9]/,
					'2': /[0-9]/,
					'3': /[0-9]/,
					'4': /[0-9]/,
					'5': /[0-9]/,
					'6': /[0-9]/,
					'7': /[0-9]/,
					'8': /[0-9]/,
				}
			}),
			zobrazit: (_, data) => !data.uvedeni.jakoMontazka.zaskrtnuto,
		}),
		zastupce: new Pisatkova({
			nazev: (t) => t.representativeName,
			zobrazit: (_, data) => !data.uvedeni.jakoMontazka.zaskrtnuto,
			autocomplete: "section-commissioningRepr billing name",
		}),
		email: new Pisatkova({
			nazev: (t) => t.email,
			onError: (t) => t.wrongEmailFormat,
			regex: /^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/,
			zobrazit: (_, data) => !data.uvedeni.jakoMontazka.zaskrtnuto,
			autocomplete: "section-commissioning billing work email",
		})
	},
	vzdalenyPristup: {
		nadpis: new Nadpisova({ nazev: (t) => t.remoteAccess }),
		chce: new Zaskrtavatkova({ nazev: (t) => t.doYouWantRemoteAccess, nutne: false }),
		pristupMa: new MultiZaskrtavatkova({
			nazev: (t) => t.whoHasAccess,
			moznosti: (t) => [
				t.endCustomer,
				t.assemblyCompany,
				t.commissioningCompany
			],
			zobrazit: (_, data) => data.vzdalenyPristup.chce.zaskrtnuto,
			nutne: (_, data) => data.vzdalenyPristup.chce.zaskrtnuto,
		}),
		fakturuje: new Radiova({
			nazev: (t) => t.whoWillBeInvoiced,
			moznosti: (t) => [t.assemblyCompany, t.endCustomer, t.doNotInvoice],
			zobrazit: (_, data) => data.vzdalenyPristup.chce.zaskrtnuto,
			nutne: (_, data) => data.vzdalenyPristup.chce.zaskrtnuto,
		})
	},
	zodpovednaOsoba: {
		jmeno: new Pisatkova({ nazev: (t) => t.responsiblePerson, autocomplete: "section-resp billing name" })
	},
} as Data)

export default defaultData