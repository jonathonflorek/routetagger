import * as React from 'react';
import { Map, Marker, TileLayer, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { LatLon } from '../store/actions';

export interface RoutetaggerMapProps {
    position: Position;
    zoom: number;
    sensors: Sensor[];
    selectedSensorId?: string;

    sensorSelected(sensorId: string): void;
    sensorUnselected(): void;
    sensorWaypointAdded(sensorId: string, position: LatLon): void;
    sensorWaypointMoved(sensorId: string, index: number, position: LatLon): void;
}

interface Sensor {
    id: string;
    description: string;
    position: Position;
    waypoints: Position[];
}

type Position = [number, number];

export const RoutetaggerMap = (props: RoutetaggerMapProps) => (
    <Map
        center={props.position}
        zoom={props.zoom}
        onclick={props.selectedSensorId && ((event) => props.sensorWaypointAdded(props.selectedSensorId!, {lat: event.latlng.lat, lon: event.latlng.lng})) || undefined}
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
            sensor.id === props.selectedSensorId ? sensor.waypoints.map((pos, index) => (
                <Marker
                    icon={getWaypointIcon((index + 1).toString())}
                    key={sensor.id + '.' + index}
                    position={pos}
                    draggable={true}
                    ondragend={(event) => props.sensorWaypointMoved(sensor.id, index, getLatLon(event.target.getLatLng()))}
                    keyboard={false}
                />
            )) : undefined,
        ])}
    </Map>
);

function getLatLon({lat, lng}: any) {
    return {
        lat,
        lon: lng,
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
