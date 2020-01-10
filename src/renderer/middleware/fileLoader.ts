import { Middleware } from 'redux';
import { Action, FILE_SELECTED, Sensor, loadFile, loadFileFailed } from '../store/actions';
import { createReadStream } from 'fs';
import * as csv from 'csv-parser';

export const fileLoader: Middleware = _ => next => (action: Action) => {
    next(action);

    if (action.type === FILE_SELECTED) {
        const { filename } = action.payload;
        const results: Sensor[] = [];
        createReadStream(filename)
            .pipe(csv())
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
            .on('end', () => {
                next(loadFile(filename, results));
            })
            .on('error', (err) => {
                next(loadFileFailed(filename, err.message));
            });
    }
};
