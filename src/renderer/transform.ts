import { LatLng } from '../common/types';

export function pathToString(path: LatLng[]): string {
    return path.map(({lat, lng}) => [lat, lng].join('/')).join(';');
}

export function stringToPath(path: string = ''): LatLng[] {
    return path.split(';').filter(x => x).map(position => {
        const [lat, lng] = position.split('/').map(Number);
        return {lat, lng};
    });
}
