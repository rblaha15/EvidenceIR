import type { HeatPump } from '$lib/helpers/products';
import { type FormGroupIR, irTypeAndNumber } from '$lib/forms/IN/defaultIN';

export const alsoChangeDefault = {
    setPumpType: null as 'airToWater' | 'groundToWater' | null,
    setPumpModel: null as HeatPump | null,
    setPumpNumber: null as string | null,
    resetBoxNumber: false,
    resetRemoteAccess: false,
    setFVEType: false,
    setHP: false,
};

export type DataChangeIRID = { ir: FormGroupIR<DataChangeIRID> };
export type StateChangeIRID = 'hidden' | 'input' | 'sending' | 'fail' | 'unchanged';
export type AlsoChange = typeof alsoChangeDefault;

export const createFormPart = (
    modifyAlsoChange: (alsoChange: Partial<AlsoChange>) => void,
) => irTypeAndNumber<DataChangeIRID>({
    setPumpType: (_, v) => modifyAlsoChange({ setPumpType: v }),
    setPumpModel: (_, v) => modifyAlsoChange({ setPumpModel: v }),
    setPumpNumber: (_, v) => modifyAlsoChange({ setPumpNumber: v }),
    resetBoxNumber: _ => modifyAlsoChange({ resetBoxNumber: true }),
    resetRemoteAccess: _ => modifyAlsoChange({ resetRemoteAccess: true }),
    setFVEType: _ => modifyAlsoChange({ setFVEType: true }),
    setHP: _ => modifyAlsoChange({ setHP: true }),
});