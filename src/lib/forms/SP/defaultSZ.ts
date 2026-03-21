import { InputWidget } from '$lib/forms/Widget.svelte';
import { type FormPlus } from '$lib/forms/Form';
import type { FormSZ, GenericContextSZ, GenericFormSZ } from '$lib/forms/SP/formSZ';
import type { Translations } from '$lib/translations';
import { nowISO } from '$lib/helpers/date';

export const defaultGenericSZ = <C extends GenericContextSZ<C>>(
    showName: (c: C) => boolean = () => false, descriptionRequired = false,
    label: (t: Translations) => string = t => t.sz.interventionDescription,
): FormPlus<GenericFormSZ<C>> => ({
    zasah: {
        datum: new InputWidget({ label: t => t.sp.interventionDate, type: 'datetime-local', text: nowISO() }),
        clovek: new InputWidget({ label: t => t.sp.technicianName, show: showName, lock: c => !!c.lockNameFields }),
        popis: new InputWidget({ label, required: descriptionRequired, textArea: true }),
    },
});

export default (): FormSZ => defaultGenericSZ(() => true, true);