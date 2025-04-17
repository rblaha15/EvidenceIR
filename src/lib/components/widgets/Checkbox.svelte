<script generics="D" lang="ts">
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type CheckboxWidget } from '$lib/Widget.svelte.js';

	interface Props {
		t: Translations;
		widget: CheckboxWidget<D>;
		data: D;
	}

	let { t, widget = $bindable(), data }: Props = $props();
	const value = $derived(widget.bindableValue(data))
</script>

{#if widget.show(data)}
	<div class="form-check mb-3">
		<label class="form-check-label">
			<input class="form-check-input" type="checkbox" disabled={widget.lock(data)} bind:checked={value.value} />
			{nazevSHvezdou(widget, data, t)}
		</label>
	</div>

	{#if widget.showError(data)}
		<p class="text-danger">{t.get(widget.onError(data, t))}</p>
	{/if}
{/if}
