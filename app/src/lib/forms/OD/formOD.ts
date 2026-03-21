import { FileWidget, InputWidget, PhotoSelectorWidget } from '../Widget.svelte.js';
import type { Form, Values } from '$lib/forms/Form';

export interface ContextOD {
    v: Values<FormOD>
}

export interface FormOD extends Form<ContextOD> {
    all: {
        documents: FileWidget<ContextOD>,
        photos: PhotoSelectorWidget<ContextOD>,
        body: InputWidget<ContextOD>,
        userEmail: InputWidget<ContextOD>,
        assemblyEmail: InputWidget<ContextOD>,
        otherCopies: InputWidget<ContextOD>,
    },
}
