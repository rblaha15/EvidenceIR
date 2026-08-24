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
        error = undefined;

        const c = await call('db/admin/importFromSEIR1').catch(error => {
            error = error;
            return [];
        });

        if (!c.length) error = 'Záloha poškozena';
        else {
            const [i, n, r, s] = c;
            error = `Hotovo: ${i}x IR, ${n}x NSP, ${r}x DK, ${s}x SN`;
        }
    };
    const importFromBackup = async () => {
        error = undefined;
        showAllErrors = true;
        if (widget.isError({}, value)) return;

        const fileData = value[0];
        const file = await getFile(fileData.uuid);

        const c = await call('db/admin/importBackup', file!, {
            isFileUpload: true,
        }).catch(error => {
            error = error;
            return [];
        });

        if (!c.length) error = 'Záloha poškozena';
        else {
            const [i, n, r, s] = c;
            error = `Hotovo: ${i}x IR, ${n}x NSP, ${r}x DK, ${s}x SN`;
        }
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