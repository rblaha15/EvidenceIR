<script type="ts">
	import type { Vec } from '$lib/Vec';
	import MaskInput from 'svelte-input-mask';

	export let vec: Vec;
</script>

{#if vec.zobrazit}
	<label for={vec.nazev}>{vec.nazev}</label>
	{#if vec.vybrano != ''}
		<MaskInput
			id={vec.nazev}
			type="text"
			class="form-control"
			bind:value={vec.text}
			mask={vec.vybrano}
			placeholder={vec.vybrano}
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
		/>
	{:else}
		<input id={vec.nazev} type="text" class="form-control" bind:value={vec.text} />
	{/if}

	{#if vec.zobrazitError}
		<span class="text-danger help-block">{vec.onError}</span>
	{/if}
{/if}
