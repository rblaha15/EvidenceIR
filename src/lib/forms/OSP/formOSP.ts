import { FileWidget, InputWidget, PhotoSelectorWidget, TextWidget } from '../Widget.svelte.js';
import type { Form } from '$lib/forms/Form';

export interface FormOSP extends Form<void> {
    all: {
        file: FileWidget<void>,
        photos: PhotoSelectorWidget<void>,
        note: InputWidget<void>,
        info: TextWidget<void>,
    },
}
