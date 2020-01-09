import * as React from 'react';
import { Map, Marker, TileLayer, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';

export interface MapProps {
    position: Position;
    zoom: number;
    sensors: Sensor[];
    selectedSensorId?: string;

    sensorSelected(sensorId: string): void;
    sensorUnselected(): void;
}

interface Sensor {
    id: string;
    description: string;
    position: Position;
}

type Position = [number, number];

export const RoutetaggerMap = (props: MapProps) => (
    <Map center={props.position} zoom={props.zoom}>
        <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
        />
        {props.sensors.map(sensor => (
            <Marker
                icon={getPinIcon('default')}
                key={sensor.id}
                position={sensor.position}
                keyboard={true}
                riseOnHover={true}
            >
                <Popup>{sensor.id} {sensor.description}</Popup>
            </Marker>
        ))}
    </Map>
);

function getPinIcon(status: 'error' | 'done' | 'pending' | 'default') {
    // based on https://stackoverflow.com/a/40870439
    const icon = divIcon({
        iconAnchor: [0, 24],
        popupAnchor: [0, -36],
        html: `<span class="routetagger-pin routetagger-pin-${status}"/>`
    })
    return icon
}
