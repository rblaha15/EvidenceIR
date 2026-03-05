import { InputWidget } from '$lib/forms/Widget.svelte';
import { type FormPlus } from '$lib/forms/Form';
import type { FormSZ, GenericFormSZ } from '$lib/forms/SP/formSZ';
import type { Translations } from '$lib/translations';

export const defaultGenericSZ = <D extends GenericFormSZ<D>>(
    descriptionRequired = false, showName = false, label: (t: Translations) => string = t => t.sz.interventionDescription,
): FormPlus<GenericFormSZ<D>> => ({
    zasah: {
        datum: new InputWidget({ label: t => t.sp.interventionDate, type: 'datetime-local' }),
        clovek: new InputWidget({ label: t => t.sp.technicianName, show: showName }),
        popis: new InputWidget({ label, required: descriptionRequired, textArea: true }),
    },
});

export default (): FormSZ => defaultGenericSZ(true, true);