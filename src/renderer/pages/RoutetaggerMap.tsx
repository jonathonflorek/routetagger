import * as React from 'react';
import { Map, Marker, TileLayer, Popup, Polyline } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { LatLng } from '../store/actions';

export interface RoutetaggerMapProps {
    position: LatLng;
    zoom: number;
    sensors: Sensor[];
    selectedSensorId?: string;

    sensorSelected(sensorId: string): void;
    sensorUnselected(): void;
    sensorPathUpdate(sensorId: string, path: LatLng[]): void;
}

interface Sensor {
    id: string;
    description: string;
    position: LatLng;
    waypoints: LatLng[];
    pathGeometry: LatLng[];
}

export const RoutetaggerMap = (props: RoutetaggerMapProps) => (
    <Map
        center={props.position}
        zoom={props.zoom}
        onclick={props.selectedSensorId && ((event) => props.sensorPathUpdate(
            props.selectedSensorId!,
            props.sensors.find(x => x.id === props.selectedSensorId)!.waypoints.concat({lat: event.latlng.lat, lng: event.latlng.lng})
            )) || undefined}
    >
        <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
        />
        {props.sensors.map(sensor => [
            <Marker
                icon={getPinIcon(sensor.id === props.selectedSensorId ? 'done' : 'default')}
                key={sensor.id}
                position={sensor.position}
                keyboard={true}
                riseOnHover={true}
                onclick={sensor.id === props.selectedSensorId ? props.sensorUnselected : (() => props.sensorSelected(sensor.id))}
                zIndexOffset={sensor.id === props.selectedSensorId ? 1 : 0}
            >
                <Popup>{sensor.id} {sensor.description}</Popup>
            </Marker>,
            // sensor.pathGeometry.length > 1 ? <Polyline
            //     key={sensor.id + 'line'}
            //     positions={[]}
            // /> : undefined,
            sensor.id === props.selectedSensorId ? sensor.waypoints.map((pos, index) => (
                <Marker
                    icon={getWaypointIcon((index + 1).toString())}
                    key={sensor.id + '.' + index}
                    position={pos}
                    draggable={true}
                    // ondragend={(event) => props.sensorWaypointMoved(sensor.id, index, getLatLon(event.target.getLatLng()))}
                    ondragend={(event) => props.sensorPathUpdate(
                        sensor.id,
                        sensor.waypoints.map((way, i) => i === index ? getLatLon(event.target.getLatLng()) : way)
                    )}
                    keyboard={false}
                />
            )) : undefined,
        ])}
    </Map>
);

function getLatLon({lat, lng}: any) {
    return {
        lat,
        lng,
    };
}

function getPinIcon(status: 'error' | 'done' | 'pending' | 'default') {
    // based on https://stackoverflow.com/a/40870439
    const icon = divIcon({
        iconAnchor: [0, 24],
        popupAnchor: [0, -36],
        html: `<span class="routetagger-pin routetagger-pin-${status}"/>`
    })
    return icon
}

function getWaypointIcon(text: string) {
    return divIcon({
        iconAnchor: [0, 24],
        popupAnchor: [0, -36],
        html: `
            <span class="routetagger-pin routetagger-pin-route">
                <span class="routetagger-pin-route-text">${text}</span>
            </span>
        `
    })
}
