<script lang="ts" module>
    export interface MaskOptions {
        mask: string;
        definitions?: {
            [key: string]: RegExp;
        };
    }
</script>

<script lang="ts">
    import { type ComponentProps, onDestroy, onMount, untrack } from "svelte";
    import { InputGroupInput } from "$lib/components/ui/input-group";
    import IMask, { type InputMask } from "imask";

    let {
        ref = $bindable(null),
        value = $bindable(),
        options,
        onInput,
        ...props
    }: ComponentProps<typeof InputGroupInput> & {
        options: MaskOptions;
        value: string;
    } = $props();

    interface Options extends MaskOptions {
        lazy: boolean;
        overwrite: boolean;
        value?: string;
    }

    let mask = $state<InputMask<Options>>();

    onMount(() => {
        if (!ref) return;
        mask = IMask(ref, {
            lazy: true,
            overwrite: true,
            ...options,
        });
        mask.value = value;
        mask.on('accept', () => {
            const newValue = mask!.value;
            value = newValue;
            onInput?.(newValue);
        });
    });
    onDestroy(() => {
        mask = undefined;
    });
    $effect.pre(() => {
        mask?.updateValue();
    });
    $effect(() => {
        mask?.updateOptions(options);
    });
    $effect(() => {
        value;
        untrack(() => {
            if (mask) mask.value = value;
        });
    });
</script>

<InputGroupInput
    {...props}
    bind:ref
/>
