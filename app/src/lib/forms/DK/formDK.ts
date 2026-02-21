import { CheckboxWidget, InputWidget, RadioWidget, TextWidget, TitleWidget, Widget } from '$lib/forms/Widget.svelte';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { Raw } from '$lib/forms/Form';
import ares, { regulusCRN } from '$lib/helpers/ares';
import { irName, irWholeName } from '$lib/helpers/ir';
import { type IR } from '$lib/data';
import { cervenka, defaultAddresses, sendEmail } from '$lib/client/email';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import MailDK from '$lib/emails/MailDK.svelte';
import db from '$lib/Database';

export type DataDK<D extends DataDK<D>> = {
    evidence: Raw<FormIN>,
    dk: FormPartDK<D>,
}

export interface FormPartDK<D extends DataDK<D>> extends Record<string, Widget<D, any, true>> {
    title: TitleWidget<D>,
    commissionDate: InputWidget<D, true>,
    enabled: CheckboxWidget<D, true>,
    executingCompany: RadioWidget<D, 'assembly' | 'commissioning' | 'regulus', true>,
    chosenCompany: TextWidget<D>,
}

export const defaultDK = <D extends DataDK<D>>(
    type: 'TČ' | 'SOL',
    hideDate?: boolean,
): FormPartDK<D> => ({
    title: new TitleWidget({ text: t => t.dk.title, level: 2, showInXML: false }),
    enabled: new CheckboxWidget({
        label: t => t.dk.userWantsTo(type), hideInRawData: true, showInXML: false, required: false,
    }),
    commissionDate: new InputWidget({ label: t => t.tc.dateOfCommission, type: 'date', hideInRawData: true, show: !hideDate }),
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

export const initDK = <D extends DataDK<D>>(
    data: D,
    mode: 'create' | 'edit' | 'view',
    ir: IR,
    type: 'TČ' | 'SOL',
) => {
    const date = type == 'TČ' ? ir.UP.dateTC : ir.UP.dateSOL;
    const settings = type == 'TČ' ? ir.RK.DK.TC : ir.RK.DK.SOL;
    data.dk.commissionDate.setValue(data, date || '');
    if (settings) {
        data.dk.enabled.setValue(data, true);
        data.dk.executingCompany.setValue(data, settings.executingCompany);
    }
    if (date) data.dk.commissionDate.lock = () => true;
    if (mode != 'create') (data.dk as Record<string, Widget>).getValues().forEach(e => {
        e.show = () => false;
    });
}

export const saveDK = async <D extends DataDK<D>>(ir: IR, form: FormPartDK<D>, type: 'TČ' | 'SOL') => {
    const enabled = form.enabled.value;
    const companyType = form.executingCompany.value;
    if (type == 'TČ') {
        if (!ir.UP.dateTC) await db.updateDateUPT(ir.meta.id, form.commissionDate.value);
        await db.updateDKT(ir.meta.id, enabled, form.executingCompany.value);
    } else {
        if (!ir.UP.dateSOL) await db.updateDateUPS(ir.meta.id, form.commissionDate.value);
        await db.updateDKS(ir.meta.id, enabled, form.executingCompany.value);
    }
    const settings = type == 'TČ' ? ir.RK.DK.TC : ir.RK.DK.SOL;
    if (enabled == Boolean(settings) || companyType == settings?.executingCompany) return true;

    const getCompany = async () => {
        const crn = companyType == 'assembly' ? ir.IN.montazka.ico : ir.IN.uvedeni.ico;
        const a = await ares.getName(crn, fetch);
        return a ? `${a} (${crn})` : crn;
    };
    const company = companyType ? companyType == 'regulus' ? 'Firma Regulus' : await getCompany() : null;
    const name = irWholeName(ir.IN);
    const user = get(currentUser)!;
    const response = await sendEmail({
        ...defaultAddresses(cervenka),
        subject: enabled
            ? `Zapnuto upozorňování na RK ${type} u ${irName(ir.IN.ir)}`
            : `Zrušeno upozorňování na RK ${type} u ${irName(ir.IN.ir)}`,
        component: MailDK,
        props: { name: user.email!, url: page.url.origin + detailIrUrl(ir.meta.id), company, irWholeName: name },
    });
    console.log(response);

    return response?.ok;
}