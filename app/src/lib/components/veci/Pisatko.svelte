<script lang="ts">
	import type { Data } from '$lib/Data';
	import type { Translations } from '$lib/translations';
	import { nazevSHvezdou, type Pisatkova } from '$lib/Vec';
	import IMask, { InputMask } from 'imask';
	import { onDestroy, onMount } from 'svelte';

	export let t: Translations;
	export let vec: Pisatkova;
	export let type: string = 'text';
	export let w: string = '100';
	export let data: Data;

	type MyOpts = {
		lazy: boolean;
		overwrite: boolean;
		mask: string;
		definitions: {
			[key: string]: RegExp;
		};
		value?: string;
	};

	let input: HTMLInputElement;
	let mask: InputMask<MyOpts> | undefined = undefined;

	$: opts = vec.maskOptions(data);

	$: options = !opts
		? undefined
		: ({
				lazy: true,
				overwrite: true,
				...opts
			} as MyOpts);

	onMount(() => {
		if (options != undefined) {
			mask = IMask(input, options);
			mask.value = vec.value;
			mask.on('accept', (_) => (vec.value = mask!.value));
		}
	});

	onDestroy(() => {
		mask = undefined;
	});

	$: {
		mask?.updateValue();
	}

	$: {
		if (opts != undefined) mask?.updateOptions(opts);
	}

	vec.updateText = (text) => {
		vec.value = text;
		if (mask) mask.value = text;
	};
</script>

{#if vec.zobrazit(data)}
	{#if options != undefined}
		<input
			{type}
			placeholder={nazevSHvezdou(vec, data, t)}
			class="form-control w-{w}"
			bind:this={input}
			{...$$restProps}
		/>
	{:else}
		<input
			{type}
			placeholder={nazevSHvezdou(vec, data, t)}
			class="form-control w-{w}"
			bind:this={input}
			value={vec.value}
			on:input={() => (vec.value = input.value)}
			{...$$restProps}
		/>
	{/if}

	{#if vec.zobrazitError(data)}
		<span class="text-danger help-block">{t.get(vec.onError(data))}</span>
	{/if}
{/if}
