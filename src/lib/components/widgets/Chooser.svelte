<script generics="D, I extends TranslationReference" lang="ts">
	import type { TranslationReference, Translations } from '$lib/translations';
	import { labelAndStar, type ChooserWidget } from '$lib/forms/Widget.svelte.js';

	interface Props {
        t: Translations;
        widget: ChooserWidget<D, I>;
        data: D;
    }

    let { t, widget = $bindable(), data }: Props = $props();

    const onChange = (
        e: Event & {
            currentTarget: HTMLSelectElement;
        }
    ) => (widget.setValue(data, e.currentTarget.value as I));
</script>

<div class="d-flex gap-1 flex-column">
    <label class="form-floating d-block">
        <select class="form-select" value={widget.value ?? 'notChosen'} onchange={onChange} disabled={widget.lock(data)}>
            <option class="d-none" value='notChosen'>{t.notChosen}</option>
            {#each widget.options(data) as moznost}
                <option value={moznost}>{t.get(moznost)}</option>
            {/each}
        </select>
        <label for="">{labelAndStar(widget, data, t)}</label>
    </label>

    {#if widget.showError(data)}
        <span class="text-danger">{t.get(widget.onError(data, t))}</span>
    {/if}
</div>