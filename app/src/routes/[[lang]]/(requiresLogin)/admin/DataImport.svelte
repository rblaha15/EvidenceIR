<script lang="ts">
    import { call } from '$lib/client/db/endpoints';
    import { Alert } from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';
    import File, { getFile } from '$lib/components/widgets/File.svelte';
    import { type Files, newFileWidget } from '$lib/forms/Widget';
    import { getTranslations } from '$lib/translations';

    const widget = newFileWidget({
        label: '.zip soubor se zálohou',
        accept: '.zip',
    });
    let value = $state([] as Files);
    let showAllErrors = $state(false);
    let error = $state<string>();

    const importFromSEIR1 = async () => {

    };
    const importFromBackup = async () => {
        error = undefined;
        showAllErrors = true;
        if (widget.isError({}, value)) return;

        const fileData = value[0];
        const file = await getFile(fileData.uuid);

        await call(
            'db/admin/importBackup',
            file!,
            {
                isFileUpload: true,
            },
        ).catch(
            error => {
                error = error;
            },
        );

        // error = 'Záloha poškozena';
        // error = !isFromSEIR1 ? 'Hotovo' : 'Hotovo, ale jen IR a SP';
    };
</script>

<Button onclick={importFromSEIR1}>Importovat data ze SEIR 1</Button>

<File bind:value context={{}} {showAllErrors} t={getTranslations('cs')} {widget}/>

<Button onclick={importFromBackup}>Importovat data ze zálohy</Button>

{#if error}
    <Alert variant="danger">
        {error}
    </Alert>
{/if}