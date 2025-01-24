<script lang="ts">
    import { type LanguageCode } from '$lib/languages';
    import { languageNames, type Translations } from '$lib/translations';
    import type { PageData } from './$types';
    import { getToken } from '$lib/client/auth';
    import { type Pdf, pdfInfo, toPdfTypeName } from '$lib/client/pdf';
    import { storable } from '$lib/helpers/stores';
    import { getIsOnline } from '$lib/client/realtime';
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

    const lastToken = storable<string>('firebase_token');

    let offlineError = $state(false);

    const open = async (lang: LanguageCode) => {
        offlineError = false;
        let token: string;
        if (getIsOnline()) {
            token = await getToken();
            lastToken.set(token);
        } else {
            const t = get(lastToken);
            if (t) {
                token = t;
            } else {
                offlineError = true;
                return;
            }
        }
        window.open(`/${lang}/detail/${data.irid}/pdf/${linkName}?token=${token}`);
    };
</script>

<div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center mt-2">
    <span>{name}</span>

    {#if !offlineError}
        <div class="btn-group ms-sm-2 mt-2 mt-sm-0">
            <button
                onclick={() => open(defaultLanguage)}
                type="button"
                disabled={!enabled}
                class="btn btn-outline-info text-nowrap">{t.openPdf}</button
            >
            {#if !hideLanguageSelector}
                <button
                    type="button"
                    disabled={!enabled || pdf.supportedLanguages.length === 1}
                    class="btn btn-outline-secondary"
                    class:dropdown-toggle={pdf.supportedLanguages.length > 1}
                    data-bs-toggle="dropdown"
                >
                    <span>{defaultLanguage.toUpperCase()}</span>
                </button>
                {#if pdf.supportedLanguages.length > 1}
                    <ul class="dropdown-menu">
                        {#each pdf.supportedLanguages as code}
                            <li>
                                <button onclick={() => open(code)} type="button" class="dropdown-item">
                                    <span class="fs-5">{code.toUpperCase()}</span>
                                    {languageNames[code]}
                                </button>
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
</div>
