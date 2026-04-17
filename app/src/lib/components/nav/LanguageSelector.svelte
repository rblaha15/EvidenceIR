<script lang="ts">
    import { languageNames } from '$lib/translations';
    import languageCodes, { type LanguageCode } from '$lib/languageCodes';
    import { Check, Languages } from "@lucide/svelte";

    const {
        onChange, options = languageCodes, selected, readonly,
    }: {
        onChange: (code: LanguageCode) => Promise<void> | void;
        options?: readonly LanguageCode[];
        selected: LanguageCode | string;
        readonly?: boolean;
    } = $props();
</script>

{#snippet value()}
    <Languages />
    <span class="mx-1">{selected.toUpperCase()}</span>
{/snippet}
{#snippet items()}
    {#each options.filter(it => it !== 'sk') as code}
        <li>
            <button
                class="dropdown-item flex items-center"
                class:active={selected === code}
                aria-pressed={selected === code}
                onclick={() => selected !== code ? onChange(code) : null}
            >
                <span class="text-xl me-2">{code.toUpperCase()}</span>
                {languageNames[code]}
                <Check class={['ms-auto', selected === code ? 'inline' : 'hidden']} />
            </button>
        </li>
    {/each}
{/snippet}

{#if readonly}
    {@render value()}
{:else}
    <div class="dropdown">
        <button class="btn py-2 px-2 dropdown-toggle flex items-center" data-bs-toggle="dropdown">
            {@render value()}
        </button>
        <ul class="dropdown-menu hidden">
            {@render items()}
        </ul>
    </div>
{/if}