import { Middleware } from 'redux';
import { Action, FILE_SELECTED, Sensor, loadFile, loadFileFailed, FILE_SAVE } from '../store/actions';
import * as fs from 'fs';
import * as csv from 'csv-parser';
import { stringToPath, pathToString } from '../transform';
import { FileState } from '../store/reducers';
import { createObjectCsvWriter } from 'csv-writer';

export const fileLoader: Middleware<{}, FileState> = store => next => (action: Action) => {
    next(action);

    if (action.type === FILE_SELECTED) {
        const { filename } = action.payload;
        const results: Sensor[] = [];
        fs.createReadStream(filename)
            .pipe(csv())
            .on('data', (data) => {
                results.push({
                    id: data.id,
                    description: data.description,
                    position: {
                        lat: data.lat,
                        lng: data.lng,
                    },
                    waypoints: stringToPath(data.waypoints),
                    geometry: stringToPath(data.geometry),
                    approxDistanceMeters: data.distance,
                });
            })
            .on('end', () => {
                next(loadFile(filename, results));
            })
            .on('error', (err) => {
                next(loadFileFailed(filename, err.message));
            });
    }

    if (action.type === FILE_SAVE) {
        const filename = store.getState().loadedFilename;
        if (!filename) {
            return;
        }

        const sensors = Object.values(store.getState().sensors).sort((a, b) => a.id.localeCompare(b.id));
        const toWrite = sensors.map(sensor => ({
            id: sensor.id,
            description: sensor.description,
            lat: sensor.position.lat,
            lng: sensor.position.lng,
            distance: sensor.approxDistanceMeters,
            waypoints: pathToString(sensor.waypoints),
            geometry: pathToString(sensor.geometry),
        }));
        const csvWriter = createObjectCsvWriter({
            append: false,
            path: filename,
            header: [
                'id',
                'description',
                'lat',
                'lng',
                'waypoints',
                'geometry',
                'distance',
            ].map(getCsvHeaderEntry),
        });
        csvWriter.writeRecords(toWrite);
        console.log('saved');
    }
};

function getCsvHeaderEntry(key: string) {
    return { id: key, title: key };
}
