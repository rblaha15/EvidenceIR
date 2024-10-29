<script lang="ts">
	import { run } from 'svelte/legacy';

	type D = $$Generic;
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type Pisatkova } from '$lib/Vec.svelte';
	import IMask, { InputMask } from 'imask';
	import { onDestroy, onMount } from 'svelte';

	interface Props {
		t: Translations;
		vec: Pisatkova<D>;
		type?: string;
		data: D;
		[key: string]: any;
	}

	let { t, vec = $bindable(), type = 'text', data, ...rest }: Props = $props();

	type MyOpts = {
		lazy: boolean;
		overwrite: boolean;
		mask: string;
		definitions: {
			[key: string]: RegExp;
		};
		value?: string;
	};

	let input = $state<HTMLInputElement>();
	let mask = $state<InputMask<MyOpts>>();

	let opts = $derived(vec.maskOptions(data));

	let options = $derived(
		!opts
			? undefined
			: ({
					lazy: true,
					overwrite: true,
					...opts
				} as MyOpts)
	);

	onMount(() => {
		if (options != undefined && input != undefined) {
			mask = IMask(input, options);
			mask.value = vec.value;
			mask.on('accept', (_) => (vec.value = mask!.value));
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

	vec.updateText = (text) => {
		vec.value = text;
		if (mask) mask.value = text;
	};
</script>

{#if vec.zobrazit(data)}
	<label class="form-floating d-block">
		{#if options != undefined}
			<input
				{type}
				placeholder={nazevSHvezdou(vec, data, t)}
				class="form-control"
				bind:this={input}
				{...rest}
			/>
		{:else}
			<input
				{type}
				placeholder={nazevSHvezdou(vec, data, t)}
				class="form-control"
				bind:this={input}
				value={vec.value}
				oninput={() => {
					if (input) vec.value = input.value;
				}}
				{...rest}
			/>
		{/if}
		<label for="">{nazevSHvezdou(vec, data, t)}</label>
	</label>

	{#if vec.zobrazitError(data)}
		<span class="text-danger help-block">{t.get(vec.onError(data))}</span>
	{/if}
{/if}
