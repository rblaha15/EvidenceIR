<script lang="ts">
    import { migrationsIR, migrationsNSP } from '$lib/client/db/migrations';
    import { call } from '$lib/client/endpoints';
    import DangerAlert from '$lib/components/alerts/DangerAlert.svelte';
    import Chooser from '$lib/components/forms/widgets/Chooser.svelte';
    import File, { getFile } from '$lib/components/forms/widgets/File.svelte';
    import { Button } from '$lib/components/ui/button';
    import { type Files, newFileWidget, newChooserWidget } from '$lib/forms/Widget';
    import { getTranslations } from '$lib/translations';

    const widget = newFileWidget({
        label: '.zip soubor se zálohou',
        accept: '.zip',
    });
    let value = $state([] as Files);
    let error = $state<string>();
    let showAllErrors = $state(false);

    const allMigrations = [...migrationsIR, ...migrationsNSP].sortedByDescending(m => m.fromVersion);
    const widgetM = newChooserWidget({
        label: 'Migrace',
        options: allMigrations.map(m => m.name),
        labels: () => allMigrations.associate(m => [m.name, m.description]),
    });
    let valueM = $state<string | null>(null);
    let errorM = $state<string>();
    let showAllErrorsM = $state(false);

    const importFromBackup = async () => {
        error = undefined;
        showAllErrors = true;
        if (widget.isError({}, value)) return;

        const fileData = value[0];
        const file = await getFile(fileData.uuid);

        const c = await call('db/admin/importBackup', file!, {
            isFileUpload: true,
        }).catch(e => {
            error = e;
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

    const runMigrationOnCurrentData = async () => {
        errorM = undefined;
        showAllErrorsM = true;
        if (widgetM.isError({}, valueM) || !valueM) return;

        const response = await call('db/admin/runMigrationOnCurrentData', {
            migrationName: valueM,
        }, {
            returnError: true,
        });
        errorM = response.ok ? `Hotovo: ${valueM} ${response.result}` : `${response.status}: ${response.statusText}: ${response.message}`;
    };
</script>

<h3 class="text-danger text-4xl">VŠE V TÉTO SEKCI JE VELICE NEBEZPEČNÉ A NIKDO BY TO NEMĚL POUŽÍVAT!!!</h3>

<File bind:value context={{}} {showAllErrors} t={getTranslations('cs')} {widget} />

<Button variant="danger" onclick={importFromBackup}>Importovat data ze zálohy (přepíše všechna data v databázi!!!)</Button>

{#if error}
    <DangerAlert noicon title={error} />
{/if}

<Chooser bind:value={valueM} context={{}} showAllErrors={showAllErrorsM} t={getTranslations('cs')} widget={widgetM} />

<Button variant="danger" onclick={runMigrationOnCurrentData}>Spustit migraci (NEVRATNÉ!!)</Button>

{#if errorM}
    <DangerAlert noicon title={errorM} />
{/if}