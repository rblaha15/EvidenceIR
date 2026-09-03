<script lang="ts" module>
    export type SigningStatus = 'none' | 'sendingSMS' | 'sent' | 'sentAgain' | 'confirming' | 'sendingEmail' | 'end';
</script>

<script lang="ts">
    import { user } from '$lib/client/auth';
    import DangerAlert from '$lib/components/alerts/DangerAlert.svelte';
    import OfflineAlert from '$lib/components/alerts/OfflineAlert.svelte';
    import SpinnerAlert from '$lib/components/alerts/SpinnerAlert.svelte';
    import { getSigningInfo } from '$lib/features/signing/domain/data';
    import { type LoadData } from '$lib/features/signing/domain/load';
    import { sendSMS } from '$lib/features/signing/actions/sms';
    import { getData } from '$lib/helpers/getData';
    import { newInputWidget } from '$lib/forms/Widget';
    import Widget from '$lib/components/Widget.svelte';
    import type { Translations } from '$lib/translations';
    import { confirmCode } from '$lib/features/signing/actions/code';
    import { isOnline } from '$lib/client/online';
    import { SMS_CODE_LIFETIME_MIN } from '$lib/features/signing/domain/sms';
    import { onMount, untrack } from 'svelte';
    import { setTitle } from '$lib/helpers/globals';
    import { Alert, AlertAction, AlertTitle } from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';

    const {
        def, ir, nsp, translations: t, settings, irid, nspids,
    }: LoadData & {
        translations: Translations;
    } = $props();

    const { signingBy, sendParams, attemptParams, o, signeeType } = $derived(getSigningInfo(def, $ir, $nsp));
    const recipient = $derived(
        signeeType == 'investor' ? 'koncovému zákazníkovi' : signeeType == 'montazka'
            ? 'zástupci montážní firmy' : 'osobě, která uvedla TČ do provozu'
    );


    let status = $state<SigningStatus>('none');
    $effect(() => {
        if ($settings && status == 'none') status = 'sent';
    });
    $effect(() => {
        status;
        untrack(() => getData({ irid, nspids }));
    });
    let error = $state<string | undefined>(undefined);
    let timer = $state<number | undefined>(undefined);
    let timerID = $state<NodeJS.Timeout | undefined>(undefined);
    const setStatus = (s: SigningStatus, e?: string, sec?: number) => {
        const old = status;
        status = s;
        error = e;
        timer = sec;
        if (timerID) clearInterval(timerID);
        if (timer) timerID = setInterval(() => {
            if (!timer || timer-- == 0) clearInterval(timerID);
        }, 1050);
        return old;
    };

    const codeWidget = newInputWidget({
        label: 'Kód z SMS',
        maskOptions: { mask: 'AAAA-AAAA', definitions: { 'A': /[1-9a-zA-Z]/ } },
        capitalize: true,
        autocapitalize: 'characters',
        regex: /^[1-9a-zA-Z]{4}-[1-9a-zA-Z]{4}$/,
    });
    let code = $state('');

    onMount(() => setTitle('Potvrzení dokumentu pomocí SMS', true));
</script>
{#if error}
    <DangerAlert title="Nastala chyba!" action={{
        text: 'Skrýt', onclick: () => error = undefined,
    }}>
        {error || 'Neznámá chyba'}
        {#if timer}
            <p>Zbývá {timer} s</p>
        {/if}
    </DangerAlert>
{/if}
{#if $settings && $settings.state == 'signed' && status != 'sendingEmail' && status != 'end'}
    <DangerAlert title="Tento dokument byl již podepsán!" />
{:else if $settings && $settings.initiatingUser.email != $user!.email}
    <DangerAlert title="Tento dokument již podepisuje jiný uživatel!" />
{:else if !$isOnline}
    <OfflineAlert title="Jste offline!"
                 description="Potvrzování dokumentů pomocí SMS zprávy je dostupné pouze s připojením k internetu." />
{:else if status == 'none'}
    <p>Po kliknutí na tlačítko níže se odešle {recipient} ({signingBy.name}) na {signingBy.phone} jednorázový kód, který
        vám následně nadiktuje.</p>
    <Button class="md:self-start" onclick={sendSMS(sendParams, setStatus)}>
        Odeslat zprávu
    </Button>
{:else if status == 'sendingSMS'}
    <SpinnerAlert title="Odesílání zprávy…" />
{:else if status == 'sent' || status == 'sentAgain'}
    {#if status == 'sentAgain'}
        <Alert variant="success">
            <AlertTitle>Zpráva byla odeslána</AlertTitle>
            <AlertAction class="top-1">
                <Button variant="ghost" onclick={() => status = 'sent'}>Skrýt</Button>
            </AlertAction>
        </Alert>
    {/if}
    <p>
        Zadejte kód, který přišel {recipient} na {signingBy.phone}. Po odeslání bude dokument považován za
        podepsaný a bude vám i {recipient} odeslán do emailové schránky. Platnost kódu je {SMS_CODE_LIFETIME_MIN} minut.
    </p>
    <p class="flex items-center">
        Zpráva nedorazila? Můžete ji zkusit 
        <Button variant="link" onclick={sendSMS(sendParams, setStatus, true)} class="px-0">odeslat znovu</Button>
    </p>
    <div class="flex flex-col md:flex-row md:items-center gap-4">
        <Widget widget={codeWidget} bind:value={code} {t} showAllErrors={false} context={undefined} />
        <Button disabled={codeWidget.isError(undefined, code)} onclick={confirmCode(o, attemptParams(code), setStatus)}>
            Odeslat kód
        </Button>
    </div>
{:else if status == 'confirming'}
    <SpinnerAlert title="Ověřování kódu…" />
{:else if status == 'sendingEmail'}
    <SpinnerAlert title="Odesílání emailů…" />
{/if}