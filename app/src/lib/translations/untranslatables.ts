import type { OptionsInputsB, OptionsInputsC, OptionsOutputsB, OptionsOutputsF } from '$lib/forms/FT/portsOptions';
import type { IRSubTypes, UntranslatableIRTypes } from '$lib/forms/IN/formIN';
import type { HeatingCableLength, HoseLength, RoomUnitType } from '$lib/forms/NK/formNK';
import type { HeatTransferFluidType } from '$lib/forms/UPS/formUPS';
import type { PanelOrientations } from '$lib/forms/UPF/formUPF';
import type { HeatPump, IndoorUnit } from '$lib/helpers/products';

export type US = string & { untranslatable: true }

export type Untranslatable =
    | ''
    | US
    | HeatPump
    | IndoorUnit
    | OptionsInputsC
    | OptionsInputsB
    | OptionsOutputsF
    | OptionsOutputsB
    | UntranslatableIRTypes
    | IRSubTypes
    | 'DG-450-B'
    | HoseLength
    | HeatingCableLength
    | RoomUnitType
    | HeatTransferFluidType
    | PanelOrientations