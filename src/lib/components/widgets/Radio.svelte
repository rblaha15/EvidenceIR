<script lang="ts" generics="D">
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type RadioWidget } from '$lib/Widget.svelte.js';

	interface Props {
		t: Translations;
		widget: RadioWidget<D>;
		data: D;
	}

	let { t, widget = $bindable(), data }: Props = $props();
</script>

{#if widget.show(data)}
	<label class="d-block" for="">{nazevSHvezdou(widget, data, t)}</label>
	{#each widget.options(data) as moznost}
		<div class="form-check">
			<label class="form-check-label">
				{t.get(moznost)}
				<input type="radio" class="form-check-input" bind:group={widget.value} value={moznost} />
			</label>
		</div>
	{/each}

	<div class="mb-2"></div>

	{#if widget.showError(data)}
		<p class="text-danger">{t.get(widget.onError(data))}</p>
	{/if}
{/if}
