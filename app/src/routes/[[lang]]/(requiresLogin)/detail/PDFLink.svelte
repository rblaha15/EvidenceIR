<script generics="P extends Pdf" lang="ts">
    import type { Translations } from '$lib/translations';
    import { type DataOfPdf, type OpenPdfOptions, type Pdf } from '$lib/pdf/pdf';
    import type { Snippet } from 'svelte';
    import { currentPreferredDocumentLanguage } from '$lib/languages';
    import type { Color } from '$lib/forms/Widget.svelte';
    import Icon from '$lib/components/Icon.svelte';
    import { generatePdfPreviewUrl } from '$lib/helpers/files';
    import type { LanguageCode } from '$lib/languageCodes';

    type Props<P extends Pdf> = OpenPdfOptions<P> & {
        data: DataOfPdf<P>;
        name?: string;
        t: Translations;
        lang: LanguageCode;
        disabled?: boolean;
        additionalButton?: {
            important?: boolean,
            text: string,
            show?: boolean,
        } & ({
            href: string, dialogID?: undefined,
        } | {
            dialogID: string, href?: undefined,
        }),
        dropdownItems?: ({
            hide?: boolean,
            text: string,
        } | {
            color: Color,
            icon: string,
            hide?: boolean,
            text: string,
            href: string,
        } | {
            hide?: boolean,
            item: Snippet,
        })[]
    }

    const {
        name,
        t,
        lang,
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

<div class={["d-flex column-gap-3 row-gap-1", lang === 'de' ? 'flex-column align-items-start' : 'flex-wrap align-items-center']}>
    {#if !disabled}
        <div class="d-flex flex-row gap-3 flex-shrink-0">
            <a
                href={generatePdfPreviewUrl(o).href}
                class="link-offset-1 btn btn-link"
                tabindex="0"
                style="--bs-btn-padding-x: 0rem"
            >
                <Icon icon="file_open" />
                {#if name}<span>{name}</span>{/if}
            </a>
            {#if dropdownItems}
                <button type="button" class="btn btn-outline-secondary" style="--bs-btn-padding-x: 0" data-bs-toggle="dropdown"
                        aria-expanded="false">
                    <Icon icon="more_vert" />
                    <span class="visually-hidden">Toggle dropdown with other options</span>
                </button>
                <div class="dropdown-menu">
                    <div class="d-flex flex-column gap-1 px-3 py-2 align-items-start">
                        {#each dropdownItems ?? [] as item}
                            {#if !item.hide}
                                {#if 'color' in item}
                                    <a class="btn btn-{item.color}" href={item.href} tabindex="0">
                                        <Icon icon={item.icon} />
                                        {item.text}
                                    </a>
                                {:else if 'item' in item}
                                    {@render item.item()}
                                {:else}
                                    <h6 class="m-0">{item.text}</h6>
                                {/if}
                            {/if}
                        {/each}
                    </div>
                </div>
            {/if}
        </div>
    {:else if name}
        <span class="my-1 flex-shrink-0">{name}</span>
    {/if}

    {#if additionalButton}
        <div class="flex-shrink-0">
            {#if additionalButton.show ?? disabled}
                {#if additionalButton.dialogID}
                    <button
                        data-bs-toggle="modal"
                        data-bs-target="#{additionalButton.dialogID}"
                        class={['btn d-block', additionalButton.important ? 'btn-primary' : 'btn-outline-primary' ]}
                    >{additionalButton.text}</button>
                {:else}
                    <a
                        tabindex="0"
                        class={['btn d-block', additionalButton.important ? 'btn-primary' : 'btn-outline-primary' ]}
                        href={additionalButton.href}
                    >{additionalButton.text}</a>
                {/if}
            {/if}
        </div>
    {/if}
</div>