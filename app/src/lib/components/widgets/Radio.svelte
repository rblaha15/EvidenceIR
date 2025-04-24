<script generics="D" lang="ts">
	import type { TranslationReference, Translations } from '$lib/translations';
	import { nazevSHvezdou, type RadioWidget } from '$lib/Widget.svelte.js';

	interface Props {
		t: Translations;
		widget: RadioWidget<D>;
		data: D;
	}

	let { t, widget = $bindable(), data }: Props = $props();
	const value = $derived(widget.bindableValue(data))

	const onClick = (item: TranslationReference) => () => {
		widget.setValue(data, item);
	};

	const uid = $props.id();
</script>

{#if widget.show(data)}
	<label class="d-block" for="">{nazevSHvezdou(widget, data, t)}</label>
	<div class="input-group input-group-grid">
		{#each widget.options(data) as item}
			<button class="input-group-text input-group-input first" onclick={onClick(item)}
					aria-labelledby="label-{uid}-{item}" tabindex="-1"
			>
				<input class="form-check-input m-0" type="radio" role="button"
					   bind:group={value.value} value={item} />
			</button>
			<button onclick={onClick(item)} tabindex="-1"
					id="label-{uid}-{item}" class="input-group-text last"
			>{t.get(item)}</button>
		{/each}
	</div>

	<div class="mb-2"></div>

	{#if widget.showError(data)}
		<p class="text-danger">{t.get(widget.onError(data, t))}</p>
	{/if}
{/if}
