import { ipcRenderer } from 'electron'
import { createStore, applyMiddleware } from 'redux';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { reduceFile, FileState } from './store/reducers'
import { RoutetaggerMap } from './pages/RoutetaggerMap'
import { FILE_OPEN_CHANNEL } from '../common/constants';
import {
    selectFile,
    Action,
    FILE_SELECTED,
    loadFileFailed,
    Sensor,
    loadFile,
    selectSensor,
    unselectSensor,
    LatLng,
    updateSensorWaypoints,
    SENSOR_WAYPOINTS_UPDATE,
    updateSensorGeometry,
} from './store/actions';
import * as csv from 'csv-parser';
import * as fs from 'fs';
import axios from 'axios';

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
                                    lng: data.lng,
                                },
                                waypoints: [],
                                geometry: [],
                            });
                        })
                        .on('end', () => resolve(results));
                });
                next(loadFile(action.payload.filename, sensors));
            } catch (ex) {
                next(loadFileFailed(action.payload.filename, ex.message));
            }
        }
        if (action.type === SENSOR_WAYPOINTS_UPDATE) {
            const { waypoints: path, sensorId } = action.payload;
            if (action.payload.waypoints.length > 1) {
                const result = await axios.get(`http://router.project-osrm.org/route/v1/driving/${path.map(way => `${way.lng},${way.lat}`).join(';')}?geometries=geojson`);
                try {
                    const route = result.data.routes[0];
                    const geometry = (route.geometry.coordinates as any[]).map(([lng,lat]: [number,number]) => ({lng,lat}));
                    const distanceMeters = route.distance;
                    console.info(geometry);
                    next(updateSensorGeometry(sensorId, geometry, distanceMeters));
                } catch (ex) {
                    console.error(ex);
                }
            } else {
                next(updateSensorGeometry(sensorId, []))
            }
        }
    }));
(window as any).store = store;

function mapStateToProps(state: FileState) {
    return {
        position: { lat:43.6532, lng:-79.3832 },
        zoom: 13,
        sensors: state.sensors,
        selectedSensorId: state.selectedSensorId,
    };
}

function mapDispatchToProps(dispatch: typeof store.dispatch) {
    return {
        sensorSelected: (sensorId: string) => dispatch(selectSensor(sensorId)),
        sensorUnselected: () => dispatch(unselectSensor()),
        sensorWaypointsUpdate: (sensorId: string, path: LatLng[]) => dispatch(updateSensorWaypoints(sensorId, path)),
    }
}

const Root = connect(mapStateToProps, mapDispatchToProps)(RoutetaggerMap);

const rootElement = document.getElementById('react-root');
ReactDOM.render(
    <Provider store={store}>
        <Root/>
    </Provider>,
    rootElement);

ipcRenderer.on(FILE_OPEN_CHANNEL, (_, fileName: string) => store.dispatch(selectFile(fileName)));
