import arrays, { type SparePart } from '$lib/client/db/arrays';
import { type FormGroupPlus, type FormPlus } from '$lib/forms/Form';
import type { FormSZ, GenericContextSZ, GenericFormSZ, SimpleSparePartWidgetGroup } from '$lib/forms/SP/formSZ';
import { nowISO } from '$lib/helpers/date';
import type { Translations } from '$lib/translations';
import { newCounterWidget, newInputWidget, newSearchWidget, newTitleWidget } from '../Widget';

const sparePart = <C extends GenericContextSZ<C>>(n: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13): FormGroupPlus<SimpleSparePartWidgetGroup<C>> => {
    const show = (c: C) => c.v.nahradniDily.pocet >= n;
    const dil = (c: C) => c.v[`nahradniDil${n}` as const];

    return ({
        _label: newTitleWidget({
            show, text: t => t.sp.sparePart(n), level: 3,
        }),
        dil: newSearchWidget({
            items: arrays.spareParts,
            required: false, show, hideInRawData: true, label: t => t.sp.searchItem,
            onValueSet: (c, part) => {
                const nd = dil(c);
                nd.code = part?.code?.let(String) ?? '';
                nd.name = part?.name ?? '';
                nd.dil = null;
            }, getSearchItem: (i: SparePart) => ({
                pieces: [
                    { text: i.code.toString(), width: .08 },
                    { text: i.name, width: .92 },
                ] as const,
            }), showInXML: false,
        }),
        name: newInputWidget({
            label: t => t.sp.name, required: show, show,
        }),
        code: newInputWidget({
            label: t => t.sp.code, type: 'number', required: false, show,
        }),
        mnozstvi: newInputWidget({
            label: t => t.sp.amount, type: `number`, onError: t => t.wrong.number, text: '1',
            required: show, show,
        }),
    });
};

export const defaultGenericSZ = <C extends GenericContextSZ<C>>(
    showName: (c: C) => boolean = () => false, descriptionRequired = false,
    label: (t: Translations) => string = t => t.sz.interventionDescription,
): FormPlus<GenericFormSZ<C>> => ({
    zasah: {
        datum: newInputWidget({
            label: t => t.sp.interventionDate, type: 'datetime-local',
            text: nowISO(), lock: c => !!c.edit,
        }),
        clovek: newInputWidget({ label: t => t.sp.technicianName, show: showName }),
        userEmail: newInputWidget({ label: t => t.sp.technicianEmail, show: showName }),
        popis: newInputWidget({ label, required: descriptionRequired, textArea: true }),
    },
    ukony: {
        doba: newInputWidget({
            label: t => t.sp.billedTime, type: 'number', required: false,
            onError: t => t.wrong.number, suffix: t => t.units.h, show: c => !c.isBaseSZ
        }),
        doprava: newInputWidget({
            label: t => t.sp.transportation, type: 'number', required: false,
            onError: t => t.wrong.number, suffix: t => t.units.km, show: c => !c.isBaseSZ
        }),
    },
    nahradniDily: {
        _title: newTitleWidget<C>({ text: t => t.sp.usedSpareParts, level: 2, show: c => !c.isBaseSZ }),
        pocet: newCounterWidget({
            label: t => t.sp.sparePartCount, min: 0, max: 13, chosen: 0, show: c => !c.isBaseSZ
        }),
    },
    nahradniDil1: sparePart(1),
    nahradniDil2: sparePart(2),
    nahradniDil3: sparePart(3),
    nahradniDil4: sparePart(4),
    nahradniDil5: sparePart(5),
    nahradniDil6: sparePart(6),
    nahradniDil7: sparePart(7),
    nahradniDil8: sparePart(8),
    nahradniDil9: sparePart(9),
    nahradniDil10: sparePart(10),
    nahradniDil11: sparePart(11),
    nahradniDil12: sparePart(12),
    nahradniDil13: sparePart(13),
});

export default (): FormSZ => defaultGenericSZ(() => true, true);