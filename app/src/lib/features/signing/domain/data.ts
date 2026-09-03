import type { IR, NSP, SignatureState } from '$lib/data';
import type { CodeAttemptParams, DocumentDefinition, SendCodeParams } from '$lib/features/signing/domain/sms';
import type { Raw } from '$lib/forms/Form';
import type { FormIN } from '$lib/forms/IN/formIN';
import type { FormNSP } from '$lib/forms/NSP/formNSP';
import type { FormSP } from '$lib/forms/SP/formSP.svelte';
import type { FormSZ } from '$lib/forms/SP/formSZ';
import { isSP } from '$lib/forms/SP/infoSP.svelte';
import { endUserEmails, endUserName, type IRID, type NSPID, type SPID } from '$lib/helpers/ir';
import {
    type GeneratePdfOptions,
    type Pdf,
    type PdfDefiningParameter,
    pdfToSign,
    type PdfToSign,
    pdfWithDefiningParameter,
    type PdfWithDefiningParameter
} from '$lib/pdf/pdf';

export const getDefiningParameter = (parameterName: 'pump' | 'id' | undefined, url: URL) =>
    parameterName ? url.searchParams.get(parameterName)?.let(p =>
        isNaN(Number(p)) ? p : Number(p),
    ) as PdfDefiningParameter : undefined;

export const getSignatureState = (
    data: IR | NSP | null,
    name: Pdf,
    parameter?: PdfDefiningParameter,
) => {
    const signatures = data?.signatures;
    if (!signatures) return undefined;
    if (parameter) {
        const s2 = signatures as Record<PdfWithDefiningParameter, Record<string | number, SignatureState>>;
        return s2[name as PdfWithDefiningParameter]?.[parameter] as SignatureState | undefined;
    } else {
        const s2 = signatures as Record<PdfToSign, SignatureState>;
        return s2[name as PdfToSign] as SignatureState | undefined;
    }
};

export const getSignatureDef = (
    pdf: Pdf, id: {
        irid: IRID | null,
        nspids: NSPID[],
    }, parameter?: PdfDefiningParameter,
): DocumentDefinition => ({
    pdf: pdf as PdfToSign, parameter, id: id.irid ?? id.nspids[0]!,
});

const isPdfToSign = (pdf: Pdf): pdf is PdfToSign => (pdfToSign as Pdf[]).includes(pdf);

const addCzechCountryCode = (phone: string) =>
    phone.startsWith('+') ? phone : `+420 ${phone}`;

type CompanyType = 'montazka' | 'uvedeni';
type Company = Raw<FormIN>[CompanyType];
type Investor = Raw<FormIN>['koncovyUzivatel'];
export const getSigningInfo = (def: DocumentDefinition, ir: IR | null, nsp: NSP | null) => {

    const SP = (pdf: 'SP' | 'NSP'): Raw<FormSP> => pdf == 'NSP' ? nsp!.NSP : ir!.SPs[def.parameter as SPID] as Raw<FormSP>;
    const IN = (pdf: PdfToSign): Raw<FormIN | FormNSP> => pdf == 'NSP' ? nsp!.NSP : ir!.IN;

    const allowSigningSP = (sp: Raw<FormSP> | Raw<FormNSP> | Raw<FormSZ>) =>
        isSP(sp) && sp.fakturace.komu.chosen && sp.fakturace.komu.chosen != 'otherCompany';
    const allowSigning = isPdfToSign(def.pdf) && (def.pdf != 'NSP' && def.pdf != 'SP' || allowSigningSP(SP(def.pdf)));

    const companyType = (pdf: 'SP' | 'NSP'): CompanyType => SP(pdf).fakturace.komu.chosen == 'assemblyCompany' ? 'montazka' : 'uvedeni';
    const company = (pdf: 'SP' | 'NSP'): Company => IN(pdf)[companyType(pdf)];
    const endUser = (pdf: PdfToSign): Investor => IN(pdf).koncovyUzivatel;
    const signingByInvestor = (u: Investor) =>
        ({ name: endUserName(u), phone: addCzechCountryCode(u.telefon), email: endUserEmails(u)[0] });
    const signingByCompany = (c: Company) =>
        ({ name: c.zastupce, phone: addCzechCountryCode(c.telefon), email: c.email });
    const signingBy = def.pdf != 'NSP' && def.pdf != 'SP' || SP(def.pdf).fakturace.komu.chosen == 'investor'
        ? signingByInvestor(endUser(def.pdf))
        : signingByCompany(company(def.pdf));
    const signeeType = def.pdf != 'NSP' && def.pdf != 'SP' || SP(def.pdf).fakturace.komu.chosen == 'investor'
        ? 'investor' : companyType(def.pdf);

    const o: Omit<GeneratePdfOptions<PdfToSign>, 'data'> = {
        link: def.pdf, lang: 'cs',
        ...def.parameter ? { [pdfWithDefiningParameter[def.pdf as PdfWithDefiningParameter]]: def.parameter } : {},
    };

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const sendParams: SendCodeParams = { def, signingBy };
    const attemptParams = (code: string): CodeAttemptParams => ({ def, signingBy, code, timezone });

    return { signingBy, sendParams, attemptParams, o, allowSigning, signeeType };
};