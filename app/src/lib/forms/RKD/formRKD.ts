import { CheckboxWidget, RadioWidget, TextWidget, TitleWidget, Widget } from '$lib/forms/Widget.svelte';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { Raw } from '$lib/forms/Form';
import ares, { regulusCRN } from '$lib/helpers/ares';
import { extractIRIDFromRawData, irName } from '$lib/helpers/ir';
import db, { type IR } from '$lib/data';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';

export type DataRKD<D extends DataRKD<D>> = {
    evidence: Raw<FormIN>,
    rkd: FormPartRKD<D>,
}

export interface FormPartRKD<D extends DataRKD<D>> extends Record<string, Widget<D, any, true>> {
    title: TitleWidget<D>,
    enabled: CheckboxWidget<D, true>,
    executingCompany: RadioWidget<D, 'assembly' | 'commissioning' | 'regulus', true>,
    chosenCompany: TextWidget<D>,
}

export const defaultRKD = <D extends DataRKD<D>>(): FormPartRKD<D> => ({
    title: new TitleWidget({ text: t => t.rk.recommendations.title, level: 2, showInXML: false }),
    enabled: new CheckboxWidget({
        label: t => t.rk.recommendations.userWantsTo, hideInRawData: true, showInXML: false, required: false,
    }),
    executingCompany: new RadioWidget({
        options: d => d.evidence.uvedeni.ico == `${regulusCRN}` ? ['assembly', 'regulus']
            : d.evidence.montazka.ico == `${regulusCRN}` ? ['regulus', 'commissioning'] : ['assembly', 'commissioning', 'regulus'],
        label: t => t.rk.recommendations.executingCompany, showInXML: false, hideInRawData: true, labels: t => ({
            assembly: t.in.assemblyCompany,
            commissioning: t.in.commissioningCompany,
            regulus: t.rk.recommendations.regulus,
        }), show: d => d.rkd.enabled.value, required: d => d.rkd.enabled.value,
    }),
    chosenCompany: new TextWidget({
        show: d => d.rkd.enabled.value && (d.rkd.executingCompany.value == 'assembly' || d.rkd.executingCompany.value == 'commissioning'),
        showInXML: false, text: async (t, d) => {
            const crn = d.rkd.executingCompany.value == 'assembly' ? d.evidence.montazka.ico : d.evidence.uvedeni.ico;
            const company = await ares.getName(crn);
            return company ? `${t.in.chosenCompany}: ${company}` : '';
        },
    })
})

export const saveRKD = async <D extends DataRKD<D>>(ir: IR, form: FormPartRKD<D>) => {
    const enabled = form.enabled.value;
    const irid = extractIRIDFromRawData(ir.evidence);
    await db.updateRecommendationsSettings(irid, enabled, form.executingCompany.value);
    if (enabled == Boolean(ir.yearlyHeatPumpCheckRecommendation)) return;

    const user = get(currentUser)!;
    const response = await sendEmail({
        ...defaultAddresses(),
        subject: enabled
            ? `Zapnuto upozorňování na RK u ${irName(ir.evidence.ir)}`
            : `Zrušeno upozorňování na RK u ${irName(ir.evidence.ir)}`,
        component: MailProtocol,
        props: { name: user.email!, url: page.url.origin + detailIrUrl(irid) },
    });
    console.log(response);
}