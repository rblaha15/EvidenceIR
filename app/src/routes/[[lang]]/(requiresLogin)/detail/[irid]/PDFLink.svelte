<script lang="ts">
    import { languageNames, type Translations } from '$lib/translations';
    import type { PageData } from './$types';
    import { getToken } from '$lib/client/auth';
    import { type Pdf, pdfInfo, toPdfTypeName } from '$lib/client/pdf';
    import { storable } from '$lib/helpers/stores';
    import { getIsOnline, isOnline } from '$lib/client/realtime';
    import { get } from 'svelte/store';
    import type { Snippet } from 'svelte';

    interface Props {
        linkName: Pdf;
        name: string;
        data: PageData;
        t: Translations;
        enabled?: boolean;
        hideLanguageSelector?: boolean;
        children?: Snippet;
    }

    let {
        linkName,
        name,
        data,
        t,
        enabled = true,
        hideLanguageSelector = false,
        children
    }: Props = $props();

    let pdf = $derived(pdfInfo[toPdfTypeName(linkName)]);
    let defaultLanguage = $derived(pdf.supportedLanguages.includes(data.languageCode)
        ? data.languageCode
        : pdf.supportedLanguages[0]);

    const lastToken = storable<string>(`firebase_token_${data.irid}_${linkName}`);

    const token = $isOnline ? getToken() : get(lastToken);
</script>

<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mt-2">
    <span>{name}</span>

    {#await token then token}
        {#if token}
            <div class="btn-group ms-sm-2 mt-2 mt-sm-0">
                <a
                    tabindex={enabled ? 0 : undefined}
                    type="button"
                    onclick={() => lastToken.set(token)}
                    target="_blank"
                    href="/{defaultLanguage}/detail/{data.irid}/pdf/{linkName}?token={token}"
                    class:disabled={!enabled}
                    class="btn btn-info text-nowrap"
                >{t.openPdf}</a>
                {#if !hideLanguageSelector}
                    <button
                        disabled={!enabled || pdf.supportedLanguages.length === 1}
                        class="btn btn-secondary"
                        class:dropdown-toggle={pdf.supportedLanguages.length > 1}
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
                                        href="/{code}/detail/{data.irid}/pdf/{linkName}?token={token}"
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
        {:else}
            <div class="ms-sm-2 mt-2 mt-sm-0">
                {t.offline}
            </div>
        {/if}
        {@render children?.()}
    {/await}
</div>
