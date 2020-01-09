import { ipcRenderer } from 'electron'
import { createStore, applyMiddleware } from 'redux';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { reduceFile, FileState } from './store/reducers'
import { RoutetaggerMap } from './pages/RoutetaggerMap'
import { FILE_OPEN_CHANNEL } from '../common/constants';
import { selectFile, Action, FILE_SELECTED, loadFileFailed, Sensor, loadFile, selectSensor, unselectSensor, LatLon, pushSensorWaypoint, moveSensorWaypoint } from './store/actions';
import * as csv from 'csv-parser';
import * as fs from 'fs';

const store = createStore(
    reduceFile,
    applyMiddleware(_ => next => async (action: Action) => {
        next(action);
        if (action.type === FILE_SELECTED) {
            try {
                const sensors = await new Promise<Sensor[]>((resolve, reject) => {
                    const results: Sensor[] = [];
                    fs.createReadStream(action.payload.filename)
                        .pipe(csv())
                        .on('error', reject)
                        .on('data', (data) => {
                            results.push({
                                id: data.id,
                                description: data.description,
                                position: {
                                    lat: data.lat,
                                    lon: data.lng,
                                },
                                waypoints: [],
                            });
                        })
                        .on('end', () => resolve(results));
                });
                next(loadFile(action.payload.filename, sensors));
            } catch (ex) {
                next(loadFileFailed(action.payload.filename, ex.message));
            }
        }
    }));
(window as any).store = store;

function mapStateToProps(state: FileState) {
    return {
        position: [43.6532, -79.3832] as [number, number],
        zoom: 13,
        sensors: Object.values(state.sensors).map(sensor => ({
            id: sensor.id,
            description: sensor.description,
            position: toPosition(sensor.position),
            waypoints: sensor.waypoints.map(toPosition),
        })),
        selectedSensorId: state.selectedSensorId,
    };
}

function mapDispatchToProps(dispatch: typeof store.dispatch) {
    return {
        sensorSelected: (sensorId: string) => dispatch(selectSensor(sensorId)),
        sensorUnselected: () => dispatch(unselectSensor()),
        sensorWaypointAdded: (sensorId: string, latlon: LatLon) => dispatch(pushSensorWaypoint(sensorId, latlon)),
        sensorWaypointMoved: (sensorId: string, index: number, latlon: LatLon) => dispatch(moveSensorWaypoint(sensorId, index, latlon)),
    }
}

function toPosition({lat, lon}: {lat: number, lon: number}) {
    return [lat, lon] as [number, number];
}

const Root = connect(mapStateToProps, mapDispatchToProps)(RoutetaggerMap);

const rootElement = document.getElementById('react-root');
ReactDOM.render(
    <Provider store={store}>
        <Root/>
    </Provider>,
    rootElement);

ipcRenderer.on(FILE_OPEN_CHANNEL, (_, fileName: string) => store.dispatch(selectFile(fileName)));
