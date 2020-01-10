import { ipcRenderer } from 'electron'
import { createStore, applyMiddleware } from 'redux';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'react-redux';
import { reduceFile } from './store/reducers';
import { FILE_OPEN_CHANNEL } from '../common/constants';
import {
    selectFile,
} from './store/actions';
import { MapScreen } from './screens/mapScreen';
import { fileLoader } from './middleware/fileLoader';
import { geometryMapper } from './middleware/geometryMapper';

const store = createStore(
    reduceFile,
    applyMiddleware(
        fileLoader,
        geometryMapper({
            osrmUrl: 'http://router.project-osrm.org',
        }),
    ));
(window as any).store = store;

const rootElement = document.getElementById('react-root');
ReactDOM.render(
    <Provider store={store}>
        <MapScreen/>
    </Provider>,
    rootElement);

ipcRenderer.on(FILE_OPEN_CHANNEL, (_, fileName: string) => store.dispatch(selectFile(fileName)));
