import * as React from 'react';
import { Map, Marker, TileLayer, Popup } from 'react-leaflet';

interface MapProps {
    position: Position;
    zoom: number;
    sensors: Sensor[];
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
            <Marker position={sensor.position}>
                <Popup>{sensor.id} {sensor.description}</Popup>
            </Marker>
        ))}
    </Map>
);
