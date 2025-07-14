import { FileWidget, InputWidget, PhotoSelectorWidget, TextWidget } from '$lib/forms/Widget.svelte';
import { p } from '$lib/translations';
import type { FormOD } from './formOD';
import { cervenka } from '$lib/client/email';
import { currentUser } from '$lib/client/auth';
import { get } from 'svelte/store';

export default (): FormOD => ({
    all: {
        documents: new FileWidget({ label: p('PDF soubory s podepsanými dokumenty'), multiple: true, max: 5, accept: 'application/pdf' }),
        photos: new PhotoSelectorWidget({ label: p('Fotografie z instalace'), multiple: true, max: 5, required: false }),
        note: new InputWidget({ label: p('Poznámka (do emailu)'), required: false, textArea: true }),
        userEmail: new InputWidget({
            label: p('Emailová adresa zákazníka'), required: false, type: 'email',
            onError: `wrongEmailFormat`, regex: /^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/,
        }),
        info: new TextWidget({ text: d => p(`Aplikace odešle email s dokumenty, popř. s obrázky a poznámkou na ${cervenka.join(' a ')}. Kopie bude odeslána ${d.all.userEmail.value ? `zákazníkovi na adresu ${d.all.userEmail.value} a ` : ''}vám na ${get(currentUser)!.email}.${d.all.userEmail.value ? ` Pokud nechcete odeslat email zákazníkovi, odstraňtě jeho adresu z políčka výše.` : ''}`) }),
    },
});