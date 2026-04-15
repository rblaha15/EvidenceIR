import { type FormPlus } from '$lib/forms/Form';
import type { FormSZ, GenericContextSZ, GenericFormSZ } from '$lib/forms/SP/formSZ';
import type { Translations } from '$lib/translations';
import { nowISO } from '$lib/helpers/date';
import { newInputWidget } from '../Widget';

export const defaultGenericSZ = <C extends GenericContextSZ<C>>(
    showName: (c: C) => boolean = () => false, descriptionRequired = false,
    label: (t: Translations) => string = t => t.sz.interventionDescription,
): FormPlus<GenericFormSZ<C>> => ({
    zasah: {
        datum: newInputWidget({ label: t => t.sp.interventionDate, type: 'datetime-local', text: nowISO() }),
        clovek: newInputWidget({ label: t => t.sp.technicianName, show: showName, lock: c => !!c.lockNameFields }),
        popis: newInputWidget({ label, required: descriptionRequired, textArea: true }),
    },
});

export default (): FormSZ => defaultGenericSZ(() => true, true);