import { FileWidget, InputWidget, PhotoSelectorWidget, TextWidget } from '$lib/forms/Widget.svelte';
import { p } from '$lib/translations';
import type { FormOSP } from './formOSP';
import { cervenka } from '$lib/client/email';
import { currentUser } from '$lib/client/auth';
import { get } from 'svelte/store';

export default (): FormOSP => ({
    all: {
        file: new FileWidget({ label: p('PDF soubor s podepsaným servisním protokolem'), accept: 'application/pdf' }),
        photos: new PhotoSelectorWidget({ label: p('Fotografie z instalace'), multiple: true, max: 5, required: false }),
        note: new InputWidget({ label: p('Poznámka (do emailu)'), required: false, textArea: true }),
        info: new TextWidget({ text: () => p(`Aplikace odešle email s protokolem, popř. s obrázky a poznámkou na ${cervenka.join(' a ')}. Kopie vám bude odeslána na ${get(currentUser)!.email}.`) }),
    }
});