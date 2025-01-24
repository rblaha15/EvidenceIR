<script lang="ts" generics="D">
    import type { Translations } from '$lib/translations';
    import { nazevSHvezdou, type Pisatkova } from '$lib/Vec.svelte';
    import IMask, { InputMask } from 'imask';
    import { onDestroy, onMount } from 'svelte';

    interface Props {
        t: Translations;
        vec: Pisatkova<D>;
        data: D;
    }

    let { t, vec = $bindable(), data }: Props = $props();

    type MyOpts = {
        lazy: boolean;
        overwrite: boolean;
        mask: string;
        definitions: {
            [key: string]: RegExp;
        };
        value?: string;
    };

    const maybeCapitalized = (value: string, vec: Pisatkova<D>): string =>
        vec.capitalize(data) ? value.toUpperCase() : value;

    let input = $state<HTMLInputElement>();
    let mask = $state<InputMask<MyOpts>>();

    let opts = $derived(vec.maskOptions(data));

    let options = $derived(
        !opts
            ? undefined
            : ({
                lazy: true,
                overwrite: true,
                ...opts,
            } as MyOpts),
    );

    onMount(() => {
        if (options != undefined && input != undefined) {
            mask = IMask(input, options);
            mask.value = vec.value;
            mask.on('accept', () => vec.value = maybeCapitalized(mask!.value, vec));
        }
    });

    onDestroy(() => {
        mask = undefined;
    });

    $effect.pre(() => {
        mask?.updateValue();
    });

    $effect(() => {
        if (opts != undefined) mask?.updateOptions(opts);
    });

    vec.updateMaskValue = (text) => {
        if (mask) mask.value = text;
    };
</script>

{#if vec.zobrazit(data)}
    <label class="form-floating d-block mb-1">
        {#if options !== undefined}
            <input
                type={vec.type(data)}
                autocomplete={vec.autocomplete(data)}
                placeholder={nazevSHvezdou(vec, data, t)}
                class="form-control"
                bind:this={input}
                disabled={vec.lock(data)}
            />
        {:else}
            <input
                type={vec.type(data)}
                autocomplete={vec.autocomplete(data)}
                placeholder={nazevSHvezdou(vec, data, t)}
                class="form-control"
                bind:this={input}
                value={vec.value}
                oninput={() => {
					if (input) vec.value = maybeCapitalized(input.value, vec);
				}}
                disabled={vec.lock(data)}
            />
        {/if}
        <label for="">{nazevSHvezdou(vec, data, t)}</label>
    </label>

    {#if vec.zobrazitError(data)}
        <span class="text-danger help-block">{t.get(vec.onError(data))}</span>
    {/if}

    <div class="mb-2"></div>
{/if}
