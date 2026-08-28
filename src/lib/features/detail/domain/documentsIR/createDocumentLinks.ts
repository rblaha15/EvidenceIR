import type { Pdf, PdfParameters } from '$lib/pdf/pdf';
import type { Snippet } from 'svelte';
import type { Color } from '$lib/forms/Widget';
import type { ExistingIR } from '$lib/data';
import * as rules from './documentLinkRules';
import type { Translations } from '$lib/translations';
import { iridUrl } from '$lib/helpers/runes.svelte.js';
import { iaA, iaR } from '$lib/helpers/stores';
import { cascadePumps, type PumpInfo } from '$lib/forms/IN/infoIN';
import { isRKTL } from '$lib/forms/RKT/infoRKT';

export type DropdownItems = ({
    hide?: boolean,
    text: string,
    disabled?: boolean,
} | {
    color: Color,
    icon: string,
    hide?: boolean,
    text: string,
    href: string,
    disabled?: boolean,
} | {
    hide?: boolean,
    item: Snippet,
})[];

export type DocumentLinkDefinition<P extends Pdf> = PdfParameters<P> & {
    link: P,
    name?: string;
    disabled?: boolean;
    additionalButton?: {
        important?: boolean,
        text: string,
        show?: boolean,
        disabled?: boolean,
    } & ({
        href: string, dialogID?: undefined,
    } | {
        dialogID: string, href?: undefined,
    }),
    dropdownItems?: DropdownItems;
    signed?: boolean;
}

const getButtonUPT = (
    t: Translations,
    locked: boolean,
) => ({
    href: iridUrl('/UPT'),
    text: t.tc.commission,
    important: true,
    disabled: locked,
});
const getDropdownItemUPT = (
    t: Translations,
    user: { isAdmin: boolean; isRegulusOrAdmin: boolean },
    locked: boolean,
) => ({
    color: 'warning',
    icon: 'edit_document',
    text: t.detail.editProtocol + iaR(user.isAdmin),
    href: iridUrl(`/UPT/?edit`),
    disabled: locked,
});

const getButtonRKT = (
    ir: ExistingIR,
    tc: PumpInfo,
    t: Translations,
    locked: boolean,
) => ({
    show: true,
    ...rules.showRefsiteDialog(ir)
        ? { dialogID: `refsiteModal-${tc.N}` }
        : { href: iridUrl(`/RKT?pump=${tc.N}`) },
    text: t.rkt.fillOut(tc),
    important: rules.isImportantRKT(ir),
    disabled: locked,
});
const getDropdownItemsRKT = (
    ir: ExistingIR,
    tc: PumpInfo,
    t: Translations,
    locked: boolean,
) => {
    const rk = ir.RK.TC[tc.N];
    if (!rk) return undefined;
    const entries = rk.mapTo((year, check) => ({
        year, useRKTL: isRKTL(check),
    }));

    return entries.flatMap(check => [{
        text: `${t.rkt.year} ${check.year}`,
    }, {
        color: 'warning',
        icon: 'edit_document',
        text: t.detail.editCheck + iaA,
        href: iridUrl(`/${check.useRKTL ? 'RKTL' : 'RKT'}?pump=${tc.N}&edit-year=${check.year}`),
        disabled: locked,
    }]);
};

const getButtonUPS = (
    t: Translations,
    locked: boolean,
) => ({
    href: iridUrl('/UPS'),
    text: t.sol.commission,
    important: true,
    disabled: locked,
});
const getDropdownItemUPS = (
    t: Translations,
    user: { isAdmin: boolean; isRegulusOrAdmin: boolean },
    locked: boolean,
) => ({
    color: 'warning',
    icon: 'edit_document',
    text: t.detail.editProtocol + iaR(user.isAdmin),
    href: iridUrl(`/UPS?edit`),
    disabled: locked,
});

const getButtonRKS = (
    ir: ExistingIR,
    t: Translations,
    locked: boolean,
) => ({
    show: true,
    href: iridUrl(`/RKS`),
    text: t.rks.fillOut,
    important: rules.isImportantRKS(ir),
    disabled: locked,
});
const getDropdownItemsRKS = (
    ir: ExistingIR,
    t: Translations,
    locked: boolean,
) => {
    const rk = ir.RK.SOL;
    if (!rk) return undefined;
    const entries = rk.mapTo(year => ({ year }));

    return entries.flatMap(check => [{
        text: `${t.rkt.year} ${check.year}`,
    }, {
        color: 'warning',
        icon: 'edit_document',
        text: t.detail.editCheck + iaA,
        href: iridUrl(`/RKS?edit-year=${check.year}`),
        disabled: locked,
    }]);
};

const getButtonUPF = (
    t: Translations,
    locked: boolean,
) => ({
    href: iridUrl('/UPF'),
    text: t.fve.commission,
    important: true,
    disabled: locked,
});

const getButtonFT = (
    t: Translations,
    locked: boolean,
) => ({
    href: iridUrl('/FT'),
    text: t.ft.setUp,
    disabled: locked,
});

export const createDocumentLinks = (
    ir: ExistingIR, t: Translations, user: {
        isAdmin: boolean,
        isRegulusOrAdmin: boolean,
        allowUPT: boolean,
    },
) => {
    const links: DocumentLinkDefinition<Pdf<'IR' | ''>>[] = [];
    const add = <P extends Pdf<'IR' | ''>>(link: DocumentLinkDefinition<P>) => links.push(link);
    const locked = Boolean(ir.meta.flags.lockedFromSEIR2);

    if (rules.showRR(ir)) add({
        link: 'RR', name: t.rr.name,
        signed: ir.signatures?.RR?.state == 'signed',
    });

    if (rules.showNNR(ir)) add({
        link: 'NNR', name: t.nnr.title,
    });

    if (rules.showNNT(ir)) add({
        link: 'NNT', name: t.nnt.title,
    });

    if (rules.showTC(ir)) {
        add({
            link: rules.useUPTL(ir) ? 'UPTL' : 'UPT',
            disabled: rules.disableUPT(ir), name: t.tc.name,
            additionalButton: user.isRegulusOrAdmin || user.allowUPT ? getButtonUPT(t, locked) : undefined,
            dropdownItems: user.isRegulusOrAdmin ? [getDropdownItemUPT(t, user, locked)] : undefined,
            signed: ir.signatures?.UPT?.state == 'signed',
        });

        for (const tc of cascadePumps(ir.IN)) {
            add({
                link: rules.useRKTL(ir, tc) ? 'RKTL' : 'RKT', pump: tc.N,
                name: t.rkt.name(tc),
                disabled: rules.disableRKT(ir, tc),
                additionalButton: getButtonRKT(ir, tc, t, locked),
                dropdownItems: user.isAdmin ? getDropdownItemsRKT(ir, tc, t, locked) : undefined,
            });
        }
    }

    if (rules.showSOL(ir)) {
        add({
            link: 'UPS',
            disabled: rules.disableUPS(ir), name: t.sol.name,
            additionalButton: getButtonUPS(t, locked),
            dropdownItems: user.isRegulusOrAdmin ? [getDropdownItemUPS(t, user, locked)] : undefined,
            signed: ir.signatures?.UPS?.state == 'signed',
        });

        add({
            link: 'ZLS', name: t.zls.name,
            signed: ir.signatures?.ZLS?.state == 'signed',
        });

        add({
            link: 'RKS', name: t.rks.name, disabled: rules.disableRKS(ir),
            additionalButton: getButtonRKS(ir, t, locked),
            dropdownItems: user.isAdmin ? getDropdownItemsRKS(ir, t, locked) : undefined,
        });
    }

    if (rules.showFVE(ir)) add({
        link: 'UPF', disabled: rules.disableUPF(ir), name: t.fve.name,
        additionalButton: user.isRegulusOrAdmin ? getButtonUPF(t, locked) : undefined,
        signed: ir.signatures?.UPF?.state == 'signed',
    });

    if (rules.showFT(ir)) add({
        link: 'FT', disabled: rules.disableFT(ir), name: t.ft.title,
        additionalButton: getButtonFT(t, locked),
    });

    return links;
};