import type { TC } from '$lib/forms/IN/defaultIN';
import { blahova, defaultAddresses, sendEmail } from '$lib/client/email';
import { type IRID, irName } from '$lib/helpers/ir';
import MailProtocol from '$lib/emails/MailProtocol.svelte';
import { page } from '$app/state';
import { detailIrUrl, iridUrl } from '$lib/helpers/runes.svelte.js';
import db from '$lib/Database';
import { goto } from '$app/navigation';
import { get } from 'svelte/store';
import { currentUser } from '$lib/client/auth';
import type { ExistingIR } from '$lib/data';

export const confirmRefsite = (
    ir: ExistingIR,
    tc: TC,
    send: boolean = false,
) => async () => {
    const user = get(currentUser)!;
    const response = send ? await sendEmail({
        ...defaultAddresses(blahova),
        subject: `Vytvořit refsite u ${irName(ir.IN.ir)}`,
        component: MailProtocol,
        props: { name: user.displayName || user.email!, url: page.url.origin + detailIrUrl(ir.meta.id), e: ir.IN },
    }) : undefined;
    if (response?.ok) await db.markRefsiteConfirmed(ir.meta.id);
    await goto(iridUrl(`/RKT?pump=${tc}`));
};