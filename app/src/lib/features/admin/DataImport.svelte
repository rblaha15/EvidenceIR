<script lang="ts">
    import { call } from '$lib/client/endpoints';
    import DangerAlert from '$lib/components/alerts/DangerAlert.svelte';
    import File, { getFile } from '$lib/components/forms/widgets/File.svelte';
    import { Button } from '$lib/components/ui/button';
    import { type Files, newFileWidget } from '$lib/forms/Widget';
    import { getTranslations } from '$lib/translations';

    const widget = newFileWidget({
        label: '.zip soubor se zálohou',
        accept: '.zip',
    });
    let value = $state([] as Files);
    let showAllErrors = $state(false);
    let error = $state<string>();

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
            const [i, n, r, s, l, p, f, t, sp, hp, at, z, k, st, b, fp] = c;
            error = `Hotovo: ${i}x IR, ${n}x NSP, ${r}x DK, ${s}x SN, ${l}x LP, ` +
                `${p} uživatelů, ${f} firem, ${t} techniků, ${sp} dílů, ${hp} čerpadel, ` +
                `${at} nádrží, ${z} zásobníků, ${k} kolektorů, ${st} střídačů, ${b} baterie, ${fp} panely`;
        }
    };
</script>

<File bind:value context={{}} {showAllErrors} t={getTranslations('cs')} {widget} />

<Button onclick={importFromBackup}>Importovat data ze zálohy (přepíše všechna data v databázi!!!)</Button>

{#if error}
    <DangerAlert noicon title={error} />
{/if}