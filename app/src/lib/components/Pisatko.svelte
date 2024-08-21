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

	$: opts = vec.maskOptions({ t, data });

	$: options = !opts
		? undefined
		: ({
				lazy: false,
				overwrite: true,
				...opts
			} as MyOpts);

	onMount(() => {
		if (options != undefined) {
			mask = IMask(input, options);
			mask.value = vec.text;
			mask.on("accept", _ => vec.text = mask!.value)
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

	vec.updateText = ((text) => {
		vec.text = text
		if (mask) mask.value = text
	})
</script>

{#if vec.zobrazit({ t, data })}
	{#if options != undefined}
		<label class="w-{w}">
			{nazevSHvezdou(vec, { t, data })}
			<input {type} class="form-control" bind:this={input} {...$$restProps} />
		</label>
	{:else}
		<label class="w-{w}">
			{nazevSHvezdou(vec, { t, data })}
			<input
				{type}
				class="form-control"
				bind:this={input}
				value={vec.text}
				on:input={() => (vec.text = input.value)}
				{...$$restProps}
			/>
		</label>
	{/if}

	{#if vec.zobrazitError({ t, data })}
		<span class="text-danger help-block">{vec.onError({ t, data })}</span>
	{/if}
{/if}
