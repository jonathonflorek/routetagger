import { Middleware } from 'redux';
import { Action, SENSOR_WAYPOINTS_UPDATE, updateSensorGeometry } from '../store/actions';
import axios from 'axios';

export interface GeometryMapperConfig {
    osrmUrl: string;
}

export function geometryMapper({ osrmUrl }: GeometryMapperConfig): Middleware {
    return _ => next => async (action: Action) => {
        next(action);

        if (action.type === SENSOR_WAYPOINTS_UPDATE) {
            const { waypoints, sensorId } = action.payload;
            if (waypoints.length > 1) {
                const waypointsString = waypoints.map(w => w.lng + ',' + w.lat).join(';');
                const requestUrl = `${osrmUrl}/route/v1/driving/${waypointsString}?geometries=geojson`;
                const result = await axios.get(requestUrl);
                const route = result.data.routes[0];
                const geometry = (route.geometry.coordinates as any[]).map(([lng, lat]) => ({lng, lat}));
                next(updateSensorGeometry(sensorId, geometry, route.distance));
            } else {
                // clear sensor geometry because anything <2 waypoints is not a valid line
                next(updateSensorGeometry(sensorId, []));
            }
        }
    };
}
