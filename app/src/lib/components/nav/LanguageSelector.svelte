<script lang="ts">
    import { languageCodes, type LanguageCode } from '$lib/languages';
	import { languageNames } from '$lib/translations';

    const {
        onChange, options = languageCodes, selected,
    }: {
        onChange: (code: LanguageCode) => Promise<void> | void;
        options?: readonly LanguageCode[];
        selected: LanguageCode | string;
    } = $props();
</script>

<div class="dropdown">
	<button class="btn py-2 px-2 dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
        <span class="material-icons">language</span>
		<span class="mx-1">{selected.toUpperCase()}</span>
	</button>
	<ul class="dropdown-menu">
		{#each options.filter(it => it !== 'sk') as code}
			<li>
				<button
					class="dropdown-item d-flex align-items-center"
					class:active={selected === code}
					aria-pressed={selected === code}
					onclick={() => selected !== code ? onChange(code) : null}
				>
					<span class="fs-6 me-2">{code.toUpperCase()}</span>
					{languageNames[code]}
                    <span class="material-icons ms-auto" class:d-none={selected !== code}>check</span>
				</button>
			</li>
		{/each}
	</ul>
</div>
