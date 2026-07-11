<script lang="ts">
    import { call } from '$lib/client/db/endpoints';
    import { Alert } from '$lib/components/ui/alert';
    import { Button } from '$lib/components/ui/button';
    import File, { getFile } from '$lib/components/widgets/File.svelte';
    import type { IR, NSP, RecommendationDataWithCode } from '$lib/data';
    import { type Files, newFileWidget } from '$lib/forms/Widget';
    import type { AllEndpoints } from '$lib/server/endpoints';
    import type { DocumentSigningInfo } from '$lib/server/signing';
    import { getTranslations } from '$lib/translations';
    import JSZip from 'jszip';

    const widget = newFileWidget({
        label: '.zip soubor se zálohou',
        accept: '.zip',
    });
    let value = $state([] as Files);
    let showAllErrors = $state(false);
    let error = $state<string>();

    type OldTimestamp = {
        type: 'firestore/timestamp/1.0',
        seconds: number,
        nanoseconds: number,
    } | {
        _seconds: number,
        _nanoseconds: number,
    }
    type OldTimestamp2 = OldTimestamp | {
        _methodName: 'serverTimestamp',
    }

    const migrateTimestamp = (t: OldTimestamp) =>
        'type' in t ? t.seconds * 1E3 + t.nanoseconds * 1E-6
            : t._seconds * 1E3 + t._nanoseconds * 1E-6

    const migrateIRFromSEIR1 = (ir: IR) => ({
        ...ir,
        meta: {
            ...ir.meta,
            deletedAt: 'deletedAt' in ir.meta ? migrateTimestamp(ir.meta.deletedAt as unknown as OldTimestamp) : undefined,
            changedAt: migrateTimestamp(ir.meta.changedAt as unknown as OldTimestamp),
            createdAt: 'createdAt' in ir.meta ? '_methodName' in (ir.meta.createdAt as unknown as OldTimestamp2) ? migrateTimestamp(ir.meta.changedAt as unknown as OldTimestamp) : migrateTimestamp(ir.meta.createdAt as unknown as OldTimestamp) : migrateTimestamp(ir.meta.changedAt as unknown as OldTimestamp),
            keysChangedAt: undefined,
        },
    }) as unknown as IR;
    const getTimestampFromDate = (nsp: NSP) => new Date(nsp.NSP.zasah.datum).valueOf();
    const migrateNSPFromSEIR1 = (nsp: NSP) => ({
        ...nsp,
        meta: {
            ...nsp.meta,
            deletedAt: 'deletedAt' in nsp.meta ? migrateTimestamp(nsp.meta.deletedAt as unknown as OldTimestamp) : undefined,
            changedAt: 'changedAt' in nsp.meta ?'_methodName' in (nsp.meta.changedAt as unknown as OldTimestamp2) ? getTimestampFromDate(nsp) :  migrateTimestamp(nsp.meta.changedAt as unknown as OldTimestamp) : getTimestampFromDate(nsp),
            createdAt: '_methodName' in (nsp.meta.createdAt as unknown as OldTimestamp2) ? getTimestampFromDate(nsp) : migrateTimestamp(nsp.meta.createdAt as unknown as OldTimestamp),
        },
    }) as NSP;

    const importBackup = async (p: AllEndpoints['db/admin/import']['params'], isFromSEIR1: boolean) => {
        await call('db/admin/import', p).catch(
            error => {
                error = error;
            },
        );
        error = !isFromSEIR1 ? 'Hotovo' : 'Hotovo, ale jen IR a SP';
    };

    const importFromSEIR1 = async () => {
        // TODO!!
    };
    const importFromBackup = async () => {
        error = undefined;
        showAllErrors = true;
        if (widget.isError({}, value)) return;

        const fileData = value[0];
        const file = await getFile(fileData.uuid);
        const zip = await JSZip.loadAsync(file!);

        const info: { SEIRVersion: number } | undefined =
            await zip.file('info.json')?.async('string')?.then(JSON.parse);
        const isFromSEIR1 = !info || info.SEIRVersion == 1;

        const originalIRs: IR[] = await zip.file('backupIR.json')?.async('string')?.then(JSON.parse);
        const originalNSPs: NSP[] = await zip.file('backupSP.json')?.async('string')?.then(JSON.parse);
        const rks: RecommendationDataWithCode[] = await zip.file('backupRK.json')?.async('string')?.then(JSON.parse);
        const sns: DocumentSigningInfo[] = await zip.file('backupSN.json')?.async('string')?.then(JSON.parse);
        if (!originalIRs || !originalNSPs) {
            error = 'Záloha poškozena';
            return;
        }

        if (!isFromSEIR1) return await importBackup({ irs: originalIRs, nsps: originalNSPs, rks, sns }, isFromSEIR1);

        const irs = originalIRs.map(migrateIRFromSEIR1);
        const nsps = originalNSPs.map(migrateNSPFromSEIR1);

        return await importBackup({ irs, nsps, rks: [], sns: [] }, isFromSEIR1);
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