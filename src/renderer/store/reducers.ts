import {
    Sensor,
    Action,
    FILE_SELECTED,
    FILE_LOADED,
    FILE_FAILED,
    SENSOR_SELECTED,
    SENSOR_UNSELECTED,
    SENSOR_WAYPOINTS_UPDATE,
    SENSOR_GEOMETRY_UPDATE,
} from './actions';

export interface FileState {
    loadedFilename?: string;
    selectedFilename?: string;
    sensors: {
        [sensorId: string]: Sensor;
    };
    error?: string;
    selectedSensorId?: string;
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
    if (action.type === SENSOR_SELECTED) {
        return {
            ...state,
            selectedSensorId: action.payload.sensorId,
        };
    }
    if (action.type === SENSOR_UNSELECTED) {
        return {
            ...state,
            selectedSensorId: undefined,
        };
    }
    if (action.type === SENSOR_WAYPOINTS_UPDATE) {
        const { sensorId, waypoints: path } = action.payload;
        return {
            ...state,
            sensors: {
                ...state.sensors,
                [sensorId]: {
                    ...state.sensors[sensorId],
                    waypoints: path,
                },
            },
        };
    }
    if (action.type === SENSOR_GEOMETRY_UPDATE) {
        const { sensorId, geometry, approxDistanceMeters } = action.payload;
        return {
            ...state,
            sensors: {
                ...state.sensors,
                [sensorId]: {
                    ...state.sensors[sensorId],
                    geometry: geometry,
                    approxDistanceMeters,
                },
            },
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
