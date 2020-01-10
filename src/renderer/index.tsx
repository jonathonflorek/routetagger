import { createStore, applyMiddleware } from 'redux';
import * as ReactDOM from 'react-dom';
import * as React from 'react';
import { Provider } from 'react-redux';
import { reduceFile } from './store/reducers';
import { MapScreen } from './screens/mapScreen';
import { fileLoader } from './middleware/fileLoader';
import { geometryMapper } from './middleware/geometryMapper';
import { registerIpcDispatch } from './ipc';

const store = createStore(
    reduceFile,
    applyMiddleware(
        fileLoader,
        geometryMapper({
            osrmUrl: 'http://router.project-osrm.org',
        }),
    ));
(window as any).store = store;

registerIpcDispatch(store.dispatch);

const rootElement = document.getElementById('react-root');
ReactDOM.render(
    <Provider store={store}>
        <MapScreen/>
    </Provider>,
    rootElement);
