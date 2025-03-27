<script lang="ts" generics="D">
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type SwitchWidget } from '$lib/Widget.svelte.js';

	interface Props {
		t: Translations;
		widget: SwitchWidget<D>;
		data: D;
	}

	let { t, widget = $bindable(), data }: Props = $props();
</script>

{#if widget.show(data)}
	<div class="d-flex align-items-center mb-3">
		<label class="me-2" for="">{nazevSHvezdou(widget, data, t)}</label>
		<div class="btn-group" role="group">
			{#each widget.options as moznost, i}
				<input
					type="radio"
					class="btn-check"
					bind:group={widget.value}
					value={Boolean(i)}
					id={widget.label(data) + Boolean(i)}
					autocomplete="off"
				/>
				<label class="btn btn-sm {widget.hasPositivity(data) && widget.value === Boolean(i) ? i === 1 ? 'btn-success' : 'btn-danger' : 'btn-secondary'}" for={widget.label(data) + Boolean(i)}
					>{t.get(moznost)}</label
				>
			{/each}
		</div>
	</div>

	{#if widget.showError(data)}
		<p class="text-danger">{t.get(widget.onError(data))}</p>
	{/if}
{/if}
