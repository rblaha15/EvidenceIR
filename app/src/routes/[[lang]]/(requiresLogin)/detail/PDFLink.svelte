<script generics="P extends Pdf" lang="ts">
    import { type Translations } from '$lib/translations';
    import { type DataOfPdf, type OpenPdfOptions, type Pdf } from '$lib/pdf/pdf';
    import type { Snippet } from 'svelte';
    import { generatePdfPreviewUrl } from '../../helpers';
    import { currentPreferredDocumentLanguage } from '$lib/languages';
    import type { ClassValue } from 'svelte/elements';

    type Props<P extends Pdf> = OpenPdfOptions<P> & {
        data: DataOfPdf<P>;
        name?: string;
        t: Translations;
        disabled?: boolean;
        additionalButton?: {
            important?: boolean,
            href: string,
            text: string,
            show?: boolean,
        },
        dropdownItems?: ({
            color: 'warning' | 'danger' | 'primary',
            icon: string,
            hide?: boolean,
        } & ({
            text: string,
            href: string,
        } | {
            item: Snippet<[klass: ClassValue]>,
        }))[]
    }

    const {
        name,
        t,
        disabled,
        dropdownItems,
        additionalButton,
        data,
        ...options
    }: Props<P> = $props();

    const o = $derived({
        ...options,
        lang: $currentPreferredDocumentLanguage,
    } as unknown as OpenPdfOptions<P>);
</script>

<div class="d-flex flex-row align-items-center column-gap-3 row-gap-1 flex-wrap">
    {#if !disabled}
        <div class="d-flex flex-row gap-3 flex-shrink-0">
            <a
                href={generatePdfPreviewUrl(o).href}
                class="link-offset-1 btn btn-link"
                tabindex="0"
                style="--bs-btn-padding-x: 0rem"
            >
                <span class="material-icons">file_open</span>
                {#if name}<span>{name}</span>{/if}
            </a>
            {#if dropdownItems}
                <button type="button" class="btn btn-outline-secondary" style="--bs-btn-padding-x: 0" data-bs-toggle="dropdown"
                        aria-expanded="false">
                    <span class="material-icons">more_vert</span>
                    <span class="visually-hidden">Toggle dropdown with other options</span>
                </button>
                <ul class="dropdown-menu">
                    {#each dropdownItems ?? [] as item}
                        {#if !item.hide}
                            <li><span class="d-flex align-items-center dropdown-item">
                            <span class="text-{item.color} material-icons">{item.icon}</span>
                                {#if 'text' in item}
                                <a class="text-{item.color} dropdown-item" href={item.href}>{item.text}</a>
                            {:else}
                                {@render item.item(`text-${item.color} dropdown-item`)}
                            {/if}
                        </span></li>
                        {/if}
                    {/each}
                </ul>
            {/if}
        </div>
    {:else if name}
        <span class="my-1 flex-shrink-0">{name}</span>
    {/if}

    {#if additionalButton}
        <div class="flex-shrink-0">
            {#if additionalButton.show ?? disabled}
                <a
                    tabindex="0"
                    class={['btn d-block', additionalButton.important ? 'btn-primary' : 'btn-outline-primary' ]}
                    href={additionalButton.href}
                >{additionalButton.text}</a>
            {/if}
        </div>
    {/if}
</div>