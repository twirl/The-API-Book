export interface IFormattedPrice {
    decimalValue: string;
    formattedValue: string;
    currencyCode: string;
}

export interface IFormattedDistance {
    numericValueMeters: number;
    formattedValue: string;
}

export interface IFormattedDuration {
    intervalValueSeconds: number;
    formattedValue: string;
}

export interface IEventEmitter<EventList extends Record<string, any>> {
    on: <Type extends Extract<keyof EventList, string>>(
        type: Type,
        callback: (event: EventList[Type]) => void
    ) => IDisposer;

    emit: <Type extends Extract<keyof EventList, string>>(
        type: Type,
        event: EventList[Type]
    ) => void;
}

export interface IDisposer {
    off: () => void;
}

export type IExtraFields = Record<string, any>;

export class ILocation {
    longitude: number;
    latitude: number;
}
