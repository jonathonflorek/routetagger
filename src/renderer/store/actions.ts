export const FILE_SELECTED = 'FILE_SELECTED';
export const FILE_LOADED = 'FILE_LOADED';
export const FILE_FAILED = 'FILE_FAILED';

export interface Sensor {
    id: string;
    description: string;
    position: LatLon
}

export interface LatLon {
    lat: number;
    lon: number;
}

export function selectFile(filename: string): Action {
    return {
        type: FILE_SELECTED,
        payload: { filename },
    };
}

export function loadFile(filename: string, sensors: Sensor[]): Action {
    return {
        type: FILE_LOADED,
        payload: { filename, sensors },
    };
}

export function loadFileFailed(filename: string, reason: string): Action {
    return {
        type: FILE_FAILED,
        payload: { filename, reason }
    };
}

interface PayloadMap {
    [FILE_SELECTED]: {
        filename: string;
    };
    [FILE_LOADED]: {
        filename: string;
        sensors: Sensor[];
    };
    [FILE_FAILED]: {
        filename: string;
        reason: string;
    };
}
export type Action = ActionsOfPayloads<PayloadMap>

export type ActionsOfPayloads<TPayloadMap extends {[key: string]: any}> = {
    [K in keyof TPayloadMap]: {
        type: K;
        payload: TPayloadMap[K];
    }
}[keyof TPayloadMap];
