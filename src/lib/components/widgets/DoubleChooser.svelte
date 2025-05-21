<script generics="D, I1 extends TranslationReference, I2 extends TranslationReference" lang="ts">
    import { onMount } from 'svelte';
    import type { Action } from 'svelte/action';
    import type { TranslationReference, Translations } from '$lib/translations';
    import { type DoubleChooserWidget, labelAndStar } from '$lib/Widget.svelte.js';

    interface Props {
        t: Translations;
        widget: DoubleChooserWidget<D, I1, I2>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const onChange1 = (
        e: Event & {
            currentTarget: HTMLSelectElement;
        }
    ) =>
        widget.mutateValue(data, v => ({ ...v, first: e.currentTarget.value as I1 }));
    const onChange2 = (
        e: Event & {
            currentTarget: HTMLSelectElement;
        }
    ) =>
        widget.mutateValue(data, v => ({ ...v, second: e.currentTarget.value as I2 }));

    let mounted = false;
    onMount(() => (mounted = true));
    const Select: Action<HTMLSelectElement> = (e) => {
        if (mounted) e.showPicker();
    };
</script>

{#if widget.show(data)}
    <div class="input-group">
        <label class="form-floating d-block left">
            <select class="form-select" value={widget.value.first ?? 'notChosen'}
                    disabled={widget.lock1(data)} onchange={onChange1}>
                <option class="d-none" value="notChosen">{t.notChosen}</option>
                {#each widget.options1(data) as moznost}
                    <option value={moznost}>{t.get(moznost)}</option>
                {/each}
            </select>
            <label for="">{labelAndStar(widget, data, t)}</label>
        </label>
        {#if widget.value.first != null && widget.options2(data).length > 0}
            <select
                class="form-select right"
                id={labelAndStar(widget, data, t)}
                value={widget.value.second ?? 'notChosen'}
                disabled={widget.options2(data).length < 2 || widget.lock2(data)}
                onchange={onChange2}
                use:Select
            >
                <option class="d-none" value="notChosen">{t.notChosen}</option>
                {#each widget.options2(data) as moznost}
                    <option value={moznost}>{t.get(moznost)}</option>
                {/each}
            </select>
        {/if}
    </div>
    {#if widget.showError(data)}
        <p class="text-danger mt-1">{t.get(widget.onError(data, t))}</p>
    {/if}
    <div class="mb-3"></div>
{/if}

<style>
    .left {
        width: 70%;
        max-width: 70%;
    }

    .right {
        width: 30%;
    }
</style>
