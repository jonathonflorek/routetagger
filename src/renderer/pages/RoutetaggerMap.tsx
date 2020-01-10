import * as React from 'react';
import { Map, Marker, TileLayer, Popup, Polyline } from 'react-leaflet';
import { divIcon, DragEndEvent } from 'leaflet';
import { LatLng } from '../store/actions';

export interface RoutetaggerMapProps {
    position: LatLng;
    zoom: number;
    sensors: {[sensorId: string]: Sensor};
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

interface SensorWaypointViewProps {
    index: number;
    position: LatLng;

    onMoved(newPosition: LatLng, index: number): void;
    onRemoved(index: number): void;
}

class SensorWaypointView extends React.PureComponent<SensorWaypointViewProps> {
    public render() {
        return <>
            <Marker
                icon={this.getWaypointIcon()}
                position={this.props.position}
                draggable={true}
                ondragend={this.ondragend}
                onclick={this.onclick}
            />
        </>;
    }

    private ondragend = (event: DragEndEvent) => {
        this.props.onMoved(event.target.getLatLng(), this.props.index);
    }

    private onclick = () => {
        this.props.onRemoved(this.props.index);
    }
    
    private getWaypointIcon() {
        return divIcon({
            iconAnchor: [0, 24],
            popupAnchor: [0, -36],
            html: `
                <span class="routetagger-pin routetagger-pin-route">
                    <span class="routetagger-pin-route-text">${this.props.index}</span>
                </span>
            `
        });
    }
}

interface SensorViewProps {
    id: string;
    title: string;
    position: LatLng;
    waypointPositions: LatLng[];
    geometryPositions: LatLng[];
    isSelected: boolean;

    onSensorSelect(id: string | null): void;
    onWaypointsUpdated(waypointPositions: LatLng[], id: string): void;
}

class SensorView extends React.PureComponent<SensorViewProps> {
    public render() {
        const zIndexOffset = this.props.isSelected ? 1 : 0;
        const geometryLineColor = this.props.isSelected ? 'blue' : 'green';
        const geometryLineWeight = this.props.isSelected ? 12 : 3;
        return <>
            <Marker
                icon={this.getSensorIcon()}
                position={this.props.position}
                zIndexOffset={zIndexOffset}
                onclick={this.onclick}
            >
                <Popup closeButton={false} >{this.props.title}</Popup>
            </Marker>
            {this.props.geometryPositions.length > 1 ? <Polyline
                positions={this.props.geometryPositions}
                color={geometryLineColor}
                weight={geometryLineWeight}
            /> : undefined}
            {this.props.isSelected ? this.props.waypointPositions.map((position, index) => (
                <SensorWaypointView
                    index={index}
                    position={position}

                    onMoved={this.onWaypointMoved}
                    onRemoved={this.onWaypointRemoved}
                />
            )) : undefined}
        </>
    }

    private onWaypointMoved = (newPosition: LatLng, index: number) => {
        const newWaypoints = this.props.waypointPositions.map((way, i) => i !== index ? way : newPosition);
        this.props.onWaypointsUpdated(newWaypoints, this.props.id);
    }

    private onWaypointRemoved = (index: number) => {
        const newWaypoints = this.props.waypointPositions.filter((_, i) => i !== index);
        this.props.onWaypointsUpdated(newWaypoints, this.props.id);
    }

    private onclick = () => {
        if (this.props.isSelected) {
            this.props.onSensorSelect(null);
        } else {
            this.props.onSensorSelect(this.props.id);
        }
    }

    private getSensorIcon() {
        return divIcon({
            iconAnchor: [0, 24],
            popupAnchor: [0, -36],
            html: `<span class="routetagger-pin routetagger-pin-${this.getStatus()}"/>`
        });
    }

    private getStatus() {
        if (this.props.isSelected) {
            return 'pending';
        }
        if (this.props.waypointPositions.length === 0) {
            return 'default';
        }
        if (this.props.waypointPositions.length === 1) {
            return 'error';
        }
        return 'done';
    }
}

export const RoutetaggerMap = (props: RoutetaggerMapProps) => (
    <Map
        center={props.position}
        zoom={props.zoom}
        onclick={props.selectedSensorId && ((event) => props.sensorWaypointsUpdate(
            props.selectedSensorId!,
            props.sensors[props.selectedSensorId!].waypoints.concat({lat: event.latlng.lat, lng: event.latlng.lng})
            )) || undefined}
    >
        <TileLayer
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            attribution='&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors'
        />
        {mapIndexToArray(props.sensors, sensor => <SensorView
            id={sensor.id}
            title={sensor.id + ' ' + sensor.description}
            position={sensor.position}
            isSelected={sensor.id === props.selectedSensorId}
            waypointPositions={sensor.waypoints}
            geometryPositions={sensor.geometry}

            onSensorSelect={(id) => id !== null ? props.sensorSelected(id) : props.sensorUnselected()}
            onWaypointsUpdated={(waypoints, id) => props.sensorWaypointsUpdate(id, waypoints)}
        />)}
    </Map>
);

function mapIndexToArray<T,R>(index: {[id: string]: T}, callback: (value: T, id: string) => R): R[] {
    const result = [];
    for (const key in index) {
        if (Object.prototype.hasOwnProperty.call(index, key)) {
            result.push(callback(index[key], key));
        }
    }
    return result;
}
