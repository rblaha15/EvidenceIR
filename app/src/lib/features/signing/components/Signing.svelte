<script lang="ts" module>
    export type SigningStatus = 'none' | 'sendingSMS' | 'sent' | 'sentAgain' | 'confirming' | 'sendingEmail';
</script>

<script lang="ts">
    import { addCzechCountryCode, type LoadData } from '$lib/features/signing/domain/load';
    import { sendSMS } from '$lib/features/signing/actions/sms';
    import { endUserEmails, endUserName } from '$lib/helpers/ir';
    import { newInputWidget } from '$lib/forms/Widget';
    import Widget from '$lib/components/Widget.svelte';
    import type { Translations } from '$lib/translations';
    import { confirmCode } from '$lib/features/signing/actions/code';
    import { currentUser } from '$lib/client/auth';
    import { isOnline } from '$lib/client/realtimeOnline';
    import Icon from '$lib/components/Icon.svelte';
    import type { SendCodeParams } from '$lib/features/signing/domain/sms';
    import { onMount } from 'svelte';
    import { setTitle } from '$lib/helpers/globals';

    const {
        args, def, ir, sp, translations: t, settings,
    }: LoadData & {
        translations: Translations;
    } = $props();

    const endUser = $derived(args!.type == 'IR' ? $ir!.IN.koncovyUzivatel : $sp!.NSP.koncovyUzivatel);
    const signingBy = $derived({
        name: endUserName(endUser), phone: addCzechCountryCode(endUser.telefon), email: endUserEmails(endUser)[0],
    });
    const params: SendCodeParams = $derived({ def, signingBy, initiatingUserName: $currentUser?.displayName || undefined });

    let status = $state<SigningStatus>('none');
    $effect(() => {
        if ($settings && status == 'none') status = 'sent';
    });
    let error = $state<string | undefined>(undefined);
    const setStatus = (s: SigningStatus, e?: string) => {
        const old = status;
        status = s;
        error = e;
        return old;
    };

    const codeWidget = newInputWidget({
        label: 'OTP',
        maskOptions: { mask: 'AAAA-AAAA', definitions: { 'A': /[0-9a-zA-Z]/ } },
        capitalize: true,
        autocapitalize: 'characters',
        regex: /^[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}$/,
    });
    let code = $state('');

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    onMount(() => setTitle('Potvrzení dokumentu pomocí SMS', true));
</script>
{#if error}
    <div class="alert alert-danger d-flex flex-column gap-3">
        <div class="d-flex align-items-center gap-3">
            <Icon icon="error_outline" />
            <h4 class="alert-heading m-0">Nastala chyba!</h4>
        </div>
        <p class="m-0">{error}</p>
        <div class="d-flex flex-column align-items-end">
            <button class="btn btn-danger" onclick={() => error = undefined}>Skrýt</button>
        </div>
    </div>
{/if}
{#if $settings && $settings.state == 'signed'}
    <div class="alert alert-danger d-flex flex-column gap-3">
        Tento dokument byl již podepsán!
    </div>
{:else if $settings && $settings.initiatingUser.uid != $currentUser!.uid}
    <div class="alert alert-danger d-flex flex-column gap-3">
        Tento dokument již podepisuje jiný uživatel!
    </div>
{:else if !$isOnline}
    <div class="alert alert-danger d-flex flex-column gap-3">
        <div class="d-flex align-items-center gap-3">
            <Icon icon="wifi_off" />
            <h4 class="alert-heading m-0">Jste offline!</h4>
        </div>
        <p class="m-0">Potvrzování dokumentů pomocí SMS zprávy je dostupné pouze s připojením k Internetu.</p>
    </div>
{:else if status == 'none'}
    <p class="m-0">
        Po kliknutí na tlačítko níže se odešle koncovému zákazníkovi na {signingBy.phone} jednorázový kód, který vám následně nadiktuje.
    </p>
    <button class="btn btn-primary align-self-md-start" onclick={sendSMS(params, setStatus)}>
        Odeslat zprávu
    </button>
{:else if status == 'sendingSMS'}
    <div class="alert alert-secondary d-flex align-items-center gap-3">
        <span class="spinner-border text-danger"></span>
        <p class="m-0">Odesílání zprávy…</p>
    </div>
{:else if status == 'sent' || status == 'sentAgain'}
    {#if status == 'sentAgain'}
        <div class="alert alert-success d-flex flex-column gap-3">
            <p class="m-0">Zpráva byla odeslána</p>
            <div class="d-flex flex-column align-items-end">
                <button class="btn btn-success" onclick={() => error = undefined}>Skrýt</button>
            </div>
        </div>
    {/if}
    <p class="m-0">
        Zadejte kód, který přišel koncovému zákazníkovi na {signingBy.phone}. Po odeslání bude dokument považován za podepsaný a bude vám i
        zákazníkovi odeslán do emailové schránky.
    </p>
    <p class="m-0 d-flex align-items-center">
        Zpráva nedorazila? Můžete ji zkusit
        <button class="btn btn-link p-0 ps-1" onclick={sendSMS(params, setStatus, true)}>odeslat znovu</button>
        .
    </p>
    <div class="d-flex flex-column flex-md-row align-items-md-center gap-3">
        <Widget widget={codeWidget} bind:value={code} {t} showAllErrors={false} context={undefined} />
        <button class="btn btn-primary" disabled={codeWidget.isError(undefined, code)}
                onclick={confirmCode({ def, signingBy, code, timezone }, setStatus)}>
            Odeslat kód
        </button>
    </div>
{:else if status == 'confirming'}
    <div class="alert alert-secondary d-flex align-items-center gap-3">
        <span class="spinner-border text-danger"></span>
        <p class="m-0">Ověřování kódu…</p>
    </div>
{:else if status == 'sendingEmail'}
    <div class="alert alert-secondary d-flex align-items-center gap-3">
        <span class="spinner-border text-danger"></span>
        <p class="m-0">Odesílání emailů…</p>
    </div>
{/if}