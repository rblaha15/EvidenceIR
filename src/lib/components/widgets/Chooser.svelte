<script lang="ts" generics="D">
	import type { TranslationReference, Translations } from '$lib/translations';
	import { nazevSHvezdou, type ChooserWidget } from '$lib/Widget.svelte.js';

	interface Props {
        t: Translations;
        widget: ChooserWidget<D>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const onChange = (
        e: Event & {
            currentTarget: HTMLSelectElement;
        }
    ) => (widget.value = e.currentTarget.value as TranslationReference);
</script>

<div class="mb-3">
    {#if widget.show(data)}
        <label class="form-floating d-block">
            <select class="form-select" value={widget.value ?? 'notChosen'} onchange={onChange}>
                <option class="d-none" value='notChosen'>{t.notChosen}</option>
                {#each widget.options(data) as moznost}
                    <option value={moznost}>{t.get(moznost)}</option>
                {/each}
            </select>
            <label for="">{nazevSHvezdou(widget, data, t)}</label>
        </label>

        {#if widget.showError(data)}
            <p class="text-danger">{t.get(widget.onError(data))}</p>
        {/if}
    {/if}
</div>