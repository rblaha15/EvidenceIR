import type { TC } from '$lib/forms/IN/defaultIN';
import { blahova, defaultAddresses, sendEmail } from '$lib/client/email';
import { type IRID, irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { detailUrlIR, iridUrl } from '$lib/helpers/runes.svelte.js';
import db from '$lib/client/db';
import { goto } from '$app/navigation';
import { getUser } from '$lib/client/auth';
import type { ExistingIR } from '$lib/data';

export const confirmRefsite = async (
    ir: ExistingIR,
    tc: TC,
    send: boolean = false,
) => {
    const user = await getUser();
    const response = send ? await sendEmail({
        ...defaultAddresses(blahova),
        subject: `Vytvořit refsite u ${irName(ir.IN.ir)}`,
        component: MailProtocol,
        props: { name: user!.name || user!.email, url: page.url.origin + detailUrlIR(ir.meta.id), e: ir.IN },
    }) : undefined;
    if (response?.ok) await db.markRefsiteConfirmed(ir.meta.id);
    await new Promise(r => setTimeout(r, 1000));
    await goto(iridUrl(`/RKT?pump=${tc}`));
};