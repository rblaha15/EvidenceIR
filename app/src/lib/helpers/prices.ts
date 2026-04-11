export const pricesNoVAT = {
    regulusRoute: {
        cs_CZK: 1339,
        de_EUR: 55,
    },
    KOMPlET10: {
        monthly: {
            cs_CZK: 517,
            de_EUR: 21,
        },
        yearly: {
            cs_CZK: 5000,
            de_EUR: 200,
        },
    },
};

const minDate = new Date(0);
const maxDate = new Date(8e15);
const date2026_04_01 = new Date(2026, 3, 1);
export const newPrices = date2026_04_01;
export const isNewPrices = (date: string | Date) => new Date(date) >= newPrices;
export const newWarranties = date2026_04_01;
export const isNewWarranties = (date: string | Date) => new Date(date) >= newWarranties;

const allOperationPrices = new Map([
    [[minDate, newPrices] as const, {
        transportation: 12 / 1.21,
        work: 800 / 1.21,
        regulusRoute: 1_000 / 1.21,
        installationApproval: 3_000 / 1.21,
        extendedWarranty: 6_000 / 1.21,
        commissioningTC: 4_000 / 1.21,
        commissioningHPInCascade: 1_600 / 1.21,
        commissioningSOL: 2_000 / 1.21,
        commissioningFVE: 2_000 / 1.21,
        yearlyHPCheck: 3_000 / 1.21,
        yearlyHPInCascadeCheck: 1_200 / 1.21,
        yearlySOLCheck: 1_500 / 1.21,
        withoutCode: 0,
    } as const],
    [[newPrices, maxDate] as const, {
        transportation: 14 / 1.12,
        work: 1_000 / 1.12,
        regulusRoute: 1_500 / 1.12,
        installationApproval: 3_000 / 1.21,
        extendedWarranty: 6_000 / 1.21,
        commissioningTC: 4_000 / 1.21,
        commissioningHPInCascade: 1_600 / 1.21,
        commissioningSOL: 2_000 / 1.21,
        commissioningFVE: 2_000 / 1.21,
        yearlyHPCheck: 3_000 / 1.12,
        yearlyHPInCascadeCheck: 2_300 / 1.12,
        yearlySOLCheck: 1_500 / 1.12,
        withoutCode: 0,
    } as const],
]);

export const getOperationPrices = (commission: Date) =>
    allOperationPrices.entries()
        .find(([[from, to]]) => from <= commission && commission < to)!
        [1];