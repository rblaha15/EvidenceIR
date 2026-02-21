import type { Pdf, PdfParameters } from '$lib/pdf/pdf';
import type { Snippet } from 'svelte';
import type { Color } from '$lib/forms/Widget.svelte.js';
import type { ExistingIR } from '$lib/data';
import * as rules from './documentLinkRules';
import type { Translations } from '$lib/translations';
import { iridUrl } from '$lib/helpers/runes.svelte.js';
import { iaA, iaR } from '$lib/helpers/stores';
import { cascadePumps, type PumpInfo } from '$lib/forms/IN/infoIN';
import { isRKTL } from '$lib/forms/RKT/infoRKT';

export type DocumentLinkDefinition<P extends Pdf> = PdfParameters<P> & {
    link: P,
    name?: string;
    disabled?: boolean;
    additionalButton?: {
        important?: boolean,
        text: string,
        show?: boolean,
    } & ({
        href: string, dialogID?: undefined,
    } | {
        dialogID: string, href?: undefined,
    }),
    dropdownItems?: ({
        hide?: boolean,
        text: string,
    } | {
        color: Color,
        icon: string,
        hide?: boolean,
        text: string,
        href: string,
    } | {
        hide?: boolean,
        item: Snippet,
    })[]
}

const getButtonUPT = (
    t: Translations,
) => ({
    href: iridUrl('/UPT'),
    text: t.tc.commission,
    important: true,
});
const getDropdownItemUPT = (
    t: Translations,
    user: { isAdmin: boolean; isRegulusOrAdmin: boolean },
) => ({
    color: 'warning',
    icon: 'edit_document',
    text: t.detail.editProtocol + iaR(user.isAdmin),
    href: iridUrl(`/UPT/?edit`),
});

const getButtonRKT = (
    ir: ExistingIR,
    tc: PumpInfo,
    t: Translations,
) => ({
    show: true,
    ...rules.showRefsiteDialog(ir)
        ? { dialogID: `refsiteModal-${tc.N}` }
        : { href: iridUrl(`/RKT?pump=${tc.N}`) },
    text: t.rkt.fillOut(tc),
    important: rules.isImportantRKT(ir),
});
const getDropdownItemsRKT = (
    ir: ExistingIR,
    tc: PumpInfo,
    t: Translations,
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
    }]);
};

const getButtonUPS = (
    t: Translations,
) => ({
    href: iridUrl('/UPS'),
    text: t.sol.commission,
    important: true,
});
const getDropdownItemUPS = (
    t: Translations,
    user: { isAdmin: boolean; isRegulusOrAdmin: boolean },
) => ({
    color: 'warning',
    icon: 'edit_document',
    text: t.detail.editProtocol + iaR(user.isAdmin),
    href: iridUrl(`/UPS?edit`),
});

const getButtonRKS = (
    ir: ExistingIR,
    t: Translations,
) => ({
    show: true,
    href: iridUrl(`/RKS`),
    text: t.rks.fillOut,
    important: rules.isImportantRKS(ir),
});
const getDropdownItemsRKS = (
    ir: ExistingIR,
    t: Translations,
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
    }]);
};

const getButtonUPF = (
    t: Translations,
) => ({
    href: iridUrl('/UPF'),
    text: t.fve.commission,
    important: true,
});

const getButtonFT = (
    t: Translations,
) => ({
    href: iridUrl('/FT'),
    text: t.ft.setUp,
});

export const createDocumentLinks = (
    ir: ExistingIR, t: Translations, user: {
        isAdmin: boolean,
        isRegulusOrAdmin: boolean,
    },
) => {
    const links: DocumentLinkDefinition<Pdf<'IR' | ''>>[] = [];
    const add = <P extends Pdf<'IR' | ''>>(link: DocumentLinkDefinition<P>) => links.push(link);

    if (rules.showRR(ir)) add({
        link: 'RR', name: t.rr.name,
    });

    if (rules.showNNR(ir)) add({
        link: 'NNR', name: t.nnr.title,
    });

    if (rules.showNNT(ir)) add({
        link: 'NNT', name: t.nnt.title,
    });

    if (rules.showTC(ir)) {
        add({
            link: 'UPT', disabled: rules.disableUPT(ir), name: t.tc.name,
            additionalButton: getButtonUPT(t),
            dropdownItems: user.isRegulusOrAdmin ? [getDropdownItemUPT(t, user)] : undefined,
        });

        for (const tc of cascadePumps(ir.IN)) {
            add({
                link: 'ZLT', name: t.zlt.name(tc), pump: tc.N,
            });

            add({
                link: rules.useRKTL(ir, tc) ? 'RKTL' : 'RKT', pump: tc.N,
                name: t.rkt.name(tc),
                disabled: rules.disableRKT(ir, tc),
                additionalButton: getButtonRKT(ir, tc, t),
                dropdownItems: user.isAdmin ? getDropdownItemsRKT(ir, tc, t) : undefined,
            });
        }
    }

    if (rules.showSOL(ir)) {
        add({
            link: 'UPS',
            disabled: rules.disableUPS(ir), name: t.sol.name,
            additionalButton: getButtonUPS(t),
            dropdownItems: user.isRegulusOrAdmin ? [getDropdownItemUPS(t, user)] : undefined,
        });

        add({
            link: 'ZLS', name: t.zls.name,
        });

        add({
            link: 'RKS', name: t.rks.name, disabled: rules.disableRKS(ir),
            additionalButton: getButtonRKS(ir, t),
            dropdownItems: user.isAdmin ? getDropdownItemsRKS(ir, t) : undefined,
        });
    }

    if (rules.showFVE(ir)) add({
        link: 'UPF', disabled: rules.disableUPF(ir), name: t.fve.name,
        additionalButton: getButtonUPF(t),
    });

    if (rules.showFT(ir)) add({
        link: 'FT', disabled: rules.disableFT(ir), name: t.fve.name,
        additionalButton: getButtonFT(t),
    });

    return links;
};