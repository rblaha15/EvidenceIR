import { unknownCompany, unknownCRN } from '$lib/forms/IN/formIN';
import { cascadePumps } from '$lib/forms/IN/infoIN';
import ares from '$lib/helpers/ares';
import { irLabel, irName, spName } from '$lib/helpers/ir';
import { extractIDs } from '$lib/helpers/paths';
import { mongoReadDatabase } from '$lib/server/db/read';
import { getTranslations } from '$lib/translations';
import { error } from '@sveltejs/kit';
import sharp from 'sharp';
import { render } from 'svelte/server';
import '$lib/extensions';
import Card from './Card.svelte';

export async function GET({ url, fetch }) {
    const id = extractIDs(url);

    const locals = { user: undefined, session: undefined };
    const t = getTranslations('cs');

    let svg: string;
    if (id.irid) {
        const ir = await mongoReadDatabase.getIR(id.irid, locals);
        if (!ir) error(400, { message: `IR doesn't exist!` });

        const pumps = cascadePumps(ir.IN)
            .map(pump => pump.model)
            .countElements()
            .mapTo((model, count) => count == 1 ? model : `${count}x ${model}`)
            .join(', ');
        const crn = ir.IN.montazka.ico;
        const assembly = crn == unknownCRN ? unknownCompany(t).companyName
            : await ares.getName(crn, fetch) || crn;
        const commissioning = ir.IN.uvedeni.zastupce;

        const { body } = render(Card, {
            props: {
                texts1: [
                    ir.IN.ir.typ.first == 'other' ? '' : irName(ir.IN.ir),
                    irLabel(ir.IN),
                ].filter(Boolean),
                texts2: [
                    pumps ? `TČ: ${pumps}` : '',
                    `MF: ${assembly}`,
                    `UP: ${commissioning}`,
                ].filter(Boolean),
            },
        });
        svg = body;
    } else if (id.nspids) {
        if (id.nspids.length != 1) error(400, { message: 'Exactly one spid must be provided!' });
        const nsp = await mongoReadDatabase.getNSP(id.nspids[0], locals);
        if (!nsp) error(400, { message: `NSP doesn't exist!` });

        const crn = nsp.NSP.montazka.ico;
        const assembly = crn == unknownCRN ? unknownCompany(t).companyName
            : await ares.getName(crn, fetch) || crn;
        const commissioning = nsp.NSP.uvedeni.zastupce;

        const { body } = render(Card, {
            props: {
                texts1: [
                    spName(nsp.NSP.zasah),
                    irLabel(nsp.NSP),
                ],
                texts2: [
                    `MF: ${assembly}`,
                    `UP: ${commissioning}`,
                ],
            },
        });
        svg = body;
    } else error(400, { message: 'At least one of irid or spid must be provided!' });

    const png = await sharp(Buffer.from(svg)).png().toBuffer();

    return new Response(png, {
        headers: {
            'Content-Type': 'image/png',
        }
    });
}