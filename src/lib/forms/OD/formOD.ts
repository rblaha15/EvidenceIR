import { FileWidget, InputWidget, PhotoSelectorWidget } from '../Widget.svelte.js';
import type { Form } from '$lib/forms/Form';

export interface FormOD extends Form<FormOD> {
    all: {
        documents: FileWidget<FormOD>,
        photos: PhotoSelectorWidget<FormOD>,
        body: InputWidget<FormOD>,
        userEmail: InputWidget<FormOD>,
        otherCopies: InputWidget<FormOD>,
    },
}
