import { CheckboxWidget, RadioWidget, TextWidget, TitleWidget, Widget } from '$lib/forms/Widget.svelte';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { Raw } from '$lib/forms/Form';
import ares, { regulusCRN } from '$lib/helpers/ares';
import { extractIRIDFromRawData, irName, irWholeName } from '$lib/helpers/ir';
import db, { type IR } from '$lib/data';
import { cervenka, defaultAddresses, sendEmail } from '$lib/client/email';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import MailDK from '$lib/emails/MailDK.svelte';

export type DataDK<D extends DataDK<D>> = {
    evidence: Raw<FormIN>,
    dk: FormPartDK<D>,
}

export interface FormPartDK<D extends DataDK<D>> extends Record<string, Widget<D, any, true>> {
    title: TitleWidget<D>,
    enabled: CheckboxWidget<D, true>,
    executingCompany: RadioWidget<D, 'assembly' | 'commissioning' | 'regulus', true>,
    chosenCompany: TextWidget<D>,
}

export const defaultDK = <D extends DataDK<D>>(
    type: 'TČ' | 'SOL',
): FormPartDK<D> => ({
    title: new TitleWidget({ text: t => t.dk.title, level: 2, showInXML: false }),
    enabled: new CheckboxWidget({
        label: t => t.dk.userWantsTo(type), hideInRawData: true, showInXML: false, required: false,
    }),
    executingCompany: new RadioWidget({
        options: d => d.evidence.uvedeni.ico == `${regulusCRN}` ? ['assembly', 'regulus']
            : d.evidence.montazka.ico == `${regulusCRN}` ? ['regulus', 'commissioning']
                : ['assembly', 'commissioning', 'regulus'],
        label: t => t.dk.executingCompany, showInXML: false, hideInRawData: true, labels: t => ({
            assembly: t.in.assemblyCompany,
            commissioning: t.in.commissioningCompany,
            regulus: t.dk.regulus,
        }), show: d => d.dk.enabled.value, required: d => d.dk.enabled.value,
    }),
    chosenCompany: new TextWidget({
        show: d => d.dk.enabled.value && (d.dk.executingCompany.value == 'assembly' || d.dk.executingCompany.value == 'commissioning'),
        showInXML: false, text: async (t, d) => {
            const crn = d.dk.executingCompany.value == 'assembly' ? d.evidence.montazka.ico : d.evidence.uvedeni.ico;
            const company = await ares.getName(crn);
            return company ? `${t.in.chosenCompany}: ${company}` : '';
        },
    })
})

export const saveDK = async <D extends DataDK<D>>(ir: IR, form: FormPartDK<D>, type: 'TČ' | 'SOL') => {
    const enabled = form.enabled.value;
    const companyType = form.executingCompany.value;
    const irid = extractIRIDFromRawData(ir.evidence);
    if (type == 'TČ')
        await db.updateHeatPumpRecommendationsSettings(irid, enabled, form.executingCompany.value);
    else
        await db.updateSolarSystemRecommendationsSettings(irid, enabled, form.executingCompany.value);
    const settings = type == 'TČ' ? ir.yearlyHeatPumpCheckRecommendation : ir.yearlySolarSystemCheckRecommendation;
    if (enabled == Boolean(settings) || companyType == settings?.executingCompany) return true;

    const getCompany = async () => {
        const crn = companyType == 'assembly' ? ir.evidence.montazka.ico : ir.evidence.uvedeni.ico;
        const a = await ares.getName(crn, fetch);
        return a ? `${a} (${crn})` : crn;
    };
    const company = companyType ? companyType == 'regulus' ? 'Firma Regulus' : await getCompany() : null;
    const name = irWholeName(ir.evidence);
    const user = get(currentUser)!;
    const response = await sendEmail({
        ...defaultAddresses(cervenka),
        subject: enabled
            ? `Zapnuto upozorňování na RK ${type} u ${irName(ir.evidence.ir)}`
            : `Zrušeno upozorňování na RK ${type} u ${irName(ir.evidence.ir)}`,
        component: MailDK,
        props: { name: user.email!, url: page.url.origin + detailIrUrl(irid), company, irWholeName: name },
    });
    console.log(response);

    return response?.ok;
}