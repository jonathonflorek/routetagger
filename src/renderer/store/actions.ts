export const FILE_SELECTED = 'FILE_SELECTED';
export const FILE_LOADED = 'FILE_LOADED';

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

export interface ActionPayloads {
    [FILE_SELECTED]: {
        filename: string;
    };
    [FILE_LOADED]: {
        filename: string;
        sensors: Sensor[];
    }
}
export type Action = { [K in keyof ActionPayloads]: {
    type: K;
    payload: ActionPayloads[K];
} }[keyof ActionPayloads];
