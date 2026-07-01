<script lang="ts" module>
    export type SigningStatus = 'none' | 'sendingSMS' | 'sent' | 'sentAgain' | 'confirming' | 'sendingEmail' | 'end';
</script>

<script lang="ts">
    import { user } from '$lib/client/auth';
    import { addCzechCountryCode, type LoadData } from '$lib/features/signing/domain/load';
    import { sendSMS } from '$lib/features/signing/actions/sms';
    import { endUserEmails, endUserName } from '$lib/helpers/ir';
    import { newInputWidget } from '$lib/forms/Widget';
    import Widget from '$lib/components/Widget.svelte';
    import type { Translations } from '$lib/translations';
    import { confirmCode } from '$lib/features/signing/actions/code';
    import { isOnline } from '$lib/client/online';
    import type { SendCodeParams } from '$lib/features/signing/domain/sms';
    import { onMount } from 'svelte';
    import { setTitle } from '$lib/helpers/globals';
    import { type GeneratePdfOptions, type PdfToSign, type PdfWithDefiningParameter, pdfWithDefiningParameter } from '$lib/pdf/pdf';
    import { Alert, AlertAction, AlertDescription, AlertTitle } from '$lib/components/ui/alert';
    import { OctagonAlert, WifiOff } from '@lucide/svelte';
    import { Button } from '$lib/components/ui/button';
    import { Spinner } from '$lib/components/ui/spinner';

    const {
        args, def, ir, nsp, translations: t, settings,
    }: LoadData & {
        translations: Translations;
    } = $props();

    const endUser = $derived(args!.type == 'IR' ? $ir!.IN.koncovyUzivatel : $nsp!.NSP.koncovyUzivatel);
    const signingBy = $derived({
        name: endUserName(endUser), phone: addCzechCountryCode(endUser.telefon), email: endUserEmails(endUser)[0],
    });
    const params: SendCodeParams = $derived({ def, signingBy, initiatingUserName: $user!.name });
    const o: Omit<GeneratePdfOptions<PdfToSign>, 'data'> = $derived({
        link: def.pdf, lang: 'cs',
        ...def.parameter ? { [pdfWithDefiningParameter[def.pdf as PdfWithDefiningParameter]]: def.parameter } : {},
    });

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
        label: 'Kód z SMS',
        maskOptions: { mask: 'AAAA-AAAA', definitions: { 'A': /[1-9a-zA-Z]/ } },
        capitalize: true,
        autocapitalize: 'characters',
        regex: /^[1-9a-zA-Z]{4}-[1-9a-zA-Z]{4}$/,
    });
    let code = $state('');

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    onMount(() => setTitle('Potvrzení dokumentu pomocí SMS', true));
</script>
{#if error}
    <Alert variant="danger">
        <OctagonAlert />
        <AlertTitle>Nastala chyba!</AlertTitle>
        <AlertDescription>{error || 'Neznámá chyba'}</AlertDescription>
        <AlertAction>
            <Button variant="ghost" onclick={() => error = undefined}>Skrýt</Button>
        </AlertAction>
    </Alert>
{/if}
{#if $settings && $settings.state == 'signed' && status != 'sendingEmail' && status != 'end'}
    <Alert variant="danger">
        <AlertTitle>Tento dokument byl již podepsán!</AlertTitle>
    </Alert>
{:else if $settings && $settings.initiatingUser.uid != $user!.id}
    <Alert variant="danger">
        <AlertTitle>Tento dokument již podepisuje jiný uživatel!</AlertTitle>
    </Alert>
{:else if !$isOnline}
    <Alert variant="danger">
        <WifiOff />
        <AlertTitle>Jste offline!</AlertTitle>
        <AlertDescription>Potvrzování dokumentů pomocí SMS zprávy je dostupné pouze s připojením k Internetu.</AlertDescription>
    </Alert>
{:else if status == 'none'}
    <p>
        Po kliknutí na tlačítko níže se odešle koncovému zákazníkovi na {signingBy.phone} jednorázový kód, který vám následně nadiktuje.
    </p>
    <Button class="md:self-start" onclick={sendSMS(params, setStatus)}>
        Odeslat zprávu
    </Button>
{:else if status == 'sendingSMS'}
    <Alert>
        <Spinner />
        <AlertTitle>Odesílání zprávy…</AlertTitle>
    </Alert>
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
        Zadejte kód, který přišel koncovému zákazníkovi na {signingBy.phone}. Po odeslání bude dokument považován za podepsaný a bude vám i
        zákazníkovi odeslán do emailové schránky.
    </p>
    <p class="flex items-center">
        Zpráva nedorazila? Můžete ji zkusit
        <Button variant="link" onclick={sendSMS(params, setStatus, true)} class="px-0">odeslat znovu</Button>
    </p>
    <div class="flex flex-col md:flex-row md:items-center gap-4">
        <Widget widget={codeWidget} bind:value={code} {t} showAllErrors={false} context={undefined} />
        <Button disabled={codeWidget.isError(undefined, code)} onclick={confirmCode(o, { def, signingBy, code, timezone }, setStatus)}>
            Odeslat kód
        </Button>
    </div>
{:else if status == 'confirming'}
    <Alert>
        <Spinner />
        <AlertTitle>Ověřování kódu…</AlertTitle>
    </Alert>
{:else if status == 'sendingEmail'}
    <Alert>
        <Spinner />
        <AlertTitle>Odesílání emailů…</AlertTitle>
    </Alert>
{/if}