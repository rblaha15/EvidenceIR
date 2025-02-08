<script lang="ts" generics="D">
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type CheckboxWidget } from '$lib/Widget.svelte.js';

	interface Props {
		t: Translations;
		widget: CheckboxWidget<D>;
		data: D;
	}

	let { t, widget = $bindable(), data }: Props = $props();
</script>

{#if widget.show(data)}
	<div class="form-check mb-3">
		<label class="form-check-label">
			<input class="form-check-input" type="checkbox" disabled={widget.lock(data)} bind:checked={widget.value} />
			{nazevSHvezdou(widget, data, t)}
		</label>
	</div>

	{#if widget.showError(data)}
		<p class="text-danger">{t.get(widget.onError(data))}</p>
	{/if}
{/if}
