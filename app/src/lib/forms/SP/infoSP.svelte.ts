import {
    getIsOnline,
    type SparePart,
    sparePartsList,
    startSparePartsListening,
    startTechniciansListening,
    type Technician,
    techniciansList,
} from '$lib/client/realtime';
import type { User } from 'firebase/auth';
import { page } from '$app/state';
import { spName } from '$lib/helpers/ir';
import db from '$lib/client/data';
import { defaultAddresses, sendEmail } from '$lib/client/email';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { detailIrUrl } from '$lib/helpers/runes.svelte';
import { nowISO } from '$lib/helpers/date';
import { currentUser } from '$lib/client/auth';
import { cellsSP } from '$lib/forms/SP/cellsSP';
import { type FormSP } from '$lib/forms/SP/formSP.svelte';
import defaultSP from '$lib/forms/SP/defaultSP';
import type { FormInfo } from '$lib/forms/FormInfo';

const infoSP = (() => {
    let i = $state() as number;
    const info: FormInfo<FormSP, FormSP, [[Technician[], User | null], [SparePart[]]], 'SP'> = {
        type: 'IR',
        storeName: 'stored_sp',
        defaultData: () => defaultSP(),
        openPdf: () => ({
            link: 'SP',
            index: i.also(console.log),
        }),
        getEditData: ir => {
            const editIndex = page.url.searchParams.get('edit') as string | null;
            if (editIndex) {
                i = Number(editIndex);
                return ir.installationProtocols[i];
            } else {
                console.log(ir.installationProtocols);
                i = ir.installationProtocols.length;
                return undefined;
            }
        },
        saveData: async (irid, raw, edit, _, editResult, t, send) => {
            const name = spName(raw.zasah);

            const ir = (await db.getIR(irid))!;

            if (!edit && getIsOnline() && ir.installationProtocols.some(p => spName(p.zasah) == name)) {
                editResult({ text: 'SP již existuje.', red: true, load: false });
                return false;
            }

            if (edit) await db.editServiceProtocol(irid, i, raw);
            else await db.addServiceProtocol(irid, raw);

            if (edit && !send) return true;

            const response = await sendEmail({
                ...defaultAddresses(),
                subject: edit
                    ? `Upravený servisní protokol: ${name}`
                    : `Nový servisní protokol: ${name}`,
                component: MailProtocol,
                props: { name: raw.zasah.clovek, url: page.url.origin + detailIrUrl(irid) },
            });

            if (response!.ok) return true;
            else editResult({
                text: t.emailNotSent({ status: String(response!.status), statusText: response!.statusText }),
                red: true,
                load: false,
            });
        },
        createWidgetData: (_, p) => p,
        title: (_, edit) => edit
            ? `Editace SP`
            : `Instalační a servisní protokol`,
        onMount: async (d, p, _, ir) => {
            await startTechniciansListening();
            await startSparePartsListening();
            if (!p.zasah.datum.value)
                p.zasah.datum.setValue(d, nowISO());
            if (!p.zasah.datumUvedeni.value && ir.uvedeniTC?.uvadeni?.date) {
                p.zasah.datumUvedeni.setValue(d, ir.uvedeniTC.uvadeni.date);
            }
        },
        storeEffects: [
            [(_, p, [$techniciansList, $currentUser], edit) => {
                const ja = edit ? undefined : $techniciansList.find(t => $currentUser?.email == t.email);
                if (!p.zasah.clovek.value) p.zasah.clovek.setValue(p, ja?.name ?? p.zasah.clovek.value);
                p.zasah.clovek.show = () => p.zasah.clovek.value != ja?.name;
                if (!p.zasah.inicialy.value) p.zasah.inicialy.setValue(p, ja?.initials ?? p.zasah.inicialy.value);
                p.zasah.inicialy.show = () => p.zasah.inicialy.value != ja?.initials;
            }, [techniciansList, currentUser]],
            [(_, p, [$sparePartsList]) => {
                const spareParts = $sparePartsList.map(it => ({
                    ...it,
                    name: it.name.replace('  ', ' '),
                }) satisfies SparePart);
                [
                    p.nahradniDil1, p.nahradniDil2, p.nahradniDil3, p.nahradniDil4,
                    p.nahradniDil5, p.nahradniDil6, p.nahradniDil7, p.nahradniDil8,
                ].forEach(nahradniDil => {
                    nahradniDil.dil.items = () => spareParts;
                });
            }, [sparePartsList]],
        ],
        importOptions: {
            sheet: 'Protokol',
            onImport: (_, p) => {
                p.zasah.clovek.show = () => true;
                p.zasah.inicialy.show = () => true;
            },
            cells: cellsSP,
            sheetFilter: n => n.includes('Protokol'),
        },
        requiredRegulus: true,
    };
    return info;
})();

export default infoSP;