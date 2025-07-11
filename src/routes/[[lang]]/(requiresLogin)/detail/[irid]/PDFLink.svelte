<script lang="ts">
    import { languageNames, type Translations } from '$lib/translations';
    import type { PageData } from './$types';
    import { getToken } from '$lib/client/auth';
    import { type Pdf, pdfInfo, toPdfTypeName } from '$lib/client/pdf';
    import { storable } from '$lib/helpers/stores';
    import { isOnline } from '$lib/client/realtime';
    import { get } from 'svelte/store';
    import type { Snippet } from 'svelte';

    interface Props {
        linkName: Pdf;
        name?: string;
        data: PageData;
        t: Translations;
        enabled?: boolean;
        hideLanguageSelector?: boolean;
        children?: Snippet;
        breakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '';
        newLineBreakpoint?: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | '';
    }

    let {
        linkName,
        name,
        data,
        t,
        enabled = true,
        hideLanguageSelector = false,
        children,
        breakpoint = 'sm',
        newLineBreakpoint = '',
    }: Props = $props();

    let pdf = $derived(pdfInfo[toPdfTypeName(linkName)]);
    let defaultLanguage = $derived(pdf.supportedLanguages.includes(data.languageCode)
        ? data.languageCode
        : pdf.supportedLanguages[0]);

    const lastToken = storable<string>(`firebase_token_${data.irid_spid}_${linkName}`);

    const token = $isOnline ? getToken() : get(lastToken);
</script>

<div
    class="d-flex flex-column flex-{newLineBreakpoint || breakpoint}-row align-items-{newLineBreakpoint || breakpoint}-center gap-1 gap-{newLineBreakpoint || breakpoint}-3">
    {#if name}<span>{name}</span>{/if}

    {#await token then token}
        <div class="d-flex flex-column flex-{breakpoint}-row align-items-{breakpoint}-center gap-1 gap-{breakpoint}-3">
            {#if !token}
                <div>{t.offline}</div>
            {:else if enabled}
                <div class="btn-group">
                    <a
                        tabindex={enabled ? 0 : undefined}
                        type="button"
                        onclick={() => lastToken.set(token)}
                        target="_blank"
                        href="/{defaultLanguage}/detail/{data.irid_spid}/pdf/{linkName}?token={token}"
                        class:disabled={!enabled}
                        class="btn btn-info text-nowrap"
                    >{t.openPdf}</a>
                    {#if !hideLanguageSelector}
                        <button
                            disabled={!enabled || pdf.supportedLanguages.length === 1}
                            class="btn btn-outline-secondary flex-grow-0 dropdown-toggle"
                            data-bs-toggle="dropdown"
                        >
                            <span>{defaultLanguage.toUpperCase()}</span>
                        </button>
                        {#if pdf.supportedLanguages.length > 1}
                            <ul class="dropdown-menu">
                                {#each pdf.supportedLanguages as code}
                                    <li>
                                        <a
                                            tabindex="0" target="_blank"
                                            class="dropdown-item d-flex align-items-center"
                                            href="/{code}/detail/{data.irid_spid}/pdf/{linkName}?token={token}"
                                            onclick={() => lastToken.set(token)}
                                        >
                                            <span class="fs-6 me-2">{code.toUpperCase()}</span>
                                            {languageNames[code]}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
                        {/if}
                    {/if}
                </div>
            {/if}
            {@render children?.()}
        </div>
    {/await}
</div>
