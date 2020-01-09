import { ipcRenderer } from 'electron'
import { createStore, applyMiddleware } from 'redux';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { connect, Provider } from 'react-redux';
import { reduceFile, FileState } from './store/reducers'
import { RoutetaggerMap, MapProps } from './pages/RoutetaggerMap'
import { fileOpenChannel } from '../common/constants';
import { selectFile, Action, FILE_SELECTED, loadFileFailed, Sensor, loadFile } from './store/actions';
import * as csv from 'csv-parser';
import * as fs from 'fs';

const store = createStore(
    reduceFile,
    applyMiddleware(store => next => async (action: Action) => {
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

function mapStateToProps(state: FileState): MapProps {
    return {
        position: [43.6532, -79.3832],
        zoom: 13,
        sensors: Object.values(state.sensors).map(sensor => ({
            id: sensor.id,
            description: sensor.description,
            position: [sensor.position.lat, sensor.position.lon],
        })),
    };
}

const Root = connect(mapStateToProps)(RoutetaggerMap);

const rootElement = document.getElementById('react-root');
ReactDOM.render(
    <Provider store={store}>
        <Root/>
    </Provider>,
    rootElement);

ipcRenderer.on(fileOpenChannel, (_, fileName: string) => store.dispatch(selectFile(fileName)));
