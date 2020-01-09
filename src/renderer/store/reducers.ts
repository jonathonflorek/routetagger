import { Sensor, Action, FILE_SELECTED, FILE_LOADED } from './actions';

export interface FileState {
    loadedFilename?: string;
    selectedFilename?: string;
    sensors: {
        [sensorId: string]: Sensor;
    };
}

const initialFileState: FileState = {
    sensors: {},
};

function reduceFile(state = initialFileState, action: Action): FileState {
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
        };
    }
    return state;
}

function index<T>(items: T[], key: keyof T): {[key: string]: T} {
    return items.reduce((map, value) => {
        map[value[key]] = value;
    }, {} as any);
}
