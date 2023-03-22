<script lang="ts">
	import type { Pisatkova } from '$lib/Vec';
	import MaskInput from 'svelte-input-mask';

	export let vec: Pisatkova;
	export let w: string = '100';
</script>

{#if vec.zobrazit}
	{#if vec.napoveda != ''}
		<!-- svelte-ignore a11y-label-has-associated-control -->
		<label class="w-{w}">
			{vec.nazev}
			<MaskInput
				type="text"
				class="form-control"
				bind:value={vec.text}
				mask={vec.napoveda}
				placeholder={vec.napoveda}
				on:change={({ detail }) => (vec.text = detail.inputState.maskedValue)}
				maskFormat={[
					{
						str: 'A',
						regexp: /[A-Z]/
					},
					{
						str: 'B',
						regexp: /[A-Z]/
					},
					{
						str: 'C',
						regexp: /[A-Z]/
					},
					{
						str: 'D',
						regexp: /[A-Z]/
					},
					{
						str: '9',
						regexp: /[1-9OND]/
					},
					{
						str: '1',
						regexp: /\d/
					},
					{
						str: '2',
						regexp: /\d/
					},
					{
						str: '3',
						regexp: /\d/
					},
					{
						str: '4',
						regexp: /\d/
					},
					{
						str: '5',
						regexp: /\d/
					},
					{
						str: '6',
						regexp: /\d/
					},
					{
						str: '7',
						regexp: /\d/
					},
					{
						str: '8',
						regexp: /\d/
					}
				]}
				{...$$restProps}
			/>
		</label>
	{:else}
		<label class="w-{w}">
			{vec.nazev}
			<input type="text" class="form-control" bind:value={vec.text} {...$$restProps} />
		</label>
	{/if}

	{#if vec.zobrazitError}
		<span class="text-danger help-block">{vec.onError}</span>
	{/if}
{/if}
