import type { FormIN } from '$lib/forms/IN/formIN';
import type { Raw, Values } from '$lib/forms/Form';
import ares, { regulusCRN } from '$lib/helpers/ares';
import { irName, irWholeName } from '$lib/helpers/ir';
import { type IR, type RecommendationSettings } from '$lib/data';
import { cervenka, defaultAddresses, sendEmail } from '$lib/client/email';
import { page } from '$app/state';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import MailDK from '$lib/emails/MailDK.svelte';
import db from '$lib/Database';
import {
    type CheckboxWidget,
    type InputWidget,
    newCheckboxWidget,
    newInputWidget,
    newRadioWidget,
    newTextWidget,
    newTitleWidget,
    type RadioWidget,
    type TextWidget,
    type TitleWidget,
    type Widget,
    type WidgetType,
} from '$lib/forms/Widget';
import { isNewWarranties } from '$lib/helpers/prices';
import { dayISO } from '$lib/helpers/date';

export type ContextDK<D extends ContextDK<D>> = {
    IN: Raw<FormIN>,
    DK: Values<FormPartDK<D>>,
    mode: 'create' | 'edit' | 'view' | 'loading',
}

export interface FormPartDK<C extends ContextDK<C>> extends Record<string, Widget<C, WidgetType, true>> {
    title: TitleWidget<C>,
    commissionDate: InputWidget<C, true>,
    enabled: CheckboxWidget<C, true>,
    executingCompany: RadioWidget<C, 'assembly' | 'commissioning' | 'regulus', true>,
    chosenCompany: TextWidget<C>,
}

const isCreate = (c: ContextDK<any>) => c.mode == 'create';
const isNew = (c: ContextDK<any>, type: 'TČ' | 'SOL') => isNewWarranties(c.DK.commissionDate) && type == 'TČ';
const show = (type: 'TČ' | 'SOL') => (c: ContextDK<any>) =>
    isCreate(c) && !isNew(c, type);

export const defaultDK = <D extends ContextDK<D>>(
    type: 'TČ' | 'SOL',
    initialCommissionDate: string | undefined,
    settings: RecommendationSettings | undefined,
    isInline?: boolean,
): FormPartDK<D> => ({
    title: newTitleWidget({
        text: t => t.dk.title, level: 2, showInXML: false,
        show: c => show(type)(c) && !!isInline,
    }),
    commissionDate: newInputWidget({
        label: t => t.tc.dateOfCommission, type: 'date', hideInRawData: true,
        show: !isInline, text: initialCommissionDate || dayISO(), lock: !!initialCommissionDate,
    }),
    _warning: newTextWidget({
        show: c => !isInline && isNew(c, type),
        text: 'Není podporováno',
    }),
    enabled: newCheckboxWidget({
        label: t => t.dk.userWantsTo(type), hideInRawData: true, showInXML: false,
        required: false, show: show(type), checked: !!settings,
    }),
    executingCompany: newRadioWidget({
        options: c => c.IN.uvedeni.ico == `${regulusCRN}` ? ['assembly', 'regulus']
            : c.IN.montazka.ico == `${regulusCRN}` ? ['regulus', 'commissioning']
                : ['assembly', 'commissioning', 'regulus'],
        label: t => t.dk.executingCompany, showInXML: false, hideInRawData: true, labels: t => ({
            assembly: t.in.assemblyCompany,
            commissioning: t.in.commissioningCompany,
            regulus: t.dk.regulus,
        }), show: c => c.DK.enabled && show(type)(c), required: c => c.DK.enabled,
        chosen: settings?.executingCompany,
    }),
    chosenCompany: newTextWidget({
        show: c => c.DK.enabled && (c.DK.executingCompany == 'assembly' || c.DK.executingCompany == 'commissioning') && show(type)(c),
        showInXML: false, text: async (t, c) => {
            const crn = c.DK.executingCompany == 'assembly' ? c.IN.montazka.ico : c.IN.uvedeni.ico;
            const company = await ares.getName(crn);
            return company ? `${t.in.chosenCompany}: ${company}` : '';
        },
    }),
});

export const saveDK = async <D extends ContextDK<D>>(ir: IR, values: Values<FormPartDK<D>>, type: 'TČ' | 'SOL') => {
    const enabled = values.enabled;
    const companyType = values.executingCompany;
    if (type == 'TČ') {
        if (!ir.UP.dateTC) await db.updateDateUPT(ir.meta.id, values.commissionDate);
        await db.updateDKT(ir.meta.id, enabled, values.executingCompany);
    } else {
        if (!ir.UP.dateSOL) await db.updateDateUPS(ir.meta.id, values.commissionDate);
        await db.updateDKS(ir.meta.id, enabled, values.executingCompany);
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
};