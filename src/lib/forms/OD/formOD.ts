import { FileWidget, InputWidget, PhotoSelectorWidget, TextWidget } from '../Widget.svelte.js';
import type { Form } from '$lib/forms/Form';

export interface FormOD extends Form<FormOD> {
    all: {
        documents: FileWidget<FormOD>,
        photos: PhotoSelectorWidget<FormOD>,
        note: InputWidget<FormOD>,
        userEmail: InputWidget<FormOD>,
        info: TextWidget<FormOD>,
    },
}
