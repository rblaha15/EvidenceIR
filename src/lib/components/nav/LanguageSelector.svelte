<script lang="ts">
    import { type LanguageCode, languageCodes } from '$lib/languages';
    import { languageNames } from '$lib/translations';
    import Icon from '$lib/components/Icon.svelte';

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
    <Icon icon="language" />
    <span class="mx-1">{selected.toUpperCase()}</span>
{/snippet}
{#snippet items()}
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
                <Icon icon="check" class={['ms-auto', selected === code ? 'd-inline' : 'd-none']} />
            </button>
        </li>
    {/each}
{/snippet}

{#if readonly}
    {@render value()}
{:else}
    <div class="dropdown">
        <button class="btn py-2 px-2 dropdown-toggle d-flex align-items-center" data-bs-toggle="dropdown">
            {@render value()}
        </button>
        <ul class="dropdown-menu">
            {@render items()}
        </ul>
    </div>
{/if}