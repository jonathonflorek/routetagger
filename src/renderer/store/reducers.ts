import { Sensor, Action, FILE_SELECTED, FILE_LOADED, FILE_FAILED } from './actions';

export interface FileState {
    loadedFilename?: string;
    selectedFilename?: string;
    sensors: {
        [sensorId: string]: Sensor;
    };
    error?: string;
}

const initialFileState: FileState = {
    sensors: {},
};

export function reduceFile(state = initialFileState, action: Action): FileState {
    if (action.type === FILE_SELECTED) {
        return {
            ...state,
            selectedFilename: action.payload.filename,
        };
    }
    if (action.type === FILE_LOADED) {
        return {
            ...state,
            loadedFilename: action.payload.filename,
            sensors: index(action.payload.sensors, 'id'),
            error: undefined,
        };
    }
    if (action.type === FILE_FAILED) {
        return {
            ...state,
            loadedFilename: action.payload.filename,
            sensors: {},
            error: action.payload.reason,
        };
    }
    return state;
}

function index<T>(items: T[], key: keyof T) {
    return items.reduce((map, value) => {
        const id = String(value[key]);
        map[id] = value;
        return map;
    }, {} as {[key: string]: T});
}
