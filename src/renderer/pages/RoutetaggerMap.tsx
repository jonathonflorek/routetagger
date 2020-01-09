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
    sensorWaypointsUpdate(sensorId: string, path: LatLng[]): void;
}

interface Sensor {
    id: string;
    description: string;
    position: LatLng;
    waypoints: LatLng[];
    geometry: LatLng[];
}

export const RoutetaggerMap = (props: RoutetaggerMapProps) => (
    <Map
        center={props.position}
        zoom={props.zoom}
        onclick={props.selectedSensorId && ((event) => props.sensorWaypointsUpdate(
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
                icon={getPinIcon(getSensorStatus(sensor, props.selectedSensorId))}
                key={sensor.id}
                position={sensor.position}
                keyboard={true}
                riseOnHover={true}
                onclick={sensor.id === props.selectedSensorId ? props.sensorUnselected : (() => props.sensorSelected(sensor.id))}
                zIndexOffset={sensor.id === props.selectedSensorId ? 1 : 0}
            >
                <Popup closeButton={false} >{sensor.id} {sensor.description}</Popup>
            </Marker>,
            sensor.geometry.length > 1 ? <Polyline
                key={sensor.id + 'line'}
                positions={sensor.geometry}
                color={sensor.id === props.selectedSensorId ? 'blue' : 'green'}
                weight={sensor.id === props.selectedSensorId ? 12 : 3}
            /> : undefined,
            sensor.id === props.selectedSensorId ? sensor.waypoints.map((pos, index) => (
                <Marker
                    icon={getWaypointIcon((index + 1).toString())}
                    key={sensor.id + '.' + index}
                    position={pos}
                    draggable={true}
                    ondragend={(event) => props.sensorWaypointsUpdate(
                        sensor.id,
                        sensor.waypoints.map((way, i) => i === index ? getLatLon(event.target.getLatLng()) : way)
                    )}
                    onclick={(_) => props.sensorWaypointsUpdate(sensor.id, sensor.waypoints.filter((_, i) => i !== index))}
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

function getSensorStatus(sensor: Sensor, selectedSensorId?: string): 'error' | 'done' | 'pending' | 'default' {
    if (sensor.id === selectedSensorId) {
        return 'pending';
    }
    if (sensor.waypoints.length === 0) {
        return 'default';
    }
    if (sensor.waypoints.length === 1) {
        return 'error';
    }
    return 'done';
}
